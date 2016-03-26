/**
 * MODULE :: CRAWLER
 * --------------------------
 * FUNCTIONS OCRAWL WORDS AND LINKS ON A PAGE
 */

module.exports = (() => {

	const X = require('x-ray')();
	X.timeout(10*1000);

	// EXTRACT WORDS + FREQUENCIES FROM A PAGE
	var extractWords = (link) => {
		return new Promise((resolve, reject) => {
			X(link, {
				allWords: 'body'
			})((err, bodyObj) => {
				if (err) reject(null)
				else resolve(bodyObj.allWords.replace(/[\n|\t|,|.|\(|\)|\:|\/|\\|\-|\[|\]]/g, ' ').split(' '));
			})
		});
	}

	// EXTRACT ALL LINKS ON A PAGE
	var extractLinks = (link) => {
		return new Promise((resolve, reject) => {
			X(link, {
				title: 'title',
				childLinks: ['a@href']
			})((err, pageInfo) => {
				if (err) reject(err)
				else {
					// extract unqiue url, ignoring http, https
					var linkSet = [];
					pageInfo.childLinks.forEach((link) => {
						var siginificantURL = link.match(/.+:\/\/(.+)/)[1];
						if (!~linkSet.indexOf(siginificantURL))
							linkSet.push(siginificantURL)
					});
					pageInfo.childLinks = linkSet;
					resolve(pageInfo);
				}
			});
		});
	}

	return {
		extractWords: extractWords,
		extractLinks: extractLinks
	}

})();
