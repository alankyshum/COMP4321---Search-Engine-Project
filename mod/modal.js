// OPTIONAL LIBRARY
const colors = require('colors');
const log = require('single-line-log').stdout;

/**
 * MODULE :: MODAL
 * --------------------------
 * MODULE TO INTERACTIONS WITH REMOTE DATABASE
 * HIGH-LEVEL WRAPPER FOR FIREBASE APIS
 */

const FIREBASE = require('firebase');
const LINKS = {
	firebaseDB: "https://comp4321.firebaseio.com/"
}

module.exports = (() => {

	var dataRef = null;
	var initDB = () => {
		dataRef = new FIREBASE(LINKS.firebaseDB);
	}

	var writeFile = (page) => {

		console.log(`${page.title}`.underline.green);
		console.log(page.URL);
		console.log(page.lastModifiedDate);
		console.log(page.pageSize);

		// GET PARENT-CHILD LINKING RELATIONSHIP OF ALL PAGES
		page.childLinks.forEach((link) => {
			console.log(`\t${link}`);
		});
		// ------------------------------

		if (page.childPages) {
			page.childPages.forEach((childPage) => {
				writeFile(childPage);
			});
		} else {
			return true;
		}
	}

	return {
		initDB: initDB,
		writeFile: writeFile
	}
})();
