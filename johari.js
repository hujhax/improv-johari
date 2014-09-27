adjectiveArray = [{name: "happy"},{name:"sad"},{name:"angry"},{name:"afraid"}];

Names = new Meteor.Collection("names");
Adjectives = new Meteor.Collection("adjectives");


if (Meteor.isClient) {
    Router.map(function () {
        this.route('create', {path: '/'});
        this.route('view', {path: 'my-johari/:_privateGUID'});
        this.route('submit', {path: '/:_publicGUID'});
        this.route('submitted');
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

    Template.view.selfAdjectives = function () {
        return Adjectives.find({self: true}).fetch();
    };

    Template.view.friendAdjectives = function () {
        return Adjectives.find({self: false}).fetch();
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
