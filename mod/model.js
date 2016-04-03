const mongoose = require('mongoose');
const config = require('../config.json');
/**
 * MODULE :: model
 * --------------------------
 * ENTRY POINT OF ALL model MODULES
 */

// --------------------------
// SCHEMA -------------------
// --------------------------
const Schema = mongoose.Schema;
if (mongoose.connection.readyState === 0) {
  mongoose.connect(config.mongoDB);
  console.log(`DATABASE CONNECTED ... `);
}

var _schema = {};
// GET WORD ID FROM WORDLIST -- _ID
// [BUG] _ID is not number, please change it to auto-increment with number starting from 0
_schema.wordList = new Schema({
  word: {type: String, unique: true}
});

// GET PAGE ID FROM PAGE INFO -- _ID
_schema.pageInfo = new Schema({
  title: String,
  url: String,
  lastModifiedDate: Date,
  lastCrawlDate: Date,
  size: Number,
  childLinks: [String]
});

_schema.forwardTable = new Schema({
  docID: {type: Number, min: 0},
  words: [{
    wordID: {type: Number, min: 0},
    freq: {type: Number, min: 0}
  }]
});

_schema.invertedTable = new Schema({
  wordID: {type: Number, min: 0},
  docs: [{
    docID: {type: Number, min: 0},
    freq: {type: Number, min: 0}
  }]
});

module.exports.dbModel = {
  wordList: mongoose.model('wordList', _schema.wordList),
  pageInfo: mongoose.model('pageInfo', _schema.pageInfo),
  forwardTable: mongoose.model('forwardTable', _schema.forwardTable),
  invertedTable: mongoose.model('invertedTable', _schema.invertedTable),
}


// --------------------------
// PARENT OF INHERITANCE ----
// --------------------------
module.exports.words = require('./model/words.js');
module.exports.indexTable = require('./model/indexTable.js');
module.exports.file = require('./model/file.js');
