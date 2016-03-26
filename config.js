
var dbURL = "mongodb://localhost:27017/test";
var rootURL = { host: "www.cse.ust.hk", path: '/' };
var danceTime = 30*1000;  // 30 seconds
var stopwords = [];

var lastLinkID = 1; // need to store

var maxCrawlPages = 300;

module.exports.dbURL = dbURL;
module.exports.rootURL = rootURL;
module.exports.danceTime = danceTime;
module.exports.stopwords = stopwords;

module.exports.lastLinkID = lastLinkID;

module.exports.maxCrawlPages = maxCrawlPages;