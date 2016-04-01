/**
 * MODULE :: WORDS
 * --------------------------
 * ALL FUNCTIONS RELATED TO WORD PROCESSING
 */
const fs = require('fs');
const cache = require('memory-cache');
const stemmer = require('porter-stemmer').stemmer;

// CHECK IF WORD IS STOP WORD
var is = (word) => {
	!cache.get('stopWordList') && cache.put('stopWordList', fs.readFileSync("./data/stopwords.txt", 'utf8').replace(/\r\n/g, '\n').split('\n'));
	return !!~cache.get('stopWordList').indexOf(word);
}
module.exports.is = is;

// RETURN WORD -> FREQUENCY HAS TABLE FROM DOCUMENT BODY
var wordFreq = (body) => {
	var wordFreq = {};
	var wordList = body.match(/\w+/g); // match word
	wordList.filter((word) => {
		return !is(word)
	}).map(stemmer).forEach((word) => {
		if (!wordFreq[word]) wordFreq[word] = 0;
		wordFreq[word]++;
	})
	return wordFreq;
}
module.exports.wordFreq = wordFreq;
