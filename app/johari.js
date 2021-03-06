// shared globals

Names = new Meteor.Collection("names");
Adjectives = new Meteor.Collection("adjectives");

isValidNumberOfChoices = function(len) {
    return (len == 5) || (len == 6);
}

allAdjectives = [
    {name: "accents & dialects"},
    {name: "accepting offers"},
    {name: "adapting"},
    {name: "adventurousness"},
    {name: "audacity"},
    {name: "being in the moment"},
    {name: "being organic"},
    {name: "character work"},
    {name: "commitment"},
    {name: "coordination & group mind"},
    {name: "crowd work"},
    {name: "editing"},
    {name: "empathy"},
    {name: "energy"},
    {name: "experimentation"},
    {name: "finding the fun"},
    {name: "flexibility"},
    {name: "fun to play with"},
    {name: "generosity"},
    {name: "giving & taking focus"},
    {name: "group scenes"},
    {name: "heightening"},
    {name: "honesty"},
    {name: "justification"},
    {name: "leadership"},
    {name: "listening"},
    {name: "mischief"},
    {name: "narration"},
    {name: "patience"},
    {name: "physicality & movement"},
    {name: "playfulness"},
    {name: "professionalism"},
    {name: "promotion"},
    {name: "reincorporation"},
    {name: "scene painting"},
    {name: "shape of show"},
    {name: "showmanship"},
    {name: "side characters"},
    {name: "singing"},
    {name: "spacework"},
    {name: "specificity"},
    {name: "split scenes"},
    {name: "stage combat!"},
    {name: "stage pictures"},
    {name: "strong choices"},
    {name: "taking initiative"},
    {name: "theatercraft"},
    {name: "turning 'mistakes' into gifts"},
    {name: "vulnerability"},
    {name: "working with tech"}
]
