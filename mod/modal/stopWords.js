/**
 * MODULE :: STOPWORDS
 * --------------------------
 * HIGH-LEVEL WRAPPER TO DETECT STOPWORDS
 */
const fs = require('fs');
const cache = require('memory-cache');

// CHECK IF WORD IS STOP WORD
module.exports.is = (word) => {
	!cache.get('stopWordList') && cache.put('stopWordList', fs.readFileSync("./data/stopwords.txt", 'utf8').replace(/\r\n/g, '\n').split('\n'));
	return !!~cache.get('stopWordList').indexOf(word);
}
