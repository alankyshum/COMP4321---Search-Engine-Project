# COMP4321 - Search Engine

## Proress - Phase 1

- [x] Implement a spider

  - [x] Crawler
  - [x] Index (30 pages from <http://www.cse.ust.hk>)

- [x] Implement a test program which read data from the database

  - [x] Outputs a plain-text file named `spider_result.txt`

- [x] All supporting databases should be defined

  - [x] Forward and inverted indexes
  - [x] Mapping tables for URL <=> page ID
  - [x] Word <=> word ID

## Progress - Final Phase

It worths 20% of the course marks.

- [x] User inputs queries the search engine through the web interface
- [x] Returns the top documents to the user through the web interface
- [x] Index 300 pages starting from <http://www.cse.ust.hk/~ericzhao/COMP4321/TestPages/testpage.htm>
- [x] Submission: `spider`, `indexer`, `search engine`, `web interface` (NO `DB`)

  - [x] To CASS system `FinalPhase.zip`

- [x] Documentation (8-10 pages)

  - [x] Overall design of the system
  - [x] The file structures used in the index database
  - [x] Algorithms used (including the mechanism for favoring title matches)
  - [x] Installation procedure (it could be as simple as "Type make in the project directory")
  - [x] Highlight of features beyond the required specification
  - [x] Testing of the functions implemented; (e.g.) screenshots
  - [x] Conclusion:

    - [x] Strengths + Weaknesses of your systems;
    - [x] Self-reflection;
    - [x] Future Development
    - [x] Distribution of work

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

## To start

1. Install `Node.JS`, `npm`, `MongoDB`
2. `cd <path to this project, root>`
3. `npm install`
4. `node spider`: Start the spider to crawl web pages
5. `node server`: Start the server of the search engine

## Workarounds

Issue                      | Workaround
-------------------------- | -------------------------------------------------------
content-length (page-size) | length of response text from `http request`
last modified date         | Used current date, as suggested from the course website
