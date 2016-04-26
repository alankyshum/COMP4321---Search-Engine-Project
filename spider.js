const config = require('./config.json');
const crawl = require('./mod/crawler');
const model = require('./mod/model');


// [TODO: Batch update/insert - Not using batch is too slow, reason: over network => please abandon mongolab in production release]
// [TODO: Add Database Cleaning so that all crawling test can be done everytime start the server]
crawl.recursiveExtractLink(config.rootURL, (page) => {
	model.indexTable.page.upsert(page);

	model.indexTable.word.upsert(Object.keys(page.wordFreqTitle).concat(Object.keys(page.wordFreqBody)))
	.then((wordList) => {

    var wordToID = {}, IDToWordFreqTitle = {}, IDToWordFreqBody = {}, IDToWordFreqArray = [];
    model.indexTable.word.getIDs(wordList).then((ids) => {
      ids.forEach((element) => { wordToID[element.word] = element._id; });

      Object.keys(page.wordFreqTitle).forEach((key) => {
        IDToWordFreqTitle[wordToID[key]] = page.wordFreqTitle[key];
        IDToWordFreqArray.push({wordID: wordToID[key], freq: page.wordFreqTitle[key]});
      });

      Object.keys(page.wordFreqBody).forEach((key) => {
        IDToWordFreqBody[wordToID[key]] = page.wordFreqBody[key];
        IDToWordFreqArray.push({wordID: wordToID[key], freq: page.wordFreqBody[key]});
      });

      model.indexTable.page.getID(page.url).then((pageID) => {
        model.indexTable.inverted.upsert(IDToWordFreqTitle, IDToWordFreqBody, pageID);
        model.indexTable.forward.upsert(IDToWordFreqArray, pageID);
      });
    });

  });

}, (allPages) => {
	// TODO: update childIDs from childLinks
	model.file.cleanFile(config.resultFile);
	model.file.writeAll(config.resultFile, allPages);
});


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
// model.indexTable.page.getPage("5707222b6444fbb348f3da08", ["url"]).then((url) => {
// 	console.log(url);
// });
// model.indexTable.page.getPage("5707222b6444fbb348f3da08").then((url) => {
// 	console.log(url);
// });
