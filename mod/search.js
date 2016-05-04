/**
 * MOD:: SEARCH
 * --------------------------
 * SEARCH ITEM FROM THE SERVER
 */
const model = require('./model')
  , colors = require('colors');
const config = require('../config.json');

module.exports.find = (wordFreq, limit) => {   // wordFreq = {word: freq};

  // Compute queryNorm (without sqrt)
  var queryNorm = Object.keys(wordFreq).reduce((acc, value) => { return acc+wordFreq[value]*wordFreq[value];},0);

  return new Promise((resolve, reject) => {
    model.indexTable.word.getIDs(Object.keys(wordFreq))
    .then((wordsData) => {

      // Please note this convert [{_id: id1, word: X}, ...] to [id1, id2, ...]
      var ids = wordsData.map((item) => { return item._id; });
      // Lookup wordID to word
      var wordIDToWordLookup = {};
      wordsData.forEach((word) => { wordIDToWordLookup[word._id] = word.word; });

      model.indexTable.forward.getNumOfDocs()    // Get N for computing idf
      .then((N) => {

        var promiseArray = [model.indexTable.inverted.getWordPostings(ids, true),   // [{  wordID: X, docs: [{ docID: X, freq: X}  ...]   }, ...]
          model.indexTable.inverted.getWordPostings(ids, false)
        ];
        Promise.all(promiseArray)
        .then((matchedPosts) => {

          // Compute Similarity helper function
          var getSimilarity = (posts) => {
            var docs = {};   // {docID: { wordID: weight} }
            var similarity = {};  // {docID: similarity}

            // Compute docs
            posts.forEach((word) => {
              var idf=Math.log2(N/word.docs.length);
              var mtf=1;  // max(tf) - default to 1 which does make sense

              // Calculate mtf
              for(i in word.docs) mtf=max(mtf, word.docs[i].freq);

              word.docs.forEach((post) => {
                var weight = post.freq*idf/mtf;   // tf&idf/max(tf) document weight
                if (!docs[post.docID])
                  docs[post.docID] = { [word.wordID]: weight };
                else
                  docs[post.docID][word.wordID] = weight;
              });
            });

            // Compute docNorm (without sqrt)
            var docNorm = {}; // {docID: docNorm}
            Object.keys(docs).forEach((docID) => {
              docNorm[docID]=0;
              Object.keys(docs[docID]).forEach((wordID) => {
                docNorm[docID]+=Math.pow(docs[docID][wordID],2);
              });
            });

            // Compute similarity
            Object.keys(docs).forEach((docID) => {
              var dotProduct=0;
              ids.forEach((wordID) => {
                dotProduct+=(docs[docID][wordID]===undefined?0:docs[docID][wordID]*wordFreq[wordIDToWordLookup[wordID]]);
              });
              similarity[docID] = dotProduct/Math.pow(docNorm[docID],0.5)/Math.pow(queryNorm,0.5); // Cosine similarity measure
            });

            return similarity;
          };


          // Compute Rank for title and body
          var rankDocIDs = {};
          rankDocIDs.title = getSimilarity(matchedPosts[0]);
          rankDocIDs.body = getSimilarity(matchedPosts[1]);


          // Merge two lists by titleSimilarity*titleWeight+bodySimilarity*(1-titleWeight)
          var mergedRankDocIDs = [];  // [ {docID: X, similarity: X}, ...]
          new Set(Object.keys(rankDocIDs.title).concat(Object.keys(rankDocIDs.body))).forEach((docID) => {
            mergedRankDocIDs.push({
              docID: docID,
              similarity: (rankDocIDs.title[docID]===undefined?0:rankDocIDs.title[docID])*config.titleWeight+
                          (rankDocIDs.body[docID]===undefined?0:rankDocIDs.body[docID])*(1-config.titleWeight)
            });
          });


          // Sort mergedRankDocIDs desc
          mergedRankDocIDs.sort((doc1, doc2) => {   // [docID1, docID2 ....]
            return doc2.similarity-doc1.similarity;
          }).map((doc) => {
            return doc.docID;
          });

          return new Promise((resolve, reject) => {
            resolve(mergedRankDocIDs.slice(0,limit));   // slice to top X documents, where X=limit
          });

        }) // end:: found matching posts
        .then((mergedRankDocIDs) => {
          console.log(`[SEARCHING] MATCH DOC TITLE:ID\t${mergedRankDocIDs}`.yellow);

          model.indexTable.forward.getDocsList(mergedRankDocIDs)  // [{docID: X, words: [{ wordID: X, freq: X}, ...] }, ...]
          .then((wordsData) => {

            // Call it [2nd piece] that will be used in final process
            var wordsLookup = {}; // {docID: [{ wordID: X, freq: X}, ...] }
            wordsData.forEach((posting) => { wordsLookup[posting.docID]=posting.words; });

            model.indexTable.page.getPages(mergedRankDocIDs)
              .then((pagesData) => {

              // This links list is for plugging in getPagesWithChilds, which requires links but not ids
              var docLinksList = [];
              pagesData.forEach((page) => { docLinksList.push(page.url); });
              // This maps url to id for later use in parentsLookup
              var linkToIDLookup = {};  // {link: ID}
              pagesData.forEach((page) => { linkToIDLookup[page.url]=page._id; });

              model.indexTable.page.getPagesWithChilds(docLinksList)    // [{url: X, childLinks: [childLinks1, childLinks2, ...] }, ...]
              .then((parentPagesData) => {

                // Process the parents, call it [1st piece] will be used in later process
                var parentsLookup = {}; // {docID: [parenturl1, parenturl2, ...]}
                parentPagesData.forEach((page) => {
                  page.childLinks.forEach((childLink) => {
                    if(parentsLookup[childLink]===undefined){
                      if(linkToIDLookup[childLink])
                        parentsLookup[linkToIDLookup[childLink]]=[page.url];
                    }
                    else parentsLookup[linkToIDLookup[childLink]].push(page.url);
                  });
                });


                // Process the pages by getting all pieces above together
                var pagesLookup = {}; // {docID: { title: X, url: X, ...} }
                pagesData.forEach((page) => {

                  pagesLookup[page._id] = {
                    title: page.title,
                    url: page.url,
                    favIconUrl: page.favIconUrl,
                    lastModifiedDate: page.lastModifiedDate,
                    lastCrawlDate: page.lastCrawlDate,
                    pageSize: page.size,
                    parentLinks: parentsLookup[page._id],   // [1st piece]
                    childLinks: page.childLinks,
                    wordFreq: wordsLookup[page._id]         // [2nd piece]
                  };

                });


                // Arrange the processed pages according to the rank earlier
                var finalPagesRank = [];
                mergedRankDocIDs.forEach((docID) => {   // remember that this mergedRankDocIDs contain docIDs that rank in descending order accord. to similarity.
                  finalPagesRank.push(pagesLookup[docID]);
                });


                // Resolve, with format unchanged
                resolve({
                  data: finalPagesRank,
                  querySummary: {
                    time: '0.01s',
                    resultsCnt: 230
                  }
                });

              })
            })
          })

        })
      })
    })
  }) // end:: root promise
}
