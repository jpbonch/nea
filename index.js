const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { router } = require("./routes.js")
const fetch = require("node-fetch");
const fs = require("fs");
const sqlite3 = require("sqlite3").verbose();

const app = express();
app.use(express.json())
app.use(express.static("public"));

router(app)

function updateEvents(data){
  let db = new sqlite3.Database(
    `./database.db`,
    sqlite3.OPEN_READWRITE,
    (err) => {
      if (err) {
        console.error(err.message);
      }
    });

    for (game of data){
    db.run(`INSERT INTO "events" VALUES (NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [game.startTimeUTC, game.statusGame, game.league, game.arena, game.city, game.country, game.currentPeriod,
    game.vTeam.shortName, game.vTeam.fullName, game.vTeam.logo, game.vTeam.score.points,
    game.hTeam.shortName, game.hTeam.fullName, game.hTeam.logo, game.hTeam.score.points],
    function(err) {if (err) {console.error(err.message)}
      console.log(`A row has been inserted with rowid ${this.lastID}`);
    });
  }

  db.close((err) => {
    if (err) {
      console.error(err.message);
    }
    // CLOSED THE DATABASE CONNECTION
  });
}


var minutes = 0.1
var interval = minutes * 60 * 1000;
setInterval(function() {
    var today = new Date()
    today.setDate(today.getDate() + 31) //DELETE
    var todayString = today.toISOString().split('T')[0]
    fetch("https://api-nba-v1.p.rapidapi.com/games/date/" + todayString, {
      method: "GET",
      headers: {
        "x-rapidapi-host": "api-nba-v1.p.rapidapi.com",
        "x-rapidapi-key": fs.readFileSync("keys/rapidapi-key.txt").slice(0, -1)
      }
    }).then((response) => response.json())
    .then(jsonResult => updateEvents(jsonResult.api.games))
    .catch((error) => console.log(error));
}, interval);


const server = http.createServer(app);
server.listen(80, () => {console.log('listening on port 80')});
const io = new Server(server);
io.on('connection', (socket) => {
  socket.on('chat message', (msg) => {
    io.emit('chat message', msg);
  });
});
