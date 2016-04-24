const model = require('../model') // [need review] strange dependency, model <=> indexTable
  , colors = require('colors')
  , error = require('../error');
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
    var _logHead = "[MODEL/INDEXTABLE/WORD/UPSERT]";

    return new Promise((resolve, reject) => {
      var check = 0;
      wordList.forEach((word) => {
        model.dbModel.wordList.collection.update({word: word}, {word: word}, {upsert: true}, (err, docs) => {
          if (err) error.mongo.parse(err, reject)
          // All Words have been inserted => resolve promise
          if(++check==Object.keys(wordList).length) {   // [need review] racing conditions
            console.info(`${_logHead}\tUpserting <${wordList.length} words`.green);
            resolve();
          }
        });
      });
    });
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
        if (word) resolve(word._id);
      })
    })
  }

  returnFx.getIDs = (wordList) => {
    return new Promise((resolve, reject) => {
      model.dbModel.wordList.find({word: {$in: wordList}}, '_id', (err, words) => {
        if (err) {console.error(err); reject(err)}
        var wordIDList = null;
        if (words) {
          wordIDList = words.map((word) => {
            return word._id
          });
        }
        resolve(wordIDList);
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
        lastCrawlDate: {$gt: new Date(page.lastCrawlDate.getTime()-1)}
      }, _newPageInfo, {upsert: true}, (err, raw) => {
        if(err)
          error.mongo.parse(err, reject);
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

  returnFx.getPage = (id, fields) => {
    return new Promise((resolve, reject) => {
      var _fieldsQuery = fields?fields.join(' '):"";
      model.dbModel.pageInfo.findById(id, _fieldsQuery, (err, page) => {
        if (err) {console.error(err); reject(err)}
        if (!page) return resolve(null);
        if (fields && fields.length === 1) resolve(page[fields[0]])
        else resolve(page);
      })
    })
  }


  returnFx.getPages = (idList, fields) => {
    return new Promise((resolve, reject) => {
      var _fieldsQuery = fields?fields.join(' '):"";
      model.dbModel.pageInfo.find({_id: {$in: idList}}, _fieldsQuery, (err, pages) => {
        if (err) {console.error(err); reject(err)}
        if (!pages) return resolve(null);
        if (fields && fields.length === 1) resolve(pages.map((page) => {
          return page[fields[0]]
        }));
        else resolve(pages);
      })
    })
  }

  return returnFx;
})();


// FORWARD INDEX: DOCUMENT -> WORD FREQUENCY
// --------------------------
module.exports.forward = (() => {
  var returnFx = {};

  returnFx.upsert = (wordFreqArray, id) => {
    var _logHead = "[MODEL/INDEXTABLE/FORWARD/UPSERT]";

    return new Promise((resolve, reject) => {

      model.dbModel.forwardTable.update({
        docID: id
      }, {
        docID: id,
        $addToSet: { words: { $each: wordFreqArray } }
      }, {upsert: true}, (err, raw) => {
        if (err) {console.error(err); reject(err);}
        else {
          console.info(`${_logHead}\tUpserted Forward List: ${id}`.green);
          resolve();
        }
      });

    });
  }

  returnFx.getDocList = (id) => {
    return new Promise((resolve, reject) => {

      model.dbModel.forwardTable.find({docID: id}, 'words', (err, words) => {
        if (err) {console.error(err); reject(err)}
        resolve(words);
      });
    });
  }

  return returnFx;
})();


// INVERTED INDEX: WORD -> DOCUMENT
// --------------------------
module.exports.inverted = (() => {
  var returnFx = {};

  returnFx.upsert = (wordFreqTitle, wordFreqBody, id) => {
    var check = 0;

    return new Promise((resolve, reject) => {

      Object.keys(wordFreqTitle).forEach((key) => {
        var _logHead = "[MODEL/INDEXTABLE/INVERTEDTITLE/UPSERT]";
        model.dbModel.invertedTableTitle.update({
          wordID: key,
          "docs.docID": id
        }, {
          $set: { "docs.$.freq": wordFreqTitle[key] }
        }, (err, raw) => {
          if (err) {console.error(err); reject(err);}
          else {
            if(!raw.nMatched)
              model.dbModel.invertedTableTitle.update({
                wordID: key
              }, {
                $addToSet: { docs: { docID: id, freq: wordFreqTitle[key]} }
              }, {upsert: true}, (err, raw) => {
                if (err) {console.error(err); reject(err);}
                else {
                  //console.info(`${_logHead}\tInserted posting for Word[${key}]: Page[${id}] - Freq[${wordFreqTitle[key]}]`.green);
                  if(++check==2) resolve();
                }
              });
            else {
              //console.info(`${_logHead}\tUpdated posting for Word[${key}]: Page[${id}] - Freq[${wordFreqTitle[key]}]`.green);
              if(++check==2) resolve();
            }
          }
        });

      });

      Object.keys(wordFreqBody).forEach((key) => {
        var _logHead = "[MODEL/INDEXTABLE/INVERTEDBODY/UPSERT]";
        model.dbModel.invertedTableBody.update({
          wordID: key,
          "docs.docID": id
        }, {
          $set: { "docs.$.freq": wordFreqBody[key] }
        }, (err, raw) => {
          if (err) {console.error(err); reject(err);}
          else {
            if(!raw.nMatched)
              model.dbModel.invertedTableBody.update({
                wordID: key
              }, {
                $addToSet: { docs: { docID: id, freq: wordFreqBody[key]} }
              }, {upsert: true}, (err, raw) => {
                if (err) {console.error(err); reject(err);}
                else {
                  //console.info(`${_logHead}\tInserted posting for Word[${key}]: Page[${id}] - Freq[${wordFreqBody[key]}]`.green);
                  if(++check==2) resolve();
                }
              });
            else {
             // console.info(`${_logHead}\tUpdated posting for Word[${key}]: Page[${id}] - Freq[${wordFreqBody[key]}]`.green);
              if(++check==2) resolve();
            }
          }
        });

      });

    });
  };

  returnFx.getWordPosting = ((wordID, findTitle, limit) => {   // [listNum] true: Title, false: Body
    // default parameter (limit)
    var query = typeof limit===undefined?{wordID: wordID}:{wordID: wordID, docs: {$slice: limit} };
    return new Promise((resolve, reject) => {
      model.dbModel[findTitle?"invertedTableTitle":"invertedTableBody"].find(query , 'docs', (err, postings) => {
        if (err) {console.error(err); reject(err)}
        resolve(postings);
      });
    })
  });

  returnFx.getWordPostings = ((wordIDList, findTitle, limit) => {   // [listNum] true: Title, false: Body
    return new Promise((resolve, reject) => {
      model.dbModel[findTitle?"invertedTableTitle":"invertedTableBody"].find({
        wordID: {$in: wordIDList}
      }, 'docs', (err, postings) => {
        console.log("DONE SEARCHING DOCUMENTS");
        if (err) {console.error(err); reject(err)}
        resolve(postings);
      });
    });
  });

  return returnFx;
})();
