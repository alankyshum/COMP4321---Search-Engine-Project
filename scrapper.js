// VENDOR LIBRARY
const stemmer = require('./vendor/porterStemmer');
// DIVIDED MODULES
const crawl = require('./mod/crawler');
const stopword = require('./mod/stopword');
const modal = require('./mod/modal');


// CREATE INDEX FROM DOCUMENTS
var index = {
	// <word>: {
	// 	<document>: <frequency>
	// }
};

/**
 * MAIN FUNCTION
 */
// crawl.extractLinks("http://www.walkndev.com").then((page) => {
crawl.extractLinks("https://www.cse.ust.hk").then((page) => {

	// GET PARENT-CHILD LINKING RELATIONSHIP OF ALL PAGES
	page.childLinks.forEach((link, link_i) => {
		page.childPages = [];
		crawl.extractLinks(link).then((childPage) => {
			page.childPages.push(childPage);
			if (link_i == page.childLinks.length-1) modal.writeFile(page);
		});
	});
	// ------------------------------


}).catch((error) => {
	console.error(error);
})
