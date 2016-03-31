const fs = require('fs');

const nr = "\r\n";
const seperator = "---------------------------------";
/**
 * MODULE :: FILE
 * --------------------------
 * MODULE FOR HANDLING FILE OUTPUT
 */

module.exports.writeSinglePage = (filename, page) => {
	console.log(`[FILE WRITING] ${page.title}: ${page.URL}`);
	var writeString = `${page.title}${nr}${page.URL}${nr}${page.lastModifiedDate}, ${page.pageSize}${nr}`;
	// TODO: keyword frequency
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
