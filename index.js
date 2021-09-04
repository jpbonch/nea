const express = require("express");
const path = require("path");
const fetch = require("axios");
const fs = require("fs");
var http = require("http");
const sqlite3 = require("sqlite3").verbose();
const { default: axios } = require("axios");

const app = express();
app.use(express.static("public"));

app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "/public/index.html"));
});

app.get("/chat/*", function (req, res) {
  res.sendFile(path.join(__dirname, "/public/chat.html"));
});

app.get("/data/:eventType/:eventId", function (req, res) {
  // eventtpe= database, eventid = table
  // req.params.eventId
  // load nba/gameid databse
  // add all
  let db = new sqlite3.Database(
    `./db/${req.params.eventType}.db`,
    sqlite3.OPEN_READONLY,
    (err) => {
      if (err) {
        console.error(err.message);
      }
      console.log("Connected to the database.");
      var query = `SELECT Username, Time, Content FROM "${req.params.eventId}"`;
      db.all(query, [], (err, rows) => {
        if (err) {
          throw err;
        } // create new table when error
        res.send({ message: rows });
      });
    }
  );
  // if table not found
  //   CREATE TABLE [9484] (
  //     UserId  STRING NOT NULL,
  //     Content STRING,
  //     Time    TIME   NOT NULL
  // );

  db.close((err) => {
    if (err) {
      console.error(err.message);
    }
    console.log("Close the database connection.");
  });
});

app.get("/events/nba", function (req, res) {
  const options = {
    method: "GET",
    url: "https://api-nba-v1.p.rapidapi.com/games/date/2021-08-08",
    headers: {
      "x-rapidapi-host": "api-nba-v1.p.rapidapi.com",
      "x-rapidapi-key": fs.readFileSync("keys/rapidapi-key.txt"),
    },
  };
  axios
    .request(options)
    .then((response) => res.send(response.data))
    .catch(function (error) {
      console.error(error);
    });
});

http.createServer(app).listen(80);
console.log("Server started at http://localhost:" + 80);
