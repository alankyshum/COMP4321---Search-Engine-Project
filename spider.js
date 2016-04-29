const config = require('./config.json');
const crawl = require('./mod/crawler');
const model = require('./mod/model');
const colors = require('colors');


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
		return model.indexTable.word.upsert(objectCache.wordCache)
	})
	.then((wordList) => {
		return model.indexTable.word.getWordID(wordList)
	})
	.then((ids) => {
		var wordToID = {}, IDToWordFreqTitle = {}, IDToWordFreqBody = {}, IDToWordFreqArray = [];
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
		return Promise.all([
			model.indexTable.page.getIDs(_urlList),
			new Promise((resolve, reject) => {
				resolve({
					IDToWordFreqArray: IDToWordFreqArray,
					IDToWordFreqTitle: IDToWordFreqTitle,
					IDToWordFreqBody: IDToWordFreqBody
				})
			})
		]);
	})
	.then((docID_wordID) => {
		// TODO: Implement bulk upsert function for subarray
		try {
			var _upsertPromise = [
				// model.indexTable.inverted.upsertBulk(docID_wordID[1].IDToWordFreqTitle, docID_wordID[1].IDToWordFreqBody, docID_wordID[0]),
				model.indexTable.forward.upsertBulk(docID_wordID[1].IDToWordFreqArray, docID_wordID[0])
			];
		} catch (e) {
			console.log(e);
		}
		// return Promise.all(_upsertPromise);
	})
	// .then(() => {
	// 	// CLEAR CACHE
	// 	console.log("CLEAR CACHE ...".red);
	// 	objectCache.pageCache = [];
	// 	objectCache.wordCache = [];
	// })
}

// CORE FUNCTIONS
// --------------
crawl.recursiveExtractLink(config.rootURL, (page) => {
	// console.info(`[${writeCnt.next().value}] ${page.title}`);

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
