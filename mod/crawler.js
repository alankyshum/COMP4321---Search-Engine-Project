/**
 * MODULE :: CRAWLER
 * --------------------------
 * FUNCTIONS OCRAWL WORDS AND LINKS ON A PAGE
 */
const config = require('../config.json');
const http = require('follow-redirects').http;
const https = require('follow-redirects').https;
const cheerio = require('cheerio');
const StringDecoder = require('string_decoder').StringDecoder;
const model = require('./model');
const url = require('url');

// EXTRACT ALL LINKS ON A PAGE
module.exports.extractLinks = (link) => {

	return new Promise((resolve, reject) => {

		var crawlTimeout = setTimeout(() => {
			console.error(`[CRAWLER] Crawling ${link} timeout of [${config.crawlTimeout/1000}s] limit`);
			reject("timeout");
		}, config.crawlTimeOut);

		var decoder = new StringDecoder('utf8');
		(~link.indexOf('http://')?http:https).get(link, (res) => {

		  var linkSet = new Set();
      var data = "";

			res.on('data', (chunk) => {
				if (crawlTimeout) {
					clearTimeout(crawlTimeout);
					crawlTimeout = null;
				}
        data += chunk;
			});

      res.on('end', () => {
        var $ = cheerio.load(decoder.write(data));
        
        var body = $("body").html($("body").html().replace(/<br\s*[\/]?>/gi, "\n")).text();
       // console.log(body);
        var title = $("title").html($("title").html().replace(/<br\s*[\/]?>/gi, "\n")).text();
        var bodyTitle = body.concat(title);
        
        
				$('a[href]').each((a_i, a) => {
					linkSet.add(url.resolve(link, $(a).attr('href')));
			 	});
				var favIcon = $('[rel]').filter((relItem_i, relItem) => {
					return ~$(relItem).attr('rel').indexOf('shortcut')
				})[0];
        resolve({
					title: $('title').text() || "",
					url: link.replace(/\/+$/, ''),
					favIconUrl: favIcon?url.resolve(link, $(favIcon).attr('href')):"",
					lastModifiedDate: res.headers["last-modified"] && new Date(res.headers["last-modified"]) || new Date(res.headers["date"]),
					lastCrawlDate: new Date(),
					pageSize: res.headers["content-length"] || data.length,
					childLinks: Array.from(linkSet),   // [need review] child link needs to be inserted
          wordFreqTitle: title?model.words.wordFreq(title):{},
					wordFreqBody: body?model.words.wordFreq(body):{},
          wordFreq: bodyTitle?model.words.wordFreq(bodyTitle):{},   // {word: freq}
          wordPos: bodyTitle?model.words.wordPos(title, body):{}  // {word: [pos1, pos2, pos3, ...]}
				});
      });

    }).on('error', (err) => {
			reject(err);
		});

	});
}


// RECURSIVELY EXTRACT LINK
// middleCB: Callback for each successful page crawl
// finalCB: Callback after everything's done
// [TODO: Dance Cycle + Checking last modified date in second, third ... dance before fetching]
module.exports.recursiveExtractLink = (link, middleCB, finalCB) => {
	'use strict';
	var crawledLinks = {}, numCrawled = 0;
	var allPages = []; // object to be written to result.txt
	var _queue = [link];

  var crawlChild = () => {
    while(_queue.length&&crawledLinks[_queue[0]]==true) _queue.shift();   // BFS + Eliminate Cycles
    if(_queue.length && numCrawled < config.maxPages)
      module.exports.extractLinks(_queue[0]).then((page) => {
        numCrawled++;
        crawledLinks[_queue[0]]=true;
        _queue.shift();
        allPages.push(page);
        page.childLinks.forEach((link) => { _queue.push(link); });

        // Callback
        middleCB(page);

        // recursively call
        crawlChild();
      });
    else if(numCrawled < config.maxPages)
      console.log(`[Error] Cannot retrieve enough pages - current: ${numCrawled}, target: ${config.maxPages}`);
    else finalCB(allPages);
  }

  // initial call
  crawlChild();
}
