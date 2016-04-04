# COMP4321 - Search Engine

## Proress - Phase 1
- [X] Implement a spider
	- [X] Crawler
	- [X] Index (30 pages from http://www.cse.ust.hk)
- [X] Implement a test program which read data from the database
	- [X] Outputs a plain-text file named `spider_result.txt`
- [ ] All supporting databases should be defined
	- [ ] Forward and inverted indexes
	- [X] Mapping tables for URL <=> page ID
	- [X] Word <=> word ID

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
| Ivan Fung | hlfungaa@connect.ust.hk | placeholder |

## To start
1. Install `Node.JS`, `npm`
1. `cd <path to this project, root>`
1. `npm install`
1. `npm start`

## Wordarounds
| Issue | Workaround |
| --- | --- |
| content-length (page-size) | length of response text from `http request` |
| last modified date |  |
| word.etAllID() does not contain some words Bug |  |

## CREDITS
