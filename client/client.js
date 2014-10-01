arrayMinusArray = function(x, y) {
    return _.without.apply(_, [x].concat(y));
};

Router.map(function () {
    this.route('create', {path: '/'});
    this.route('view', {path: 'my-johari/:_privateGUID'});
    this.route('submitted', {path: '/submitted'});
    this.route('submit', {path: '/:_publicGUID'});
});

Session.set("adjectiveChoiceMonitor", 0);
Session.set("username", "");
Session.set("selectedAdjectives", []);

Template.adjectiveChooser.adjectives = function() {
    return allAdjectives;
}; 

Template.adjectiveChooser.events({
    'click li.adjective': function() {
        var selectedAdjectives = Session.get('selectedAdjectives');
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
        Session.set("adjectiveChoiceMonitor", 1); // toggle choice-response
    }
});

Template.adjectiveChooser.isSelected = function() {
    var selectedAdjectives = Session.get('selectedAdjectives');
    var curAdjective = this.name;
    if (_.contains(selectedAdjectives, this.name)) {
        return 'selected';
    }
};

Template.adjectiveChooser.numSelected = function () {
    var selectedAdjectives = Session.get('selectedAdjectives');
    return selectedAdjectives.length;
};

Template.adjectiveChooser.validSelection = function () {
    var selectedAdjectives = Session.get('selectedAdjectives');
    return selectedAdjectives.length == 3;
};

Template.create.events({
    'blur .name': function(theEvent, theTemplate) {
        Session.set("username", theTemplate.find('.name').value);
    }
});

Template.create.respondToAdjectiveChoice = function () {
    if (Session.get("adjectiveChoiceMonitor") == 1) {
        Session.set("adjectiveChoiceMonitor", 0);
        var username = Session.get("username");
        var adjectives = Session.get('selectedAdjectives');
        Meteor.call("createUser", username, adjectives, function(error, result) {
            Router.go('view', {_privateGUID: result.privateGUID});
        });
    }
    return null;
};

Template.view.loadData = function() {
    Meteor.subscribe('userPrivateData', Router.current().params._privateGUID);
    Meteor.subscribe('userAdjectives', Router.current().params._privateGUID);
};

Template.view.name = function () {
    var nameRecord = Names.find().fetch()[0];
    return (nameRecord) ? nameRecord.name : null;
};

Template.view.publicLink = function () {
    var nameRecord = Names.find().fetch()[0];
    return Router.routes['submit'].url({_publicGUID: nameRecord.publicGUID});
};

Template.view.privateLink = function () {
    var nameRecord = Names.find().fetch()[0];
    return Router.routes['view'].url({_privateGUID: nameRecord.privateGUID});
};

Template.view.tallies = function () {
    var tallies = {
        arena: [],
        blindSpot: [],
        façade: [],
        unknown: []
    };

    var selfAdjectives = _.pluck(Adjectives.find({self: true}, {sort: ["adjective", "asc"]}).fetch(), "adjective");
    var friendData = Adjectives.find({self: false}, {sort: ["adjective", "asc"]}).fetch();
    var friendTallies = _.countBy(friendData, function(entry) {return entry.adjective; });
    var friendAdjectives = Object.keys(friendTallies);
    var allChosenAdjectives = selfAdjectives.concat(friendAdjectives);

    tallies.arena = _.intersection(selfAdjectives, friendAdjectives);
    tallies.blindSpot = arrayMinusArray(friendAdjectives, selfAdjectives);
    tallies.façade = arrayMinusArray(selfAdjectives, friendAdjectives);
    tallies.unknown = arrayMinusArray(_(allAdjectives).pluck("name").sort().value(), allChosenAdjectives);

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

Template.submit.respondToAdjectiveChoice = function () {
    if (Session.get("adjectiveChoiceMonitor") == 1) {
        Session.set("adjectiveChoiceMonitor", 0);
        var adjectives = Session.get('selectedAdjectives');
        Meteor.call("addAdjectives", Router.current().params._publicGUID, adjectives, function(error, result) {
            Router.go('submitted');
        });
    }
    return null;
};