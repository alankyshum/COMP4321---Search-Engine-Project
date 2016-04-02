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
module.exports.word = (() => {
  var returnFx = {};

  returnFx.upsert = (wordList) => {
    wordList = wordList.map((word) => {
      return {"word": word}
    });
    var _logHead = "[MODEL/INDEXTABLE/WORD/UPSERT]";
    console.info(`${_logHead}\tUpserting ${wordList.length} words`.green);
    return new Promise((resolve, reject) => {
      model.dbModel.wordList.collection.insert(wordList, (err, docs) => {
        if (err) {
          if (err.code == "11000") {
            console.info(`\tduplicated word found`)
          } else {
            console.error(err);
            reject(err);
          }
        } else {
          console.info(`${_logHead}\tUpserted ${docs.length} words`.green);
          resolve();
        }
      }) // end:: insert
    }) // end:: Promise
  }

  returnFx.getAllID = () => {
    return new Promise((resolve, reject) => {
      model.dbModel.wordList.find(null, '_id word', (err, words) => {
        if (err) {console.error(err); reject(err)}
        resolve(words);
      })
    })
  }

  returnFx.getID = (word) => {
    return new Promise((resolve, reject) => {
      model.dbModel.wordList.findOne({word: word}, '_id', (err, word) => {
        if (err) {console.error(err); reject(err)}
        resolve(word._id);
      })
    })
  }

  returnFx.getWord = (id) => {
    return new Promise((resolve, reject) => {
      model.dbModel.wordList.findById(id, (err, word) => {
        if (err) {console.error(err); reject(err)}
        resolve(word.word);
      })
    })
  }

  return returnFx;
})();

// PAGE ID TABLE :: PAGE INFO
// --------------------------
module.exports.page = (() => {
  var returnFx = {};

  returnFx.upsert = (page) => {
    var _logHead = "[MODEL/INDEXTABLE/PAGE/UPSERT]";
    console.info(`${_logHead}\tUpserting Page: ${page.url}`.green);
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
          console.info(`${_logHead}\tUpserted URL: ${page.url}`.green);
          resolve();
        }
      });
    }) // end:: Promise
  }

  returnFx.getAllID = () => {
    return new Promise((resolve, reject) => {
      model.dbModel.pageInfo.find(null, '_id url', (err, pages) => {
        if (err) {console.error(err); reject(err)}
        resolve(pages);
      })
    })
  }

  returnFx.getID = (url) => {
    return new Promise((resolve, reject) => {
      model.dbModel.pageInfo.findOne({url: url}, '_id', (err, url) => {
        if (err) {console.error(err); reject(err)}
        resolve(url._id);
      })
    })
  }

  returnFx.getURL = (id) => {
    return new Promise((resolve, reject) => {
      model.dbModel.pageInfo.findById(id, (err, page) => {
        if (err) {console.error(err); reject(err)}
        resolve(page.url);
      })
    })
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
