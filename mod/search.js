/**
 * MOD:: SEARCH
 * --------------------------
 * SEARCH ITEM FROM THE SERVER
 */
const model = require('./model');

module.exports.find = (wordList, limit) => {
  return model.indexTable.word.getIDs(wordList)
  .then((ids) => {
    var titieMatching = model.indexTable.inverted.getWordPostings(ids, true, limit)
      , bodyMatching = model.indexTable.inverted.getWordPostings(ids, false, limit);
    Promise.all([titleMatching, bodyMatching])
    .then((matching) => {
      console.log(matching);
    })

    // resolve(Promise.all([titleMatching, bodyMatching]))
  })
}
