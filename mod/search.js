/**
 * MOD:: SEARCH
 * --------------------------
 * SEARCH ITEM FROM THE SERVER
 */
const model = require('./model');

module.exports.find = (wordList, limit) => {
  return model.indexTable.word.getIDs(wordList)
  .then((ids) => {
    var promiseArray = [model.indexTable.inverted.getWordPostings(ids, true, limit),
      model.indexTable.inverted.getWordPostings(ids, false, limit)
    ];
    Promise.all(promiseArray)
    .then((matchedPosts) => {
      // FIXME: JUST DUMMY OUTPUT. NO ALGORITHM IS USED HERE
      var matchedPostIDs = {title: [], body: []};
      // TITLE MATCHING
      console.log("TITLE MATCHING");
      matchedPosts[0].forEach((postsThatMatchWord) => {
        postsThatMatchWord.docs.forEach((post) => {
          matchedPostIDs.title.push(post);
        })
      });
      matchedPostIDs.title.sort((doc1, doc2) => {
        return doc1.freq-doc2.freq // desc
      })
      // BODY MATCHING
      console.log("BODY MATCHING");
      matchedPosts[1].forEach((postsThatMatchWord) => {
        postsThatMatchWord.docs.forEach((post) => {
          matchedPostIDs.body.push(post);
        })
      });
      matchedPostIDs.body.sort((doc1, doc2) => {
        return doc1.freq-doc2.freq // desc
      })
      // FIXME: JUST DUMMY OUTPUT. NO ALGORITHM IS USED HERE

      resolve()

    }) // end:: found matching posts
  })
}
