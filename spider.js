const config = require('./config.json');
const crawl = require('./mod/crawler');
const model = require('./mod/model');


// [TODO: Batch update/insert - Not using batch is too slow, reason: over network => please abandon mongolab in production release]
// [TODO: Add Database Cleaning so that all crawling test can be done everytime start the server]

// HELPER FUNCTIONS
// ----------------
var objectCache = {
	pageCache: []
};
function* cnt(begin) {
	var cnt = begin; while (true) yield cnt++;
}
var writeCnt = cnt(1);


// CORE FUNCTIONS
// --------------
crawl.recursiveExtractLink(config.rootURL, (page) => {

	console.info(`[${writeCnt.next().value}] ${page.title}`);

	objectCache.pageCache.push(page);
	if (objectCache.pageCache.length == config.bulkWindow) {
		model.indexTable.page.upsertBulk(objectCache.pageCache);
		objectCache.pageCache = [];
	}

	// model.indexTable.word.upsert(Object.keys(page.wordFreqTitle).concat(Object.keys(page.wordFreqBody)))
	// .then((wordList) => {
	//
  //   var wordToID = {}, IDToWordFreqTitle = {}, IDToWordFreqBody = {}, IDToWordFreqArray = [];
  //   model.indexTable.word.getIDs(wordList).then((ids) => {
  //     ids.forEach((element) => { wordToID[element.word] = element._id; });
	//
  //     Object.keys(page.wordFreqTitle).forEach((key) => {
  //       IDToWordFreqTitle[wordToID[key]] = page.wordFreqTitle[key];
  //       IDToWordFreqArray.push({wordID: wordToID[key], freq: page.wordFreqTitle[key]});
  //     });
	//
  //     Object.keys(page.wordFreqBody).forEach((key) => {
  //       IDToWordFreqBody[wordToID[key]] = page.wordFreqBody[key];
  //       IDToWordFreqArray.push({wordID: wordToID[key], freq: page.wordFreqBody[key]});
  //     });
	//
  //     model.indexTable.page.getID(page.url).then((pageID) => {
  //       model.indexTable.inverted.upsert(IDToWordFreqTitle, IDToWordFreqBody, pageID);
  //       model.indexTable.forward.upsert(IDToWordFreqArray, pageID);
  //     });
  //   });
	//
  // });

}, (allPages) => {

	console.info("FINISHED CRAWLING");

	// HANDLE THE REMAINING ITEMS IN CACHE
	if (objectCache.pageCache.length) {
		model.indexTable.page.upsertBulk(objectCache.pageCache);
		objectCache.pageCache = [];
	}

	// TODO: update childIDs from childLinks
	// model.file.cleanFile(config.resultFile);
	// model.file.writeAll(config.resultFile, allPages);

});
