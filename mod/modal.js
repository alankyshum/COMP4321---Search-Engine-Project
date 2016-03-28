// MANDATARY IMPORTS
const config = require('../config.json');
const firebase = require('firebase');
const cache = require('memory-cache');

// OPTIONAL LIBRARY
const colors = require('colors');
const log = require('single-line-log').stdout;

/**
 * MODULE :: MODAL
 * --------------------------
 * MODULE TO INTERACTIONS WITH REMOTE DATABASE
 * HIGH-LEVEL WRAPPER FOR FIREBASE APIS
 */

// DATABASE
module.exports.db = () => {
	var returnFx = {};

	var dataRef = new firebase(config.firebaseDB);
	returnFx.writeDB = () => {
		// dataRef
	}

	return returnFx;
};


// CACHE
// GENERAL-PURPOSE CACHE, NOT FITTING IN ANY
// DEDICATED MODAL, LIKE FILE, INDEXTABLE, OR STOPWORDS
module.exports.cache = () => {
	var returnFx = {};

	// -------------------------
	// CRAWLED LINKS -----------
	// -------------------------
	// GET LINKS EXISTING IN THE DATABASE
	returnFx.crawledLink.init = () => {
		// TODO: GET LIST OF LINKS EXISTINGS IN THE DATABASE
		// FIXME: ASSUMED THEY WON'T CHANGE FOR A WHILE
		// NEED TO CHECK LAST MODIFIED DATE

	}
	// GET A LIST OF ALL CRAWLED LINKS
	returnFx.crawledLink.get = () => {
		if (!cache.get('crawledLink')) {
			// TODO: get from database
		}
		return cache.get('crawledLink');
	}
	// RENEW THE LIST OF CRAWLED LINKS
	returnFx.crawledLink.set = (value) => {
		cache.put('crawledLink', value);
		// TODO: WRITE TO DATABASE
	}

	return returnFx;
}


// ==========================
// EXPORTED LIBRARIES =======
// ==========================
module.exports.stopWords = require('modal/stopWords.js');
module.exports.indexTable = require('modal/indexTable.js');
module.exports.file = require('modal/file.js');
