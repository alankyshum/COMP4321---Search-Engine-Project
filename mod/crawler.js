/**
 * MODULE :: CRAWLER
 * --------------------------
 * FUNCTIONS OCRAWL WORDS AND LINKS ON A PAGE
 */
const http = require('follow-redirects').http;
const https = require('follow-redirects').https;
const cheerio = require('cheerio');
const StringDecoder = require('string_decoder').StringDecoder;

module.exports = (() => {

	// EXTRACT WORDS + FREQUENCIES FROM A PAGE
	var extractWords = (body) => {
		return body.replace(/[\n|\t|,|.|\(|\)|\:|\/|\\|\-|\[|\]]/g, ' ').split(' ');
	}

	// EXTRACT ALL LINKS ON A PAGE
	var extractLinks = (link) => {
		return new Promise((resolve, reject) => {
			var decoder = new StringDecoder('utf8');
			(~link.indexOf('http://')?http:https).get(link, (res) => {
				res.on('data', (chunk) => {
					var $ = cheerio.load(decoder.write(chunk));
					var linkSet = new Set();
					$('a[href]').each((a_i, a) => {
                        var path = $(a).attr('href').split('?')[0];
                        if(path[0]=='/') path = path.slice(1);  // avoid treating "http://cse.ust.hk/ and http://cse.ust.hk// as two sites"
						linkSet.add(($(a).attr('href').match(/^http[s]?:\/\//)?"":link)+path);
					});
					resolve({
						lastModifiedDate: new Date(res.headers["last-modified"] || res.headers["date"]),
						pageSize: res.headers["content-length"] || chunk.length, // in bytes
						title: $('title').text() || "",
						childLinks: Array.from(linkSet)
					});
				});
			}).on('error', (err) => {
				reject(err);
			});

		}); // end:: promise
	}

	return {
		extractWords: extractWords,
		extractLinks: extractLinks
	}

})();
