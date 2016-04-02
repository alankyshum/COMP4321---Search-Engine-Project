const model = require('../model');
const colors = require('colors');
/**
 * MODULE:: FORWARD + INVERTED INDEX
 * --------------------------
 * MODULE HANDLING FORWARD INDEX AND INVERTED INDEX
 * WORD ID, PAGE ID, PAGE INFO
 */


 // WORD ID TABLE :: WORD LIST
 // --------------------------
 module.exports.wordList = (() => {
   var returnFx = {};

   returnFx.get = (word) => {

   }

   returnFx.getWord = (id) => {
   }

   returnFx.exists = (word) => {

   }

   return returnFx;
 })();

// PAGE ID TABLE :: PAGE INFO
// --------------------------
module.exports.page = (() => {
  var returnFx = {};

  returnFx.upsert = (page) => {
    var _logHead = "[MODEL/INDEXTABLE/PAGE/UPSERT]";
    console.log(`${_logHead}\tUpserting Page: ${page.url}`.green);
    return new Promise((resolve, reject) => {
      var _newPageInfo = {
        title: page.title,
        url: page.url,
        lastModifiedDate: page.lastModifiedDate,
        lastCrawlDate: page.lastCrawlDate,
        size: page.pageSize,
        childLinks: page.childLinks
      };
      model.dbModel.pageInfo.update({
        url: page.url,
        lastCrawlDate: {$gt: new Date(page.lastCrawlDate.getDate()-1)}
      }, _newPageInfo, {upsert: true}, (err, raw) => {
        if (err) {console.error(err); eject(err);}
        else {
          console.log(`${_logHead}\tUpserted URL: ${page.url}`.green);
          resolve();
        }
      });
    }) // end:: Promise
  }

  return returnFx;
})();


// FORWARD INDEX: DOCUMENT -> WORD FREQUENCY
// --------------------------
module.exports.forward = (() => {
  var returnFx = {};

  returnFx.setDoc = (page) => {

  }

  returnFx.getDocList = () => {

  }

  return returnFx;
})();


// INVERTED INDEX: WORD -> DOCUMENT
// --------------------------
module.exports.inverted = (() => {
  var returnFx = {};

  return returnFx;
})();
