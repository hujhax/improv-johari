adjectiveArray = [{name: "happy"},{name:"sad"},{name:"angry"},{name:"afraid"}];

Names = new Meteor.Collection("names");
Adjectives = new Meteor.Collection("adjectives");


if (Meteor.isClient) {
    arrayMinusArray = function(x, y) {
        return _.without.apply(_, [x].concat(y));
    };

    Router.map(function () {
        this.route('create', {path: '/'});
        this.route('view', {path: 'my-johari/:_privateGUID'});
        this.route('submitted', {path: '/submitted'});
        this.route('submit', {path: '/:_publicGUID'});
    });

    Session.set("adjectiveButtonMonitor", 0);
    Session.set("username", "");

    Template.adjectives.adjective = function() {
        return adjectiveArray;
    };  

    Template.adjectives.events({
        'click li.adjective': function() {
            var selectedAdjectives = Session.get('selectedAdjectives') || [];
            var newSelection = [];

            if (_.contains(selectedAdjectives, this.name)) {
                newSelection = _.without(selectedAdjectives, this.name);
            }
            else {
                newSelection = selectedAdjectives;
                newSelection.push(this.name);
            }

            Session.set('selectedAdjectives', newSelection);
        },
        'submit form': function(theEvent) {
            theEvent.preventDefault();
            Session.set("adjectiveButtonMonitor", 1); // toggle value
        }
    });

    Template.adjectives.isSelected = function() {
        var selectedAdjectives = Session.get('selectedAdjectives');
        var curAdjective = this.name;
        if (_.contains(selectedAdjectives, this.name)) {
            return 'selected';
        }
    };

    Template.adjectives.numSelected = function () {
        var selectedAdjectives = Session.get('selectedAdjectives') || [];
        return selectedAdjectives.length;
    };

    Template.adjectives.validSelection = function () {
        var selectedAdjectives = Session.get('selectedAdjectives') || [];
        return selectedAdjectives.length == 3;
    };

    Template.create.events({
        'blur .name': function(theEvent, theTemplate) {
            Session.set("username", theTemplate.find('.name').value);
        }
    });
    
    Template.create.respondToAdjectiveButton = function () {
        if (Session.get("adjectiveButtonMonitor") == 1) {
            Session.set("adjectiveButtonMonitor", 0);
            var username = Session.get("username");
            var adjectives = Session.get('selectedAdjectives') || [];
            Meteor.call("createUser", username, adjectives, function(error, result) {
                Router.go('view', {_privateGUID: result.privateGUID});
            });
        }
        return null;
    };

    Template.view.curID = function () {
        return Router.current().params._privateGUID;
    };

    Template.view.loadData = function() {
        Meteor.subscribe('userPrivateData', Router.current().params._privateGUID);
        Meteor.subscribe('userAdjectives', Router.current().params._privateGUID);
    };

    Template.view.name = function () {
        var nameRecord = Names.find().fetch()[0];
        return (nameRecord) ? nameRecord.name : null;
    };

    Template.view.tallies = function () {
        var tallies = {
            arena: [],
            blindSpot: [],
            façade: [],
            unknown: []
        };

        var selfAdjectives = _.pluck(Adjectives.find({self: true}).fetch(), "adjective");
        var friendData = Adjectives.find({self: false}).fetch();
        var friendTallies = _.countBy(friendData, function(entry) {return entry.adjective; });
        var friendAdjectives = Object.keys(friendTallies);

        tallies.arena = _.intersection(selfAdjectives, friendAdjectives);
        tallies.blindSpot = arrayMinusArray(friendAdjectives, selfAdjectives);
        tallies.façade = arrayMinusArray(selfAdjectives, friendAdjectives);
        tallies.unknown = arrayMinusArray(_.pluck(adjectiveArray, "name"), selfAdjectives.concat(friendAdjectives));

        _.forEach(["arena", "blindSpot"], function(key) {
            tallies[key] = _.map(tallies[key], function(adjective) {
                return adjective + " (" + friendTallies[adjective] + ")";
            });
        });

        return tallies;
    };

    Template.submit.loadData = function() {
        Meteor.subscribe('userName', Router.current().params._publicGUID);
    };

    Template.submit.name = function () {
        var nameRecord = Names.find().fetch()[0];
        return (nameRecord) ? nameRecord.name : null;
    };

    Template.submit.curID = function () {
        return Router.current().params._publicGUID;
    };

    Template.submit.respondToAdjectiveButton = function () {
        if (Session.get("adjectiveButtonMonitor") == 1) {
            Session.set("adjectiveButtonMonitor", 0);
            var adjectives = Session.get('selectedAdjectives') || [];
            Meteor.call("addAdjectives", Router.current().params._publicGUID, adjectives, function(error, result) {
                Router.go('submitted');
            });
        }
        return null;
    };
}

if (Meteor.isServer) {
    Meteor.startup(function() {
        // code to run on server at startup
    });

    Meteor.methods({
        'createUser': function(username, adjectives) {
            var publicGUID = GPW.pronounceable(6);
            var privateGUID = GPW.pronounceable(6);
            Names.insert({name: username, publicGUID: publicGUID, privateGUID: privateGUID});
            _(adjectives).forEach(function(adjective) {
                Adjectives.insert({privateGUID: privateGUID, self: true, adjective: adjective});
            });
            return {privateGUID: privateGUID};
        },
        'addAdjectives': function(publicGUID, adjectives) {
            var privateGUID = Names.find({publicGUID: publicGUID}).fetch()[0].privateGUID;

            _(adjectives).forEach(function(adjective) {
                Adjectives.insert({privateGUID: privateGUID, self: false, adjective: adjective});
            });
            return {privateGUID: privateGUID};
        }
    });

    Meteor.publish('userPrivateData', function(privateGUID) {
        return Names.find({privateGUID: privateGUID});
    });

    Meteor.publish('userAdjectives', function(privateGUID) {
        return Adjectives.find({privateGUID: privateGUID});
    });

    Meteor.publish('userName', function(publicGUID) {
        return Names.find({publicGUID: publicGUID}, {fields: {privateGUID: 0}}); // keep the privateGUID private
    });
}
