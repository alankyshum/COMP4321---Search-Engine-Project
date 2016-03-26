// VENDOR LIBRARY
const stemmer = require('./vendor/porterStemmer');
// DIVIDED MODULES
const crawler = require('./mod/crawler');
const stopword = require('./mod/stopword');
// OPTIONAL LIBRARY
const colors = require('colors');


// CONSTANTS
const rootLink = "https://www.cse.ust.hk/";  // TODO: Insert to DB by hardcoded, Link-ID <=> link Data
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
        page.childLinks.forEach((childLink) => {
            
            // TODO: Check childLink exists in DB, Link ID <=> Link Data
            // TODO: If yes, check last modified date => if changes => Update Link Data
            // TODO: If no, Insert to DB, Link-ID <=> Link Data
            // TODO: For both cases, check relationship exists, if not add Parent <=> Child Links
            // TODO: For both cases, check missing childs for this parent, if found delete Parent <=> old child Links (lazy deletion for Link Id <=> Link data for the not existed child too.
            
            queue.push(childLink);
        });
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