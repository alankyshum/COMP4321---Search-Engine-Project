var rootURL = require('./config').rootURL;
var danceTime = require('./config').danceTime;
var maxCrawlPages = require('./config').maxCrawlPages;
var parse = require('./parse');


var dance = function (queue, crawledPages, checked) {

    while (queue.length && checked[queue[0].host + queue[0].path])
        queue.shift();

    if (queue.length) {
        parse(queue[0], function (childs) {
            console.log("finished");
            console.log(queue[0].host + " ... " + queue[0].path);
            checked[queue[0].host + queue[0].path] = true;
            console.log(crawledPages + "/" + maxCrawlPages);
            
            for (index in childs)
                queue.push(childs[index]);

            if (crawledPages < maxCrawlPages)
                dance(queue, crawledPages+1, checked);
        });
    }
};

var danceLoop = setInterval(function () {
    dance([rootURL], 0, {});
}, danceTime);

dance([rootURL], 0, {}); // execute one time on server start