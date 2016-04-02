const config = require('./config.json');
const crawl = require('./mod/crawler');
const model = require('./mod/model');

crawl.recursiveExtractLink(config.rootURL, (page) => {
	model.indexTable.page.upsert(page);
	model.indexTable.word.upsert(Object.keys(page.wordFreq));
}, (allPages) => {
	model.file.cleanFile(config.resultFile);
	model.file.writeAll(config.resultFile, allPages);
});

// TODO: Ivan : Check here for API use case
// model.indexTable.word.getAllID().then((wordIDList) => {
// 	console.log(wordIDList.length);
// });
// model.indexTable.word.getID("sheet").then((id) => {
// 	console.log(id);
// });
// model.indexTable.word.getWord("56ff95eea4805c7c1dd4201d").then((word) => {
// 	console.log(word);
// });
// model.indexTable.page.getAllID().then((pageList) => {
// 	console.log(pageList.length);
// });
// model.indexTable.page.getID("https://www.cse.ust.hk").then((id) => {
// 	console.log(id);
// });
// model.indexTable.page.getURL("56ff8d6e8b56097487f9a6bc").then((url) => {
// 	console.log(url);
// });
