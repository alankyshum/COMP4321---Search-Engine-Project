const config = require('./config.json');
const crawl = require('./mod/crawler');
const model = require('./mod/model');
const colors = require('colors');


// [TODO: Batch update/insert - Not using batch is too slow, reason: over network => please abandon mongolab in production release]
// [TODO: Add Database Cleaning so that all crawling test can be done everytime start the server]

// HELPER FUNCTIONS
// ----------------
var objectCache = {
	pageCache: [], // partitioned into segments, by config.bulkWindow
	wordCache: [], // same as pageCache
	cacheIndex: 0 // partition cache into seperate object
	// needed for async operations, avoid reading the same object while updating it
};
function* cnt(begin) {
	var cnt = begin; while (true) yield cnt++;
}
var writeCnt = cnt(1);


// BULK OPERATIONS
// ---------------
var bulkOps = (cacheIndex) => {
	// cacheIndex: local::cacheIndex, avoid being updated during
	// other async page crawling process
	Promise.all([
		// return pageIDList, wordIDList
		model.indexTable.page.upsertBulk(objectCache.pageCache[cacheIndex])
		.then(() => {
			return model.indexTable.page.getURLID(objectCache.pageCache[cacheIndex].map((page) => {return page.url}))
		}),
		model.indexTable.word.upsert(objectCache.wordCache[cacheIndex])
		.then((wordList) => {
			return model.indexTable.word.getWordID(wordList)
		})
	])
	.then((idList) => {
		var urlToID = {},
			wordToID = {},
			pageWordTable = {}; // MAP:: ID <-> freq, array
		idList[0].forEach((element) => { urlToID[element.url] = element._id; });
		idList[1].forEach((element) => { wordToID[element.word] = element._id; });
		console.log(idList[0]);
		console.log(objectCache.pageCache[cacheIndex].length);
		objectCache.pageCache[cacheIndex].forEach((page) => {
			pageWordTable[urlToID[page.url]] = {
				IDToWordFreqTitle: {},
				IDToWordFreqBody: {},
				IDToWordFreqArray: []
			};
			console.log(`${urlToID[page.url]}: ${page.url}`);
			Object.keys(page.wordFreqTitle).forEach((key) => {
				pageWordTable[urlToID[page.url]].IDToWordFreqTitle[wordToID[key]] = page.wordFreqTitle[key];
				pageWordTable[urlToID[page.url]].IDToWordFreqArray.push({
					wordID: wordToID[key],
					freq: page.wordFreqTitle[key]
				});
			});
			Object.keys(page.wordFreqBody).forEach((key) => {
				pageWordTable[urlToID[page.url]].IDToWordFreqBody[wordToID[key]] = page.wordFreqBody[key];
				pageWordTable[urlToID[page.url]].IDToWordFreqArray.push({
					wordID: wordToID[key],
					freq: page.wordFreqBody[key]
				});
			});
		}); // end:: loop page --> prepare wordFreqTable

		// WRITE TO DATABASE
		try {
			Promise.all([
				model.indexTable.forward.upsertBulk(pageWordTable),
				// model.indexTable.inverted.upsertBulk(pageWordTable)
			]);
		} catch (e) {
			console.error(e);
		}
	})
	// .then(() => {
	// 	// CLEAR CACHE
	// 	console.log("CLEAR CACHE ...".red);
	// 	objectCache.pageCache[cacheIndex] = [];
	// 	objectCache.wordCache[cacheIndex] = [];
	// })
}

// CORE FUNCTIONS
// --------------
crawl.recursiveExtractLink(config.rootURL, (page) => {
	objectCache.cacheIndex = parseInt((writeCnt.next().value - 1) / config.bulkWindow);
	// console.info(`[${objectCache.cacheIndex}] ${page.title}`);
	if (!objectCache.pageCache[objectCache.cacheIndex])
		objectCache.pageCache[objectCache.cacheIndex] = [];
	if (!objectCache.wordCache[objectCache.cacheIndex])
		objectCache.wordCache[objectCache.cacheIndex] = [];
	objectCache.pageCache[objectCache.cacheIndex].push(page);
	objectCache.wordCache[objectCache.cacheIndex] = objectCache.wordCache[objectCache.cacheIndex].concat(Object.keys(page.wordFreqTitle).concat(Object.keys(page.wordFreqBody)));
	if (objectCache.pageCache[objectCache.cacheIndex].length === config.bulkWindow) {
		bulkOps(objectCache.cacheIndex);
	}

}, (allPages) => {
	console.info("FINISHED CRAWLING");

	// HANDLE THE REMAINING ITEMS IN CACHE
	if (objectCache.pageCache[objectCache.cacheIndex].length) {
		bulkOps(objectCache.cacheIndex);
	}

	// TODO: update childIDs from childLinks
	// model.file.cleanFile(config.resultFile);
	// model.file.writeAll(config.resultFile, allPages);

});
