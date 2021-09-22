const path = require("path");
const fetch = require("node-fetch");
const fs = require("fs");
const sqlite3 = require("sqlite3").verbose();
var mustache = require('mustache');

function createRoutes(app){
  app.get("/", function (req, res) {
    res.sendFile(path.join(__dirname, "public/templates/index.html"));
  });

  app.get("/chat/*", function (req, res) {
    res.sendFile(path.join(__dirname, "public/templates/chat.html"));
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
    fetch("https://api-nba-v1.p.rapidapi.com/games/date/2021-08-08", {
      method: "GET",
      headers: {
        "x-rapidapi-host": "api-nba-v1.p.rapidapi.com",
        "x-rapidapi-key": fs.readFileSync("keys/rapidapi-key.txt").slice(0, -1)
      }
    }).then((response) => response.json())
    .then(jsonResult => res.send(jsonResult))
    .catch((error) => console.log(error));
  });
}


module.exports = {
  router: createRoutes
};
