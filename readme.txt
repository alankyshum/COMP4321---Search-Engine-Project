
1. Install Node.JS, npm, mongodb
2. cd <path to this project, root>
3. npm install
4. npm start


Contribution Percentage:
Each of us contributes 50% to the whole project.

Alan Shum: Implement Crawler, Implement Output file, Design Schemas, Implement word/page indexes and operations
Ivan Fung: Fix Crawler, Implement BFS, Implement Forward/Inverted indexes and operations, Documentation


Note: 
Please find the Database schema in /mod/model.js
We choose mongodb because this situation is to store pages, which are document-like.
The schema is simple enough to understand.
In particular, we use array to store the posting lists and forward table lists instead of objects, which allows more efficient retrieval of postings one by one later on in the project.