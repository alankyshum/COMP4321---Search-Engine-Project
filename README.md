# COMP4321 - Search Engine

## Proress - Phase 1
- [ ] Implement a spider
	- [ ] Crawler
	- [ ] Index (30 pages from http://www.cse.ust.hk)
- [ ] Implement a test program which read data from the database
	- [ ] Outputs a plain-text file named `spider_result.txt`
- [ ] All supporting databases should be defined
	- [ ] Forward and inverted indexes
	- [ ] Mapping tables for URL <=> page ID
	- [ ] Word <=> word ID

### Format of `spider_result.txt`
```plain-text
Page title
URL
Last modification date, size of page
Keyword1 freq1; Keyword2 freq2; Keyword3 freq3; …...
Child Link1
Child Link2 .....
-----------------------------
```

## Group Members
| Name | Email | Student ID |
| --- | --- | --- |
| Alan Shum | kyshum@ust.hk | 20110916 |
| Ivan Fung | placeholder | placeholder |

## To start
1. Install `Node.JS`, `npm`
1. `cd <path to this project, root>`
1. `npm install`
1. `node scrapper.js`

## CREDITS
1. [X-Ray](https://github.com/lapwinglabs/x-ray) - Scrapper used in this project
