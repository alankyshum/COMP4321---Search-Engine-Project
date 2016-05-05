/**
 * MOD:: SEARCH
 * --------------------------
 * SEARCH ITEM FROM THE SERVER
 */
const model = require('./model')
  , colors = require('colors')
  , config = require('../config.json')
  , cache = require('memory-cache');

module.exports.find = (wordFreq, wordPhrase, limit) => {   // wordFreq = {word: freq};  // wordPhrase = {"phrase": [word1, word2, ...] }

  // STORING BASIC INFORMATION OF QUERY RESULTS
  var queryStat = {
    startTime: new Date(),
    totalQueryResults: 0
  }

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
      // Lookup word to wordID
      var wordToWordIDLookup = {};
      wordsData.forEach((word) => { wordToWordIDLookup[word.word] = word._id; });

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
              for(i in word.docs) mtf=Math.max(mtf, word.docs[i].freq);

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
            console.log((rankDocIDs.title[docID]===undefined?0:rankDocIDs.title[docID])*config.titleWeight+
                          (rankDocIDs.body[docID]===undefined?0:rankDocIDs.body[docID])*(1-config.titleWeight));
          });


          // Sort mergedRankDocIDs desc
          mergedRankDocIDs.sort((doc1, doc2) => {   // [docID1, docID2 ....]
            return doc2.similarity-doc1.similarity;
          });

          return new Promise((resolve, reject) => {
            queryStat.totalQueryResults = mergedRankDocIDs.length;
            resolve(mergedRankDocIDs);   // slice to top X documents, where X=limit
          });

        }) // end:: found matching posts
        .then((mergedRankDocIDs) => {

          var finalSimilarity={};
          mergedRankDocIDs.forEach((doc) => { finalSimilarity[doc.docID]=doc.similarity; });
          mergedRankDocIDs = mergedRankDocIDs.map((doc) => { return doc.docID; }).slice(0,limit);



          console.log(`[SEARCHING] MATCH DOC TITLE:ID\t${mergedRankDocIDs}`.yellow);

          model.indexTable.forward.getDocsList(mergedRankDocIDs)  // [{docID: X, words: [{ wordID: X, freq: X, wordPos: X}, ...] }, ...]
          .then((wordsData) => {
            return new Promise((resolve, reject) => {
              var idList = [];
              wordsData.forEach((posting) => {
                posting.words.forEach((wordObj) => {
                  idList.push(wordObj.wordID)
                })
              });
              model.indexTable.word.getIDWord(idList)
              .then((wordObj) => {
                var idToWord = {};
                wordObj.forEach((w) => {
                  idToWord[w._id] = w.word;
                });
                wordsData = wordsData.map((posting) => {
                  return {
                    docID: posting.docID,
                    words: posting.words.map((wordObj) => {
                      return {
                        wordID: wordObj.wordID,
                        freq: wordObj.freq,
                        word: idToWord[wordObj.wordID]
                      }
                    })
                  }
                })
                resolve(wordsData);
              })
            })
          })
          .then((wordsData) => {

            // Call it [2nd piece] that will be used in final process
            var wordsLookup = {}; // {docID: [{ wordID: X, freq: X}, ...] }
            wordsData.forEach((posting) => { wordsLookup[posting.docID]=posting.words; });
            var phraseLookup = {}; // {docID: { wordID: [pos1, pos2, ...] } }
            wordsData.forEach((posting) => {
              phraseLookup[posting.docID]={};
              posting.words.forEach((word) => {
                phraseLookup[posting.docID][word.wordID]=word.wordPos;
              });
            });
            //console.log(phraseLookup);
           // console.log('check1');

            // Phrase handling
            Object.keys(wordPhrase).forEach((phrase) => {
              wordPhrase[phrase] = wordPhrase[phrase].map((word) => { return wordToWordIDLookup[word]; });
            });
            //console.log(wordPhrase);

            // Direct filter out documents do not contain phrase
            var tempRankDocIDs=[];
            mergedRankDocIDs.forEach((docID) => {

              //console.log(docID);

              var finalCheck = 1;
              Object.keys(wordPhrase).forEach((phrase) => {
                var posListArray = [];
                wordPhrase[phrase].forEach((wordID) => {
                  if(phraseLookup[docID][wordID]!==undefined)
                    posListArray.push(phraseLookup[docID][wordID]);
                  else posListArray.push([]);
                });

               // console.log("check mid");
                //console.log(posListArray);

                var posListLookup = {}; // {pos: wordIndex}
                var posListQueue = []; // posListQueue = [wordID1, wordID2, ..... ]
                posListArray.forEach((array, index) => {
                  array.forEach((pos) => {
                    posListLookup[pos]=index;
                  });
                });

                //console.log("check mid2");
                //console.log(posListLookup);

                var lastPos=-100;
                Object.keys(posListLookup).map((s) => { return parseInt(s); }).sort((x,y) => { return x-y;})
                  .forEach((pos) => {
                  if(pos!=lastPos+1) posListQueue.push(-100);
                  posListQueue.push(posListLookup[pos]);
                  lastPos=pos;
                });

                var targetIndex = posListArray.length-1;
                //console.log("targeT");
                //console.log(targetIndex);
                var curr=-100, smallCheck=0;
                for(i in posListQueue){
                  if(posListQueue[i]==0)
                    curr=0;
                  else if(curr+1==posListQueue[i])
                    curr++;
                  else curr=-100;
                  if(curr==targetIndex){
                    smallCheck=1;
                    break;
                  }
                }

                if(smallCheck==0) finalCheck=0;

                //console.log("queue");
                //console.log(posListQueue);

              });

              if(finalCheck==1) tempRankDocIDs.push(docID);
            });

            //console.log("check2");
            //console.log(tempRankDocIDs);

            mergedRankDocIDs = tempRankDocIDs.slice(0,limit);
            //console.log("newwwwwwwwwwwwwww");
            console.log(mergedRankDocIDs);
            console.log(finalSimilarity);


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
                    score: finalSimilarity[page._id],
                    title: page.title,
                    url: page.url,
                    favIconUrl: page.favIconUrl,
                    lastModifiedDate: page.lastModifiedDate,
                    lastCrawlDate: page.lastCrawlDate,
                    pageSize: page.size,
                    parentLinks: parentsLookup[page._id],   // [1st piece]
                    childLinks: page.childLinks,
                    wordFreq: wordsLookup[page._id].sort((word1, word2) => { return word2.freq-word1.freq; }).slice(0,5)         // [2nd piece]
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
                    time: (new Date() - queryStat.startTime)/1000,
                    resultsCnt: queryStat.totalQueryResults
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


module.exports.wordSuggest = (word) => {
  // suggest most similar word match, based on word frequency
  return model.indexTable.word.getSimilarWords(word)
  .then((wordIDList) => {
    var idToWordList = {};
    wordIDList.forEach((wordID) => {
      idToWordList[wordID._id] = wordID.word;
    })
    return model.indexTable.inverted.getWordFreq(Object.keys(idToWordList), false)
    .then((docList) => {
      var wordToFreq = {};
      docList.forEach((doc) => {
        if (!wordToFreq[idToWordList[doc.wordID]]) wordToFreq[idToWordList[doc.wordID]] = 0;
        doc.docs.forEach((docInfo) => {
          wordToFreq[idToWordList[doc.wordID]] += docInfo.freq;
        })
      })
      var sortedWords = Object.keys(wordToFreq);
      try {
        sortedWords.sort((word1, word2) => {
          return wordToFreq[word2]-wordToFreq[word1]; // lower freq --> swap --> desc
        })
      } catch(e) {console.error(e);}
      return new Promise((resolve, reject) => {
        resolve(sortedWords);
      })
    })
  })
}
