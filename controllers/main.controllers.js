const path = require("path");
var helper = require('../helpers.js');

function getIndex(req, res) {
    res.render('index', {loggedIn: req.userId != undefined});
}

async function getApp(req, res) {
  var db = helper.openDB();
  var query = `SELECT * FROM events ORDER BY startTimeUTC ASC`;
  var {rows} = await helper.queryDB(db, query, []);
  if (req.userId){
    var query = `SELECT displayName, profilePicture FROM users WHERE userId=${req.userId}`;
    var result = await helper.queryDB(db, query, []);
    var {displayName, profilePicture} = result.rows[0];
    res.render("app", {loggedIn:true, events:rows, displayName:displayName,
                       profilePicture:profilePicture, userId:req.userId})
  } else {
    res.render("app", {loggedIn: false, events:rows})
  }
  db.close((err) => helper.errorCatch(err));
}


async function getChat(req, res) {
  // eventtpe= database, eventid = table
  // req.params.eventId
  // load nba/gameid databse
  // add all
  if (req.userId){
  var db = await helper.openDB();
  var query = `SELECT messages.content, messages.time, users.displayName, messages.userId
  FROM messages
  JOIN users ON messages.userId=users.userId
  WHERE eventId = ${req.params.eventId}`;
  var {rows} = await helper.queryDB(db, query, []);

  var sql = `SELECT displayName, profilePicture, biography FROM users WHERE userId=${req.userId}`;
  var result = await helper.queryDB(db, sql, []);
  var {displayName: displayName, profilePicture: profilePicture, biography: biography} = result.rows[0];
  res.render("chat", {userId:req.userId, messages:rows, helper:helper, eventId:req.params.eventId, displayName:displayName, profilePicture:profilePicture});

  db.close((err) => helper.errorCatch(err));
} else {
  res.redirect('/')
}
}

async function postWrite(req, res) {
  var {userId, displayName, content, time, eventId} = req.body;

  let db = helper.openDB();
  await db.run(`INSERT INTO "messages" VALUES (?, ?, ?, ?)`,
         [userId, content, time, eventId],
         (err) => helper.errorCatch(err));

  db.close((err) => helper.errorCatch(err));
}



module.exports = {
  getApp,
  getChat,
  postWrite,
  getIndex
};
