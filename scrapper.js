// VENDOR LIBRARY
const stemmer = require('./vendor/porterStemmer');
// DIVIDED MODULES
const crawl = require('./mod/crawler');
const stopword = require('./mod/stopword');
// OPTIONAL LIBRARY
const colors = require('colors');


// CREATE INDEX FROM DOCUMENTS
var index = {
	// <word>: {
	// 	<document>: <frequency>
	// }
};

/**
 * MAIN FUNCTION
 */

crawl.extractLinks("https://www.cse.ust.hk").then((pageInfo) => {

	// GET PARENT-CHILD LINKING RELATIONSHIP OF ALL PAGES
	pageInfo.childLinks.forEach((link) => {
		crawl.extractLinks(`https://${link}`).then((childPageInfo) => {
			console.log(`${childPageInfo.title}:\n${link}`.underline.red);
			childPageInfo.childLinks.forEach((childLink) => {
				console.log(`\t${childLink}`);
			})
		})
	});
	// ------------------------------

}).catch((error) => {
	console.error(error);
})
