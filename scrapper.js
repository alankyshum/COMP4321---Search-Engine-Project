// DIVIDED MODULES
const config = require('./config.json');
const crawl = require('./mod/crawler');
const modal = require('./mod/modal');

crawl.recursiveExtractLink(config.rootURL, (allPages) => {
	modal.file.writeAll(config.resultFile, allPages);
});
