adjectiveArray = [{name: "happy"},{name:"sad"},{name:"angry"},{name:"afraid"}];

if (Meteor.isClient) {
  Template.hello.greeting = function () {
    return "Welcome to johari.";
  };

  Template.hello.events({
    'click input': function () {
      // template data, if any, is available in 'this'
      if (typeof console !== 'undefined')
        console.log("You pressed the button");
    }
  });

  Template.adjectives.adjective = function () {
    return adjectiveArray;
  };
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
