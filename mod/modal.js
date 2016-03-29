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
	returnFx.crawledLinks = {};
	// GET LINKS EXISTING IN THE DATABASE
	returnFx.crawledLinks.init = () => {
		// TODO: GET LIST OF LINKS EXISTINGS IN THE DATABASE
		// FIXME: ASSUMED THEY WON'T CHANGE FOR A WHILE
		// NEED TO CHECK LAST MODIFIED DATE

	}
	// GET A LIST OF ALL CRAWLED LINKS
	returnFx.crawledLinks.get = () => {
		if (!cache.get('crawledLinks')) {
			// FIXME: get from database
			cache.put('crawledLinks', {});
		}
		return cache.get('crawledLinks');
	}
	// RENEW THE LIST OF CRAWLED LINKS
	returnFx.crawledLinks.set = (value) => {
		cache.put('crawledLinks', value);
		// TODO: WRITE TO DATABASE
	}

	return returnFx;
}


// ==========================
// EXPORTED LIBRARIES =======
// ==========================
module.exports.stopWords = require('./modal/stopWords.js');
module.exports.indexTable = require('./modal/indexTable.js');
module.exports.file = require('./modal/file.js');
