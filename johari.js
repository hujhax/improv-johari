adjectiveArray = [{name: "happy"},{name:"sad"},{name:"angry"},{name:"afraid"}];

Names = new Meteor.Collection("names");
Adjectives = new Meteor.Collection("adjectives");


if (Meteor.isClient) {
    Router.map(function () {
        this.route('create', {path: '/'});
        this.route('view', {path: 'my-johari/:_id'});
        this.route('submit', {path: '/:_id'});
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
                Router.go('view', {_id: result.guid});
            });
        }
        return null;
    };

    Template.view.curID = function () {
        return Router.current().params._id;
    };

    Template.submit.curID = function () {
        return Router.current().params._id;
    };
}

if (Meteor.isServer) {
    Meteor.startup(function() {
        // code to run on server at startup
    });

    Meteor.methods({
        'createUser': function(username, adjectives) {
            var newGUID = GPW.pronounceable(6);
            Names.insert({name: username, guid: newGUID});
            _(adjectives).forEach(function(adjective) {
                Adjectives.insert({guid: newGUID, self: true, adjective: adjective});
            });
            return {guid: newGUID};
        }
    });

    Meteor.publish('userName', function(guid) {
        return Names.find({guid: guid});
    });

    Meteor.publish('userAdjectives', function(guid) {
        return Adjectives.find({guid: guid});
    });


}
