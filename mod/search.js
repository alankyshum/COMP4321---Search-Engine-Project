/**
 * MOD:: SEARCH
 * --------------------------
 * SEARCH ITEM FROM THE SERVER
 */
const model = require('./model')
  , colors = require('colors');

module.exports.find = (wordList, limit) => {
  return new Promise((resolve, reject) => {
    model.indexTable.word.getIDs(wordList)
    .then((ids) => {
      var promiseArray = [model.indexTable.inverted.getWordPostings(ids, true, limit),
        model.indexTable.inverted.getWordPostings(ids, false, limit)
      ];
      Promise.all(promiseArray)
      .then((matchedPosts) => {
        // FIXME: JUST DUMMY OUTPUT. NO ALGORITHM IS USED HERE
        var matchedDocIDs = {title: [], body: []};

        // TITLE MATCHING
        // console.log("TITLE MATCHING");
        matchedPosts[0].forEach((postsThatMatchWord) => {
          postsThatMatchWord.docs.forEach((post) => {
            matchedDocIDs.title.push(post);
          })
        });
        matchedDocIDs.title = matchedDocIDs.title.sort((doc1, doc2) => {
          return doc1.freq-doc2.freq // desc
        }).map((doc) => {
          return doc.docID
        })

        // BODY MATCHING
        // console.log("BODY MATCHING");
        matchedPosts[1].forEach((postsThatMatchWord) => {
          postsThatMatchWord.docs.forEach((post) => {
            matchedDocIDs.body.push(post);
          })
        });
        matchedDocIDs.body = matchedDocIDs.body.sort((doc1, doc2) => {
          return doc2.freq-doc1.freq // desc
        }).map((doc) => {
          return doc.docID
        })
        // FIXME: DUPLICATES OF docID from a single word
        // FIXME: JUST DUMMY OUTPUT. NO ALGORITHM IS USED HERE

        return new Promise((resolve, reject) => {
          resolve(matchedDocIDs);
        })

      }) // end:: found matching posts
      .then((matchedDocIDs) => {
        console.log(`[SEARCHING] MATCH DOC TITLE:ID\t${matchedDocIDs.title}`.yellow);
        console.log(`[SEARCHING] MATCH DOC BODY:ID\t${matchedDocIDs.body}`.yellow);
        model.indexTable.page.getPages(matchedDocIDs.body, ["title", "url", "-_id"])
        // .then((pages) => {
        //   return resolve(pages);
        // })
        .then((dummyOutput) => {
          resolve({
            data: (new Array(20)).fill().map((item, i) => {
              return {
                title: `Page Title ${i}`,
                url: `http://www.google.com/q==${i}`
              }
            }),
            querySummary: {
              time: '0.01s',
              resultsCnt: 230
            }
          })
        })
      })
    })
  }) // end:: root promise
}
