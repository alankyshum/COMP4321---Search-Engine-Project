const db = require('model').db;
const schema = require('schema.json');
/**
 * MODULE:: FORWARD + INVERTED INDEX
 * --------------------------
 * MODULE HANDLING FORWARD INDEX AND INVERTED INDEX
 */


// FORWARD INDEX: DOCUMENT -> WORD FREQUENCY
// --------------------------
module.exports.forward = () => {
  var returnFx = {};

  returnFx.setDoc = (page) => {

  }

  returnFx.getDocList = () => {

  }

  return returnFx;
}


// INVERTED INDEX: WORD -> DOCUMENT
// --------------------------
module.exports.inverted = () => {
  var returnFx = {};

  return returnFx;
}


// WORD ID TABLE
// --------------------------
module.exports.wordID = () => {
  var returnFx = {};

  var wordID = model.db.model('wordID', schema.wordID);

  // IN: WORD; OUT: ID
  returnFx.get = (word) => {

  }

  returnFx.getWord = (id) => {
  }

  returnFx.exists = (word) => {

  }

  return returnFx;
}


// PAGE ID TABLE
// --------------------------
module.exports.pageID = () => {
  var returnFx = {};

  var pageList = ;

  returnFx.get = (url) => {

  }

  returnFx.getURL = (id) => {

  }

  returnFx.exists = (url) => {

  }

  return returnFx;
}
