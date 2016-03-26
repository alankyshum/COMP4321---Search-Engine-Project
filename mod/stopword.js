/**
 * MODULE :: STOPWORDS
 * --------------------------
 * HIGH-LEVEL WRAPPER TO DETECT STOPWORDS
 */
const fs = require('fs');

module.exports = (() => {

	// GENERATE A LIST OF STOPWORDS FROM EXTERNAL FILE
	var wordList = fs.readFileSync("./data/stopwords.txt", 'utf8').replace(/\r\n/g, '\n').split('\n');

	// --------------------------
	// RETURN FUNCTIONS ---------
	// --------------------------
	// CHECK IF WORD IS STOP WORD
	var is = (word) => {
		return !!~wordList.indexOf(word);
	}

	return {
		is: is
	}

})();
