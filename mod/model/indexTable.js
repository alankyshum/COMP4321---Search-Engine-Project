const model = require('../model'); // [need review] strange dependency, model <=> indexTable
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
    var _logHead = "[MODEL/INDEXTABLE/WORD/UPSERT]";
    
    return new Promise((resolve, reject) => {
      var check = 0;
      wordList.forEach((word) => {
        model.dbModel.wordList.collection.update({word: word}, {word: word}, {upsert: true}, (err, docs) => {
          if(err){ console.log(err); reject(err); }

          // All Words have been inserted => resolve promise
          if(++check==Object.keys(wordList).length){   // [need review] racing conditions
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
        if (err) {console.error(err); reject(err);}
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
  
  returnFx.upsert = (wordFreq, id) => {
    var _logHead = "[MODEL/INDEXTABLE/INVERTED/UPSERT]";
    
    return new Promise((resolve, reject) => {
      
      Object.keys(wordFreq).forEach((key) => {
        
        model.dbModel.invertedTable.update({
          wordID: key,
          "docs.docID": id
        }, { 
          $set: { "docs.$.freq": wordFreq[key] }
        }, (err, raw) => {
          if (err) {console.error(err); reject(err);}
          else {
            if(!raw.nMatched)
              model.dbModel.invertedTable.update({
                wordID: key
              }, {
                $addToSet: { docs: { docID: id, freq: wordFreq[key]} }
              }, {upsert: true}, (err, raw) => {
                if (err) {console.error(err); reject(err);}
                else {
                  console.info(`${_logHead}\tInserted posting for Word[${key}]: Page[${id}] - Freq[${wordFreq[key]}]`.green);
                  resolve();
                }
              });
            else {
              console.info(`${_logHead}\tUpdated posting for Word[${key}]: Page[${id}] - Freq[${wordFreq[key]}]`.green);                  
              resolve();
            }
          } 
        });
        
      });
        
    });
  };
  
  returnFx.getWordPosting = ((wordID, limit) => {
    var query = typeof limit===undefined?{wordID: wordID}:{wordID: wordID, docs: {$slice: limit} };  // default parameter (limit)
    model.dbModel.invertedTable.find(query, 'docs', (err, postings) => {
      if (err) {console.error(err); reject(err)}
      resolve(postings);
    });
  });

  return returnFx;
})();
