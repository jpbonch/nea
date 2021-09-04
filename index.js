const express = require('express');
const path = require('path');
const fetch = require('axios');
const fs = require("fs")
var http = require('http');
const { default: axios } = require('axios');

const app = express();
app.use(express.static('public'));


app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, '/public/index.html'));
});

app.get('/chat/:eventType/:eventId', function(req, res) {
    // req.params.eventId
    res.sendFile(path.join(__dirname, '/public/chat.html'));
});

app.get('/events/nba', function(req, res) {
    const options = {
        method: 'GET',
        url: 'https://api-nba-v1.p.rapidapi.com/games/date/2021-08-08',
        headers: {
          'x-rapidapi-host': 'api-nba-v1.p.rapidapi.com',
          'x-rapidapi-key': fs.readFileSync("keys/rapidapi-key.txt")
        }
      };
    axios.request(options)
    .then(response => res.send(response.data))
    .catch(function (error) {console.error(error)});
});

http.createServer(app).listen(80);
console.log('Server started at http://localhost:' + 80);
