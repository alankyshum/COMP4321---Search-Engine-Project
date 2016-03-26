var http = require("http");
var htmlparser = require("htmlparser2");
var stemmer = require("porter-stemmer").stemmer; // usage: stemmer('Smurftastic')
var runTransaction = require('./db');  // methods: .insert , .find , .update
var stopwords = require('./config').stopwords;  // stopwords array
var lastLinkID = require('./config').lastLinkID;

var collections = {
    0: "linkData",
    
    1: "parentToChild",
    2: "childToParent",
    
    3: "WordID",
    
    4: "headWordIndex",
    5: "bodyWordIndex",
    
    6: "forwardIndex"
};


// ensure call once even when more than one error
var needCallback;
var callbackLock = function(callback){
    if(needCallback){
        needCallback = false;
        callback();
    }
}


// Compare to now date
var haveModified = function(headers, lastModified){
    if(headers["last-modified"]){
        if(new Date(headers["last-modified"]).getTime() > new Date(lastModified).getTime())
            return true;
    }
    else 
        if(new Date(headers["date"]).getTime() > new Date(lastModified).getTime())
           return true;
    
    return false;
}

// Check whether it is stopWord
var isStopword = function(word){
    return stopwords.indexOf(word)!=-1;
}

// Post processing
var postProcessing = function(isInsert, title, url, size, headIndex, BodyIndex, words, childs, callback){

    // Add / Update collections[0]
    if(isInsert){
        runTransaction.insert(
            collections[0], {
                id: lastLinkID++,   //!!! warning !!!!
                title: title,
                host: url.host,
                path: url.path,
                "last-modified": new Date(),
                size: size
            }
        );
        //console.log(lastLinkID);
    }
    else {
        //throw Error();
        console.log("UPDATE - " + url.host+url.path);
        runTransaction.update(
            collections[0],
            { host: url.host, path: url.path },
            {
                title: title,
                "last-modified": new Date(),
                size: size
            }
        );  

    }
    
    /*
    runTransaction.find(collections[3],{ $or: words },function(result){
        var wordToID = {};
        for(index in result)
            wordToID[result[index]["word"]] = result[index]["id"];
        
        var headIndexWithID = [];
        for(index in headIndex){
            var temp = {};
            temp[wordToID[index]] = [ { l-id: 
        }
            
        
        var bodyIndexWithID = [];
        for(index in bodyIndex)
            bodyIndexWithID.push({ word: wordToID[index], frequency: bodyIndex[index]});
        
        runTransaction.insertMany(collections[4], 

    });*/
    
    
    
    
    
    
    
    
    
    
    callback(childs);
}


var parse = function(url, callback){
    needCallback = true;
   var req = http.request(
       {method: "HEAD", host: url.host, port: 80, path: url.path},
       function(res){
           //console.log(res.headers);
           runTransaction.find(collections[0], { host: url.host, path: url.path}, function(result){
               //console.log(result);
               if(result.length==0||haveModified(res.headers,result[0]["last-modified"])){
                   var req = http.request(
                       {method: "GET", host: url.host, port: 80, path: url.path},
                       function(res){
                           title = "";
                           readBegin = 1;
                           titleBegin = 0;
                           indexType = -1;
                           headIndex = {};
                           bodyIndex = {};
                           words = [];
                           childs = [];
                           size = 0;
                           console.log("parser starts");
                           var parser = new htmlparser.Parser({
                                onopentag: function(name, attribs){
                                    if(name == "script"){
                                        readBegin=0;
                                    }
                                    if(name == "head"){
                                        indexType=0;
                                    }
                                    if(name == "body"){
                                        indexType=1;
                                    }
                                    if(name == "title"){
                                        titleBegin=1;
                                    }
                                    if(name == "a" && attribs.href && (attribs.href.match(/^http:\/\//) || attribs.href.match(/^https:\/\//)) ) {
                                        console.log(attribs.href);
                                        var hostAndPath = attribs.href.split("//")[1].trim();
                                        var pathMark = hostAndPath.indexOf('/');
                                        childs.push({
                                            host: pathMark==-1?hostAndPath:hostAndPath.slice(0, pathMark),
                                            path: pathMark==-1?"/":hostAndPath.slice(pathMark)
                                        });
                                    }
                                },
                                ontext: function(text){
                                    if(readBegin==1){
                                        if(titleBegin==1) title = text.trim();
                                        
                                        var result = text.match(/[A-Za-z]+/g);
                                        for(item in result)
                                            if(item!=null){  // solve strange problem that the parser gives null value
                                                var word = stemmer(result[item].toLowerCase());
                                                if(!isStopword(word)){
                                                    words.push({word: word});
                                                    if(indexType==0)
                                                        headIndex[word] = (headIndex[word]?headIndex[word]+1:1);
                                                    else if(indexType==1)
                                                        bodyIndex[word] = (bodyIndex[word]?bodyIndex[word]+1:1);
                                                }
                                            }
                                    }
                                },
                               onclosetag: function(tagname){
                                    if(tagname == "script"){
                                        readBegin=1;
                                    }
                                    if(tagname=="head"||tagname=="body")
                                        indexType=-1;
                                   if(tagname == "title"){
                                        titleBegin=0;
                                    }
                                }
                            }, {decodeEntities: true}
                           );
                           
                           res.on('data', function(chunk){
                               parser.write(chunk);
                               size += chunk.length;
                           });
                           
                           res.on('end', function(){
                               console.log(headIndex);
                               console.log(bodyIndex);
                                parser.end();
                               postProcessing(result.length==0, title, url, res.headers["content-length"]!=null?res.headers["content-length"]:size, headIndex, bodyIndex, words, childs, callback);
                           });
                           
                       }
                    );
               
               req.on('error', function(err){
                    console.log("HTTP Server connection error");
                    callbackLock(callback);
                });

                req.on('timeout', function(err){
                    console.log("HTTP Server connection timeout");
                   callbackLock(callback);
                });

                req.setTimeout(2000);
                req.end();
               }
               else callbackLock(callback);

               //console.log(result);
           });
       }
    );
    
    req.on('error', function(err){
        console.log("HTTP Server connection error");
        callbackLock(callback);
    });
    
    req.on('timeout', function(err){
        console.log("HTTP Server connection timeout");
        callbackLock(callback);
    });
    
    req.setTimeout(2000);
    req.end();
                
   
};



module.exports = parse;
