const config = require('./config.json');
const crawl = require('./mod/crawler');
const model = require('./mod/model');


// [TODO: Batch update/insert - Not using batch is too slow, reason: over network => please abandon mongolab in production release]
// [TODO: Add Database Cleaning so that all crawling test can be done everytime start the server]

// HELPER FUNCTIONS
// ----------------
var objectCache = {
	pageCache: [],
	wordCache: []
};
function* cnt(begin) {
	var cnt = begin; while (true) yield cnt++;
}
var writeCnt = cnt(1);


// BULK OPERATIONS
// ---------------
var bulkOps = () => {
	model.indexTable.page.upsertBulk(objectCache.pageCache)
	.then(() => {
		model.indexTable.word.upsert(objectCache.wordCache)
		.then((wordList) => {
			var wordToID = {}, IDToWordFreqTitle = {}, IDToWordFreqBody = {}, IDToWordFreqArray = [];
			model.indexTable.word.getIDs(wordList).then((ids) => {
				ids.forEach((element) => { wordToID[element.word] = element._id; });

				var _urlList = [];
				objectCache.pageCache.forEach((page) => {
					_urlList.push(page.url)
					Object.keys(page.wordFreqTitle).forEach((key) => {
						IDToWordFreqTitle[wordToID[key]] = page.wordFreqTitle[key];
						IDToWordFreqArray.push({wordID: wordToID[key], freq: page.wordFreqTitle[key]});
					});
					Object.keys(page.wordFreqBody).forEach((key) => {
						IDToWordFreqBody[wordToID[key]] = page.wordFreqBody[key];
						IDToWordFreqArray.push({wordID: wordToID[key], freq: page.wordFreqBody[key]});
					});
				}); // end:: loop page --> prepare wordFreqTable

				model.indexTable.page.getIDs(_urlList).then((idList) => {
					console.log(idList.length);
					// model.indexTable.inverted.upsertBulk(IDToWordFreqTitle, IDToWordFreqBody, idList);
					// model.indexTable.forward.upsertBulk(IDToWordFreqArray, idList);
				}); // end:: finished forward table + inverted table buildup

				// CLEAR CACHE
				objectCache.pageCache = [];
				objectCache.wordCache = [];

			}); // end:: loop word
		});
	}); // end:: after adding pages, ids are ready
}

// CORE FUNCTIONS
// --------------
crawl.recursiveExtractLink(config.rootURL, (page) => {
	console.info(`[${writeCnt.next().value}] ${page.title}`);

	objectCache.pageCache.push(page);
	objectCache.wordCache = objectCache.wordCache.concat(Object.keys(page.wordFreqTitle).concat(Object.keys(page.wordFreqBody)));
	if (objectCache.pageCache.length == config.bulkWindow) {
		bulkOps();
	}

}, (allPages) => {
	console.info("FINISHED CRAWLING");

	// HANDLE THE REMAINING ITEMS IN CACHE
	if (objectCache.pageCache.length) {
		bulkOps();
	}

	// TODO: update childIDs from childLinks
	// model.file.cleanFile(config.resultFile);
	// model.file.writeAll(config.resultFile, allPages);

});
