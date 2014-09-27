adjectiveArray = [{name: "happy"},{name:"sad"},{name:"angry"},{name:"afraid"}];

if (Meteor.isClient) {
    Router.map(function () {
        this.route('create', {path: '/'});
        this.route('view', {path: 'my-johari/:_id'});
        this.route('submit', {path: '/:_id'});
        this.route('submitted');
    });

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
            var newGUID = GPW.pronounceable(6);
            Router.go('view', {_id: newGUID});
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

    Template.makeGuids.events({
        'click input.generate-guid': function () {
            var newGUID = GPW.pronounceable(6);
            Session.set('guid', newGUID);
        }
    });

    Template.makeGuids.guid = function () {
        var curGUID = Session.get('guid') || "";
        return curGUID;
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
}
