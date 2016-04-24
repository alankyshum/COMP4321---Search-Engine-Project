# COMP4321 - Search Engine

## Proress - Phase 1
- [x] Implement a spider
	- [x] Crawler
	- [x] Index (30 pages from http://www.cse.ust.hk)
- [x] Implement a test program which read data from the database
	- [x] Outputs a plain-text file named `spider_result.txt`
- [x] All supporting databases should be defined
	- [x] Forward and inverted indexes
	- [x] Mapping tables for URL <=> page ID
	- [x] Word <=> word ID

## Progress - Final Phase

It worths 20% of the course marks.
- [x] User inputs queries the search engine through the web interface
- [ ] Returns the top documents to the user through the web interface
- [ ] Index 300 pages starting from http://www.cse.ust.hk/~ericzhao/COMP4321/TestPages/testpage.htm
- [ ] Submission: `spider`, `indexer`, `search engine`, `web interface` (NO `DB`)
	- [ ] To CASS system `FinalPhase.zip`
- [ ] Documentation (8-10 pages)
	- [ ] Overall design of the system
	- [ ] The file structures used in the index database
	- [ ] Algorithms used (including the mechanism for favoring title matches)
	- [ ] Installation procedure (it could be as simple as “Type make in the project directory”)
	- [ ] Highlight of features beyond the required specification
	- [ ] Testing of the functions implemented; (e.g.) screenshots
	- [ ] Conclusion:
		- [ ] Strengths + Weaknesses of your systems;
		- [ ] Self-reflection;
		- [ ] Future Development
		- [ ] Distribution of work

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
| Ivan Fung | hlfungaa@connect.ust.hk | 20115291 |

## To start
1. Install `Node.JS`, `npm`, `MongoDB`
1. `cd <path to this project, root>`
1. `npm install`
1. `node spider`: Start the spider to crawl web pages
1. `node server`: Start the server of the search engine

## Workarounds
| Issue | Workaround |
| --- | --- |
| content-length (page-size) | length of response text from `http request` |
| last modified date | Used current date, as suggested from the course website |
