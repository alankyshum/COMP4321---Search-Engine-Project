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
_schema.wordList = new Schema({
  word: {type: String, unique: true}
});

// GET PAGE ID FROM PAGE INFO -- _ID
_schema.pageInfo = new Schema({
  title: String,
  url: {type: String, unique: true},
  favIconUrl: {type: String},
  lastModifiedDate: Date,
  lastCrawlDate: Date,
  size: {type: Number, min: 0},
  childLinks: [String]
});

_schema.forwardTable = new Schema({
  docID: mongoose.Schema.ObjectId,
  words: [{
    wordID: mongoose.Schema.ObjectId,
    wordPos: [{type: Number; min: 0}],
    freq: {type: Number, min: 0}
  }]
});

_schema.invertedTable = new Schema({
  wordID: mongoose.Schema.ObjectId,
  docs: [{
    docID: mongoose.Schema.ObjectId,
    freq: {type: Number, min: 0}
  }]
});

module.exports = {
  wordList: mongoose.model('wordList', _schema.wordList),
  pageInfo: mongoose.model('pageInfo', _schema.pageInfo),
  forwardTable: mongoose.model('forwardTable', _schema.forwardTable),
  invertedTableTitle: mongoose.model('invertedTableTitle', _schema.invertedTable),
  invertedTableBody: mongoose.model('invertedTableBody', _schema.invertedTable)
}
