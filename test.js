const { Brainly } = require("brainly-scraper-v2");
// You should do '.initialize()' for 1st time (v2.1.0 - higher)
Brainly.initialize();

const brain = new Brainly("id"); // 'id' - Default to 'id'

// You can do
brain.searchWithMT("Pythagoras", "es").then(console.log).catch(console.error);
// Or (You need to enter correctly country code in the constructor).
brain.search("Pythagoras", "es").then(console.log).catch(console.error);