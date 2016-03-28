/**
 * MODULE :: CRAWLER
 * --------------------------
 * FUNCTIONS OCRAWL WORDS AND LINKS ON A PAGE
 */
const http = require('follow-redirects').http;
const https = require('follow-redirects').https;
const cheerio = require('cheerio');
const StringDecoder = require('string_decoder').StringDecoder;

// EXTRACT WORDS + FREQUENCIES FROM A PAGE
module.exports.extractWords = (body) => {
	return body.replace(/[\n|\t|,|.|\(|\)|\:|\/|\\|\-|\[|\]]/g, ' ').split(' ');
}

// EXTRACT ALL LINKS ON A PAGE
module.exports.extractLinks = (link) => {
	return new Promise((resolve, reject) => {

		var decoder = new StringDecoder('utf8');
		(~link.indexOf('http://')?http:https).get(link, (res) => {
			res.on('data', (chunk) => {
				var body = decoder.write(chunk);
				var $ = cheerio.load(body);
				var linkSet = new Set();
				$('a[href]').each((a_i, a) => {
					linkSet.add((($(a).attr('href').match(/http[s]?:\/\//)?"":link)+$(a).attr('href')).replace(/([^:])\/\//, '$1/'));
				});
				resolve({
					title: $('title').text() || "",
					URL: link,
					lastModifiedDate: new Date(res.headers["last-modified"]) || null,
					pageSize: res.headers["content-length"] || body.length, // in bytes
					childLinks: Array.from(linkSet)
				});
			});
		}).on('error', (err) => {
			reject(err);
		});

	}); // end:: promise
}
