/**
 * MODULE :: model
 * --------------------------
 * ENTRY POINT OF ALL model MODULES
 */

// --------------------------
// SCHEMA -------------------
// --------------------------
const mongoose = require('mongoose');
const config = require('../config.json');
const Schema = mongoose.Schema;
if (mongoose.connection.readyState === 0) {
  mongoose.connect(config.mongoDB);
}
var _schema = {};
_schema.wordID = new Schema({
  word: {type: String, unique: true},
  wordID: {type: Number, min: 0}
});
_schema.pageID = new Schema({
  url: {type: String, unique: true},
  urlID: {type: Number, min: 0}
});
_schema.pageInfo = new Schema({
  title: String,
  url: String,
  lastModifiedDate: Date,
  lastCrawlDate: Date,
  size: Number,
  childLinks: [String]
})
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
  wordID: mongoose.model('wordID', _schema.wordID),
  pageID: mongoose.model('pageID', _schema.pageID),
  forwardTable: mongoose.model('forwardTable', _schema.forwardTable),
  invertedTable: mongoose.model('invertedTable', _schema.invertedTable),
  pageInfo: mongoose.model('pageInfo', _schema.pageInfo)
}



// --------------------------
// PARENT OF INHERITANCE ----
// --------------------------
module.exports.words = require('./model/words.js');
module.exports.indexTable = require('./model/indexTable.js');
module.exports.file = require('./model/file.js');
