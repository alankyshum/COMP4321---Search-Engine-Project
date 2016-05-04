
 //  _____  _____ ___ ___ ___ ___   ___ ___ _____   _____ ___
 // | __\ \/ / _ \ _ \ __/ __/ __| / __| __| _ \ \ / / __| _ \
 // | _| >  <|  _/   / _|\__ \__ \ \__ \ _||   /\ V /| _||   /
 // |___/_/\_\_| |_|_\___|___/___/ |___/___|_|_\ \_/ |___|_|_\
 //
 //

const cluster = require('cluster');
const config = require('./config.json');

if (cluster.isMaster) {

  var numWorkers = require('os').cpus().length;
  console.info(`${numWorkers} process are setup`);
  for (var i = 0; i < numWorkers; i++) {
    cluster.fork();
  }

  cluster.on('online', (worker) => {
    console.log(`Worker ${worker.process.pid} is online`);
  });
  cluster.on('exit', (worker, code) => {
    console.error(`Worker[${worker.process.pid}] died with code ${code}`);
    cluster.fork();
  });

} else {

  const express = require('express')
  , app = express();

  const search = require('./mod/search')
  , model = require('./mod/model');

  app.use(express.static(`${__dirname}/frontend`));
  app.get('/query', (req, res) => {
    console.log(`[SERVER] GETTING SEARCH RESULTS OF "${req.query.s}"`);
    search.find(model.words.wordFreq(req.query.s), config.maxRankPages)
    .then((results) => {
      res.setHeader('Content-Type', 'application/json');
      res.send(results);
    });
  });
  app.get('/word', (req, res) => {
    console.log(`[SERVER] GETTING SEARCH SUGGESTIONS OF "${req.query.s}"`);
    search.wordSuggest(req.query.s)
    .then((results) => {
      res.setHeader('Content-Type', 'application/json');
      res.send(results);
    });
  });
  app.listen('3030', () => {
    console.info(`[SERVER] LISTENING AT PORT 3030`);
  });

}
