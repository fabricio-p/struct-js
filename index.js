try {
	module.exports = require("./dist/index.js");
} catch(e) {
	console.error("Make sure you build the project with typescript before using it");
}
