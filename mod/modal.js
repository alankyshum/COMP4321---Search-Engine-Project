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

	return {
		initDB: initDB;
	}
})();
