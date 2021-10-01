const path = require("path");
const fetch = require("node-fetch");
const fs = require("fs");
var helper = require('./helpers.js');



function createRoutes(app){

  app.get("/", function (req, res) {
    var db = helper.openDB();

    var query = `SELECT *
    FROM events`;
    db.all(query, [], (err, rows) => {
      if (err) {console.error(err)}
      console.log(rows)
      res.render("index", {events:rows})
    });


    db.close((err) => helper.errorCatch(err));

  });

  app.get("/chat/:eventId", function (req, res) {
    // eventtpe= database, eventid = table
    // req.params.eventId
    // load nba/gameid databse
    // add all
    var db = helper.openDB();
    var query = `SELECT messages.content, messages.time, users.displayName
    FROM messages
    JOIN users ON messages.userId=users.userId
    WHERE eventId = ${req.params.eventId}`;
    db.all(query, [], (err, rows) => {
      if (err) {console.error(err)}
      console.log(rows)
      res.render("chat", {messages:rows, helper:helper, eventId:req.params.eventId});
    });



    db.close((err) => helper.errorCatch(err));

  });

  app.post("/write", function (req, res) {
    var {userId, displayName, content, time, eventId} = req.body;

    let db = helper.openDB();
    db.run(`INSERT INTO "messages" VALUES (?, ?, ?, ?)`,
           [userId, content, time, eventId],
           (err) => helper.errorCatch(err));

    db.close((err) => helper.errorCatch(err));
  });

  app.get("/register", function (req, res) {
    res.render("register")
  });

  app.post("/register", function (req, res) {
    var { email, password, confirmPassword } = req.body;
    console.log(req.body)
    if (password == confirmPassword){
      var db = helper.openDB();
      // if user already exists
      var query = `SELECT email FROM users WHERE email="${email}"`;
      db.all(query, [], (err, rows) => {
        if (err) {console.error(err)}
        if (rows.length > 0){
          res.render('register', {
                message: 'User already registered.',
                messageClass: 'failure'
            });
            return;
        }
        var hash = helper.hashPassword(password);
        db.run(`INSERT INTO "users" VALUES (NULL, NULL, ?, NULL, ?)`,
               [email, hash],
               (err) => helper.errorCatch(err));

        res.render('login', {
              message: 'Registration Complete. Please login to continue.',
              messageClass: 'success'
        });
      });
      db.close((err) => helper.errorCatch(err));
    } else {
        res.render('register', {
            message: 'Password does not match.',
            messageClass: 'failure'
        });
    }
  });

  app.get('/login', (req, res) => {
    res.render('login');
  });
}

module.exports = {
  router: createRoutes
};
