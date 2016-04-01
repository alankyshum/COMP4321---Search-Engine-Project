/**
 * MODULE :: model
 * --------------------------
 * ENTRY POINT OF ALL model MODULES
 */


module.exports.db = require('mongoose');
if (module.exports.db.connection.readyState === 0) {
  module.exports.db.connect(config.mongoDB);
}

module.exports.words = require('./model/words.js');
module.exports.indexTable = require('./model/indexTable.js');
module.exports.file = require('./model/file.js');
