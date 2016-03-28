// DIVIDED MODULES
const config = require('./config.json');
const crawl = require('./mod/crawler');
const modal = require('./mod/modal');

/**
 * MAIN FUNCTION
 */
crawl.extractLinks(config.rootURL).then((page) => {
	var crawledLinks = modal.cache.crawledLink.get();
	var crawledAllLnks = new Promise((resolve, reject) => {
		page.childLinks.forEach((link, link_i) => {
			page.childPages = [];
			if (!crawledLinks[link]) {
				crawledLinks[link] = 0;
				crawl.extractLinks(link).then((childPage) => {
					page.childPages.push(childPage);
					modal.indexTable.forward.insert(childPage);
					(link_i == page.childLinks.length-1) resolve(page);
				});
			} else {
				crawledLinks[link]++;
				(link_i == page.childLinks.length-1) resolve(page);
			}
			modal.cache.crawledLink.set(crawledLinks);
		});
	})
	// BATCH WRITE ALL PAGE OBJECTS
	crawledAllLnks.then(modal.file.write);

}).catch((error) => {
	console.error(error);
})
