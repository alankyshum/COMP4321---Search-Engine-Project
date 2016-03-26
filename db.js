var dbURL = require('./config').dbURL;
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');

var runTransaction = function (execute) {
    MongoClient.connect(dbURL, function (err, db) {
        assert.equal(null, err);
        console.log("Connected correctly to database.");
        execute(db);
    });
};

var insert = function (collection, data) {
    runTransaction(function (db) {
        db.collection(collection).insert(data);
        db.close();
    });
};

var find = function (collection, data, cb) {
    runTransaction(function (db) {
        var cursor = db.collection(collection).find(data);
        var result = [];
        cursor.each(function (err, doc) {
            assert.equal(err, null);
            if (doc != null) {
                result.push(doc);
            } else {
                db.close();
                cb(result);
            }
        });
    });
};

var update = function (collection, filter, data) {
    runTransaction(function (db) {
        db.collection(collection).update(filter, data);
        db.close();
    });
};

module.exports.insert = insert;
module.exports.find = find;
module.exports.update = update;