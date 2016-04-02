const config = require('./config.json');
const crawl = require('./mod/crawler');
const model = require('./mod/model');
// GLOBAL VARIABLES

crawl.recursiveExtractLink(config.rootURL, (page) => {
	model.indexTable.page.upsert(page);
	model.indexTable.pageID.upsert(page.url);
}, (allPages) => {
	model.file.cleanFile(config.resultFile);
	model.file.writeAll(config.resultFile, allPages);
});
