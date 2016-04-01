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
const modal = require('./modal');

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
					linkSet.add((($(a).attr('href').match(/http[s]?:\/\//)?"":link)+$(a).attr('href')).replace(/([^:])\/\//, '$1/'));
				});

				resolve({
					title: $('title').text() || "",
					URL: link,
					lastModifiedDate: new Date(res.headers["last-modified"]) || null,
					pageSize: res.headers["content-length"] || chunk.length, // in bytes
					childLinks: Array.from(linkSet),
					wordFreq: $('body').text()?modal.words.wordFreq($('body').text()):{}
				});
			});
		}).on('error', (err) => {
			reject(err);
		});

	}); // end:: promise
}

// RECURSIVELY EXTRACT LINK
module.exports.recursiveExtractLink = (link, cb) => {
	'use strict';
	var crawledLinks = modal.cache().crawledLinks.get();
	var allPages = []; // object to be written to result.txt
	var _queue = [link], _levels = {};

	var crawlChild = (link) => {
		if (!_levels[link]) _levels[link] = 0;
		if (_levels[link] > config.maxLevels) {
			cb(allPages);
		} else {
			// console.log(`${_levels[link]}th level: ${link}`);
			module.exports.extractLinks(link).then((page) => {
				crawledLinks[link] = true;
				allPages.push(page);
				var loopLimit = Math.min(page.childLinks.length-1, config.maxChildPages);
				page.childLinks.every((childLink, link_i) => {
					if (link_i < loopLimit) {
						_levels[childLink] = _levels[link] + 1;
						_queue.push(childLink);
						return true;
					} else {
						return false;
					}
				});
				while (_queue.length && crawledLinks[_queue[0]]) _queue.shift();
				_queue.length && crawlChild(_queue[0]);
			})
		}
	}

	crawlChild(link);

}
