// MANDATARY IMPORTS
const config = require('../config.json');
const FIREBASE = require('firebase');
// OPTIONAL LIBRARY
const colors = require('colors');
const log = require('single-line-log').stdout;

/**
 * MODULE :: MODAL
 * --------------------------
 * MODULE TO INTERACTIONS WITH REMOTE DATABASE
 * HIGH-LEVEL WRAPPER FOR FIREBASE APIS
 */

module.exports = (() => {

 //  ___   _ _____ _   ___   _   ___ ___
 // |   \ /_\_   _/_\ | _ ) /_\ / __| __|
 // | |) / _ \| |/ _ \| _ \/ _ \\__ \ _|
 // |___/_/ \_\_/_/ \_\___/_/ \_\___/___|
 //
	var db = () => {
		var returnFx = {};

		var dataRef = new FIREBASE(config.firebaseDB);
		returnFx.writeDB = () => {
			// dataRef
		}

		return returnFx;
	};


 //  ___ ___ _    ___
 // | __|_ _| |  | __|
 // | _| | || |__| _|
 // |_| |___|____|___|
 //
	var file = () => {
		var returnFx = {};

		/*
			WRITE TO FILE
		 */
		returnFx.write = (page) => {
			console.log(`${page.title}`.underline.green);
			console.log(page.URL);
			console.log(page.lastModifiedDate);
			console.log(page.pageSize);
			page.childLinks.forEach((link) => {
				console.log(`\t${link}`);
			});

			if (page.childPages) {
				page.childPages.forEach((childPage) => {
					writeFile(childPage);
				});
			} else {
				return true;
			}
		}

		return returnFx;
	}


 //   ___   _   ___ _  _ ___
 //  / __| /_\ / __| || | __|
 // | (__ / _ \ (__| __ | _|
 //  \___/_/ \_\___|_||_|___|
 //
	var cache = () => {

	}

	return {
		db: db,
		file: file,
		cache: cache
	}
})();
