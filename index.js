const config = require('./config.json');
const crawl = require('./mod/crawler');
const model = require('./mod/model');


// [TODO: Batch update/insert - Not using batch is too slow, reason: over network => please abandon mongolab in production release]
// [TODO: Add Database Cleaning so that all crawling test can be done everytime start the server]
crawl.recursiveExtractLink(config.rootURL, (page) => {
	model.indexTable.page.upsert(page);
  
	model.indexTable.word.upsert(Object.keys(page.wordFreq));
  
  var wordToID = {}, IDToWordFreq = {}, IDToWordFreqArray = [];
  model.indexTable.word.getAllID().then((ids) => {
    ids.forEach((element) => { wordToID[element.word] = element._id; });
    Object.keys(page.wordFreq).forEach((key, index) => { 
      if(wordToID[key] == undefined)   // BUG: the list getAllID() does NOT contain some words
        console.log(`BUG - ${key} is not in getAllID() list`);
      IDToWordFreq[wordToID[key]] = page.wordFreq[key]; IDToWordFreqArray[index] = {wordID: wordToID[key], freq: page.wordFreq[key]} 
    });
    model.indexTable.page.getID(page.url).then((pageID) => {
      model.indexTable.inverted.upsert(IDToWordFreq, pageID);
      model.indexTable.forward.upsert(IDToWordFreqArray, pageID);
    });
  });  
  
}, (allPages) => {
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
// model.indexTable.page.getURL("56ff8d6e8b56097487f9a6bc").then((url) => {
// 	console.log(url);
// });
