// VENDOR LIBRARY
const stemmer = require('./vendor/porterStemmer');
// DIVIDED MODULES
const crawler = require('./mod/crawler');
const stopword = require('./mod/stopword');
// OPTIONAL LIBRARY
const colors = require('colors');


// CONSTANTS
const rootLink = "https://www.cse.ust.hk/";
const maxCrawlPages = 300;
const dancePeriod = 180*1000;  // 180 seconds


// CREATE INDEX FROM DOCUMENTS
var index = {
	// <word>: {
	// 	<document>: <frequency>
	// }
};

/**
 * MAIN FUNCTION
 */


// BFS + ELIMINATE CYCLES
var queue = [rootLink];
var checked = {};
var crawledPages = 0;


var crawl = (link) => {
    crawler.extractLinks(link).then((page) => {
        
        console.log(`${crawledPages} ${link}`);
        //console.log(page.lastModifiedDate);
        //console.log(page.pageSize);
        //console.log(page.title);
        checked[link] = true;
        crawledPages++;
        page.childLinks.forEach((link) => { queue.push(link); });
        while(queue.length && checked[queue[0]])
            queue.shift();
        
        if(queue.length && crawledPages < maxCrawlPages)
            crawl(queue[0]);  // recursive crawling

    }).catch((error) => {
        console.error(error);
    });
};

// Server starts
crawl(queue[0]);


// Dance Cycle
setInterval(() => {
    queue = [rootLink];
    checked = {};
    crawledPages = 0;
    crawl(queue[0]);
}, dancePeriod);