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
