/**
 * MODULE :: WORDS
 * --------------------------
 * ALL FUNCTIONS RELATED TO WORD PROCESSING
 */
const fs = require('fs');
const cache = require('memory-cache');
const stemmer = require('porter-stemmer').stemmer;

// CHECK IF WORD IS STOP WORD
var is = (word) => {
	!cache.get('stopWordList') && cache.put('stopWordList', fs.readFileSync("./data/stopwords.txt", 'utf8').replace(/\r\n/g, '\n').split('\n'));
	return !!~cache.get('stopWordList').indexOf(word);
}
module.exports.is = is;

// RETURN LIST OF NON-STOPWORD + STEMMED WORDS
var getSearchables = (wordList) => {
  wordList = wordList.map((word) => { return word.toLowerCase(); });  // search "getting" in frontend, you will know why (with and without this line)
  
	return wordList.filter((word) => {
		return !is(word)
	}).map((word) => {
		return stemmer(word).toLowerCase()
	});
}
module.exports.getSearchables = getSearchables;

// RETURN WORD -> FREQUENCY HAS TABLE FROM DOCUMENT BODY
var wordFreq = (body) => {
	var wordFreq = {};
	var wordList = body.match(/\w+/g); // match word

  if(wordList==null) return {};  // bug fix: wordList can be null in some pages

	getSearchables(wordList).forEach((word) => {
		if (!wordFreq[word]) wordFreq[word] = 0;
		wordFreq[word]++;
	})
	return wordFreq;
}

var startIndex = 0;
var wordPosHelper = (wordString, wordPos) => {
  var wordList = wordString.match(/\w+/g); // match word
  
  if(wordList==null) return {};
  
  getSearchables(wordList).forEach((word) => {
		if (!wordPos[word]) wordPos[word]=[startIndex];
    else wordPos[word].push(startIndex);
    ++startIndex;
	});
  
  return wordPos;
}

var wordPos = (title, body) => {
  var wordPos = {};   // {word: [pos1, pos2, pos3, ...]}
  
  startIndex = 0;
  wordPos = wordPosHelper(title,wordPos);
  ++startIndex;  // prevent title last word and body first word, being treated as neighbour!
  wordPos = wordPosHelper(body,wordPos);
  return wordPos;
}

var wordPhrase = (wordString) => {
  var wordPhrase = {};  // wordPhrase = {"phrase": [word1, word2, ...] }
  
  console.log(wordString);
  
  var parsed="";
  
  for(i=0;i<wordString.length;i++)
    if(wordString.charAt(i)!='\"')
      parsed=parsed.concat(wordString.charAt(i));
    else parsed=parsed.concat(" ",wordString.charAt(i)," ");
  
  console.log(parsed);
  
  var wordList2 = parsed.match(/(\w|\")+/g);
  wordList2.push("dummy");    // dummy is to make checking below correct
  console.log(wordList2);
  console.log("wordList end");
  
  var check = 0, temp=[];
  getSearchables(wordList2).forEach((word) => {
    if(check==0&&temp.length!=0){
      wordPhrase[temp.join(" ")] = temp;
      temp=[];
    }
    
    if(word=="\"") check=1-check;
    else if(check==1){ temp.push(word); }
  });
  
  return wordPhrase;
};

module.exports.wordFreq = wordFreq;
module.exports.wordPos = wordPos;
module.exports.wordPhrase = wordPhrase;
