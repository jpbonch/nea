const path = require("path");
const fetch = require("node-fetch");
const fs = require("fs");
const sqlite3 = require("sqlite3").verbose();
var helper = require('./helpers.js');


function createRoutes(app){
  app.get("/", function (req, res) {
    res.render("index")
  });

  app.get("/chat/:eventId", function (req, res) {
    // eventtpe= database, eventid = table
    // req.params.eventId
    // load nba/gameid databse
    // add all
    let db = new sqlite3.Database(
      `./database.db`, // can be nba,
      sqlite3.OPEN_READWRITE,
      (err) => {
        if (err) {console.error(err.message);}
      }
    );

    var query = `SELECT messages.content, messages.time, users.displayName
    FROM messages
    JOIN users ON messages.userId=users.userId
    WHERE eventId = ${req.params.eventId}`;
    db.all(query, [], (err, rows) => {
      if (err) {console.error(err)}
      console.log(rows)
      res.render("chat", {messages:rows, helper:helper, eventId:req.params.eventId});
    });



    db.close((err) => {
      if (err) {console.error(err.message)}
    });

  });

  app.post("/write", function (req, res) {
    var {userId, displayName, content, time, eventId} = req.body;

    let db = new sqlite3.Database(
      `./database.db`,
      sqlite3.OPEN_READWRITE,
      (err) => {
        if (err) {
          console.error(err.message);
        }
      }
    );
    db.run(`INSERT INTO "messages" VALUES (?, ?, ?, ?)`,
    [userId, content, time, eventId],
    function(err) {
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
}

module.exports = {
  router: createRoutes
};
