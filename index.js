const express = require("express");
const path = require("path");
const fetch = require("axios");
const fs = require("fs");
var http = require("http");
const sqlite3 = require("sqlite3").verbose();
const { default: axios } = require("axios");

const app = express();
app.use(express.json()) 
app.use(express.static("public"));

const server = http.createServer(app);
server.listen(80, () => {console.log('listening on port 80')});
const { Server } = require("socket.io");
const io = new Server(server);


app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "/public/index.html"));
});

io.on('connection', (socket) => {
  socket.on('chat message', (msg) => {
    io.emit('chat message', msg);
  });
});


app.get("/chat/*", function (req, res) {
  res.sendFile(path.join(__dirname, "/public/chat.html"));
});

app.post("/write/:eventType/:eventId", function (req, res) {
  var {username, content, time} = req.body;

  let db = new sqlite3.Database(
    `./db/${req.params.eventType}.db`,
    sqlite3.OPEN_READWRITE,
    (err) => {
      if (err) {
        console.error(err.message);
      }
    }
  );

  db.run(`INSERT INTO "${req.params.eventId}" VALUES (?, ?, ?)`, [username, content, time], function(err) {
    if (err) {
      console.error(err.message);
    }
    console.log(`A row has been inserted with rowid ${this.lastID}`);
  });

  db.close((err) => {
    if (err) {
      console.error(err.message);
    }
  });
});

app.get("/data/:eventType/:eventId", function (req, res) {
  // eventtpe= database, eventid = table
  // req.params.eventId
  // load nba/gameid databse
  // add all
  let db = new sqlite3.Database(
    `./db/${req.params.eventType}.db`, // can be nba, 
    sqlite3.OPEN_READWRITE,
    (err) => {
      if (err) {
        console.error(err.message);
      }
    }
  );

  var query = `SELECT Username, Time, Content FROM "${req.params.eventId}"`;
  db.all(query, [], (err, rows) => {
    if (err) {
      // create new table when error with columns username, content, time
      console.error("table does not exist");
      var query = `CREATE TABLE IF NOT EXISTS [${req.params.eventId}] (
            Username  TEXT NOT NULL,
            Content TEXT,
            Time    TEXT   NOT NULL
      )`;
      db.run(query, function(err) {
        if (err) {
          console.error(err.message);
        }
        console.log(`Table ${req.params.eventId} has been created`);
      });
      res.send({ message: [] });
    } else {
    res.send({ message: rows });
    }
  });

  db.close((err) => {
    if (err) {
      console.error(err.message);
    }
    // CLOSED THE DATABASE CONNECTION
  });
});

app.get("/events/nba", function (req, res) {
  const options = {
    method: "GET",
    url: "https://api-nba-v1.p.rapidapi.com/games/date/2021-08-08",
    headers: {
      "x-rapidapi-host": "api-nba-v1.p.rapidapi.com",
      "x-rapidapi-key": fs.readFileSync("keys/rapidapi-key.txt")
    },
  };
  axios
    .request(options)
    .then((response) => res.send(response.data))
    .catch(function (error) {
      console.error(error);
    });
});


