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

crawl.extractLinks("https://www.cse.ust.hk").then((page) => {

	console.log(page.lastModifiedDate);
	console.log(page.pageSize);
	console.log(page.title);

	// GET PARENT-CHILD LINKING RELATIONSHIP OF ALL PAGES
	page.childLinks.forEach((link) => {
		crawl.extractLinks(link).then((childPage) => {
			console.log(`${childPage.title}:\n${link}`.underline.red);
			childPage.childLinks.forEach((childLink) => {
				console.log(`\t${childLink}`);
			})
		})
	});
	// ------------------------------

}).catch((error) => {
	console.error(error);
})
