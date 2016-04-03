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

// EXTRACT ALL LINKS ON A PAGE
module.exports.extractLinks = (link) => {
	return new Promise((resolve, reject) => {

		var decoder = new StringDecoder('utf8');
		(~link.indexOf('http://')?http:https).get(link, (res) => {
			res.on('data', (chunk) => {
				console.log(`[debug] ${link}`);
				var $ = cheerio.load(decoder.write(chunk));

				// LIKNS
				var linkSet = new Set();
				$('a[href]').each((a_i, a) => {
					linkSet.add((($(a).attr('href').match(/http[s]?:\/\//)?"":link)+$(a).attr('href')).replace(/([^:])\/\//, '$1/').replace(/\/+$/, ''));
				});

				resolve({
					title: $('title').text() || "",
					url: link.replace(/\/+$/, ''),
					lastModifiedDate: res.headers["last-modified"] && new Date(res.headers["last-modified"]) || new Date(res.headers["date"]),
					lastCrawlDate: new Date(),
					pageSize: res.headers["content-length"] || chunk.length, // in bytes
					childLinks: Array.from(linkSet),
					wordFreq: $('body').text()?model.words.wordFreq($('body').text()):{}
				});
			});
		}).on('error', (err) => {
			reject(err);
		});

	}); // end:: promise
}

// RECURSIVELY EXTRACT LINK
// middleCB: Callback for each successful page crawl
// finalCB: Callback after everything's done
// [TODO: Dance Cycle + Checking last modified date in second, third ... dance before fetching]
module.exports.recursiveExtractLink = (link, middleCB, finalCB) => {
	'use strict';
	var crawledLinks = {};
	var allPages = []; // object to be written to result.txt
	var _queue = [link], _levels = {};

	var crawlChild = (link) => {
		if (!_levels[link]) _levels[link] = 0;
		if (_levels[link] > config.maxLevels) {
			finalCB(allPages);
		} else {
			// console.log(`${_levels[link]}th level: ${link}`);
			module.exports.extractLinks(link).then((page) => {
				crawledLinks[link] = true;
				allPages.push(page);
				middleCB(page);
				var loopLimit = Math.min(page.childLinks.length-1, config.maxChildPages);
				page.childLinks.every((childLink, link_i) => {     // [need review] strange logic
					if (link_i < loopLimit) {
						_levels[childLink] = _levels[link] + 1;
						_queue.push(childLink);
						return true;
					} else {
						return false;
					}
				});
				while (_queue.length && crawledLinks[_queue[0]]) _queue.shift();
				
        if(_queue.length) crawlChild(_queue[0]);
			})
		}
	}

	crawlChild(link);

}
