
 //  _____  _____ ___ ___ ___ ___   ___ ___ _____   _____ ___
 // | __\ \/ / _ \ _ \ __/ __/ __| / __| __| _ \ \ / / __| _ \
 // | _| >  <|  _/   / _|\__ \__ \ \__ \ _||   /\ V /| _||   /
 // |___/_/\_\_| |_|_\___|___/___/ |___/___|_|_\ \_/ |___|_|_\
 //

const express = require('express');
const app = express();

app.use(express.static(`${__dirname}/frontend`));
app.get('/query', (req, res) => {
  console.log(req.query);
  res.setHeader('Content-Type', 'application/json');
  res.send(req.query);
});
app.listen('3030', () => {
  console.info(`[SERVER] LISTENING AT PORT 3030`);
})
