const fs = require('fs');

const nr = "\r\n",
	seperator = "---------------------------------";
/**
 * MODULE :: FILE
 * --------------------------
 * MODULE FOR HANDLING FILE OUTPUT
 */

module.exports.cleanFile = (filename) => {
	console.log("CLEANING FILE");
	fs.writeFile(filename, '', (err) => {
		if (err) console.error(err);
	})
}

module.exports.writeSinglePage = (filename, page) => {
	console.log(`[FILE WRITING] ${page.title}: ${page.url}`);
	var writeString = `${page.title}${nr}${page.url}${nr}${page.lastModifiedDate}, ${page.pageSize}${nr}`;

	Object.keys(page.wordFreq).forEach((word) => {
		writeString += `${word} ${page.wordFreq[word]}; `
	});
	writeString += nr;

	page.childLinks.forEach((link) => {
		writeString += `${link}${nr}`;
	});
	writeString += `${seperator}${nr}`;
	fs.appendFile(filename, writeString, (err) => {
		(err) && console.error(err);
	});
}

module.exports.writeAll = (filename, pageArray) => {
	pageArray.forEach((page) => {
		module.exports.writeSinglePage(filename, page);
	})
}
