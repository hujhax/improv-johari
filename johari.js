adjectiveArray = [{name: "happy"},{name:"sad"},{name:"angry"},{name:"afraid"}];

if (Meteor.isClient) {
    Template.hello.greeting = function() {
        return "Welcome to johari.";
    };

    Template.hello.events({
        'click input': function() {
            // template data, if any, is available in 'this'
            if (typeof console !== 'undefined')
                console.log("You pressed the button");
        }
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
    });

    Template.adjectives.isSelected = function() {
        var selectedAdjectives = Session.get('selectedAdjectives');
        var curAdjective = this.name;
        if (_.contains(selectedAdjectives, this.name)) {
            return 'selected';
        }
    };

    Template.adjectives.numSelected = function () {
        var selectedAdjectives = Session.get('selectedAdjectives');
        return selectedAdjectives.length;
    }
}

if (Meteor.isServer) {
    Meteor.startup(function() {
        // code to run on server at startup
    });
}
