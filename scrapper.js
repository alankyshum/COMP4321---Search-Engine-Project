// VENDOR LIBRARY
const stemmer = require('./vendor/porterStemmer');
// DIVIDED MODULES
const crawl = require('./mod/crawler');
const stopword = require('./mod/stopword');
const modal = require('./mod/modal');
const config = require('./config.json');

/**
 * MAIN FUNCTION
 */
crawl.extractLinks(config.rootURL).then((page) => {
	page.childLinks.forEach((link, link_i) => {
		page.childPages = [];
		crawl.extractLinks(link).then((childPage) => {
			page.childPages.push(childPage);
			if (link_i == page.childLinks.length-1) modal.writeFile(page);
		});
	});
}).catch((error) => {
	console.error(error);
})
