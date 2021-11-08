const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { router } = require("./routes.js");
var path = require ('path');
const sqlite3 = require("sqlite3").verbose();
const bodyParser = require("body-parser")
const cookieParser = require('cookie-parser');
var helper = require('./helpers.js');
const fetch = require("node-fetch");
require('dotenv').config()





const app = express();
app.use(express.json())
app.use(express.static("public"));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.set('views', path.join(__dirname, "views"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.use((req, res, next) => {
    // Get auth token from the cookies
    const authToken = req.cookies['AuthToken'];
    // Inject the user to the request
    // Find user where authtoken = authToken
    var db = helper.openDB();
    var query = `SELECT userId FROM users WHERE authToken="${authToken}"`;
    db.all(query, [], (err, rows) => {
      if (err) {console.error(err)}
      if (rows.length > 0){
        req.userId = rows[0].userId;
    }
    next();
})});

router(app)

async function updateEvents(sport, data){
  console.log(data)
    let db = await helper.openDB();
    if (sport == "basketball"){
    for (game of data.response){
    await db.run(`INSERT INTO "events" VALUES (NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ["basketball", game.date, game.status.long, game.league.name, game.stage, game.city, game.country.name, game.status.short,
    game.teams.away.name, game.teams.away.name, game.teams.away.logo, game.scores.away.total,
    game.teams.home.name, game.teams.home.name, game.teams.home.logo, game.scores.home.total],
    function(err) {if (err) {console.error(err.message)}
      console.log(`A row has been inserted with rowid ${this.lastID}`);
    });
  }
  }
if (sport == "football"){

  for (game of data.response){
    await db.run(`INSERT INTO "events" VALUES (NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ["football", game.fixture.date, game.fixture.status.long, game.league.name, game.fixture.venue.name, game.fixture.venue.city, game.league.country, game.fixture.status.short,
    game.teams.away.name, game.teams.away.name, game.teams.away.logo, game.goals.away,
    game.teams.home.name, game.teams.home.name, game.teams.home.logo, game.goals.home],
    function(err) {if (err) {console.error(err.message)}
      console.log(`A row has been inserted with rowid ${this.lastID}`);
    });
  }

}
await db.close((err) => helper.errorCatch(err));
return;


}


var minutes = 15
var interval = minutes * 60 * 1000;
setInterval(async function() {
    var today = new Date()
    // today.setDate(today.getDate() + 5) //DELETE
    var todayString = today.toISOString().split('T')[0]

    var options = {
      method: "GET",
      headers: {
        "x-rapidapi-host": "",
        "x-rapidapi-key": process.env.API_KEY
      }
    };

    var endpoints = [
      {url: "https://api-football-v1.p.rapidapi.com/v3/fixtures?league=39&season=2021&date=" + todayString,
       sport: "football",
       host: "api-football-v1.p.rapidapi.com"},
       {url: "https://api-basketball.p.rapidapi.com/games?date=" + todayString,
       sport: "basketball",
       host: "api-basketball.p.rapidapi.com"}
    ];

    for (endpoint of endpoints){
      options.headers["x-rapidapi-host"] = endpoint.host;
      console.log(options)
    fetch(endpoint.url, options).then((response) => response.json())
    .then(async jsonResult => {await updateEvents(endpoint.sport, jsonResult)})
    .catch((error) => console.log(error));
  }
}, interval);



const server = http.createServer(app);
server.listen(80, () => {console.log('listening on port 80')});
const io = new Server(server);
io.on('connection', (socket) => {
  socket.on('chat message', (msg) => {
    io.emit('chat message', msg);
  });
});
