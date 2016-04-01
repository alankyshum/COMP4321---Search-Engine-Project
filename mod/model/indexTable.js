const model = require('../model');
// const cache = require('memory-cache');
/**
 * MODULE:: FORWARD + INVERTED INDEX
 * --------------------------
 * MODULE HANDLING FORWARD INDEX AND INVERTED INDEX
 * WORD ID, PAGE ID, PAGE INFO
 */

// PAGE INFO: STORING ALL PAGE INFORMATION
// --------------------------
module.exports.page = (() => {
  var returnFx = {};

  returnFx.upsert = (page) => {
    var _logHead = "[MODEL/INDEXTABLE/PAGE/UPSERT]";
    console.log(`${_logHead}\tUpserting Page: ${page.url}`);
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
        lastCrawlDate: {$lt: new Date(page.lastCrawlDate.getDate()-1)}
      }, _newPageInfo, {upsert: true}, (err, raw) => {
        if (err) {console.error(err); eject(err);}
        console.log(`${_logHead}\tUpserting Finished`);
        resolve();
      })
    }) // end:: promise
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


/**
 * --------------------------
 * THE FOLLOWING NEEDS TO BE CACHED BEFORE ALL OTHER FUNCTIONS
 * WORD_ID TABLE + PAGE_ID TABLE
 * --------------------------
 */

// WORD ID TABLE
// --------------------------
module.exports.wordID = (() => {
  var returnFx = {};

  returnFx.get = (word) => {

  }

  returnFx.getWord = (id) => {
  }

  returnFx.exists = (word) => {

  }

  return returnFx;
})();


// PAGE ID TABLE
// --------------------------
module.exports.pageID = (() => {
  var returnFx = {};

  returnFx.get = (url) => {

  }

  returnFx.getURL = (id) => {

  }

  returnFx.exists = (url) => {

  }

  return returnFx;
})();
