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
    var events = helper.sortSports(rows);
    res.render("app", {loggedIn:true, events:events, displayName:displayName,
                       profilePicture:profilePicture, userId:req.userId, maxEvents:4})
  } else {
    res.render("app", {loggedIn: false, events:rows})
  }
  db.close((err) => helper.errorCatch(err));
}


async function getChat(req, res) {

  if (req.userId){
  var db = await helper.openDB();
  var query = `SELECT messages.content, messages.time, users.displayName, messages.userId, users.profilePicture
  FROM messages
  JOIN users ON messages.userId=users.userId
  WHERE eventId = ${req.params.eventId}`;
  var {rows} = await helper.queryDB(db, query, []);

  var sql = `SELECT displayName, profilePicture, biography FROM users WHERE userId=${req.userId}`;
  var result = await helper.queryDB(db, sql, []);
  var {displayName: displayName, profilePicture: profilePicture, biography: biography} = result.rows[0];

  

  res.render("chat", {loggedIn:true, userId:req.userId, messages:rows, helper:helper, eventId:req.params.eventId, displayName:displayName, profilePicture:profilePicture});

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

async function getSearch(req, res) {
  let db = helper.openDB();
  var key = Object.keys(req.query)[0];
  if (key == "team"){
    var condition = `hTeamFullName LIKE '%${req.query[key]}%' OR vTeamFullName LIKE '%${req.query[key]}%'`;
  } else {
    var condition = `${key} LIKE '%${req.query[key]}%'`;
  }
  var sql = `SELECT * FROM events WHERE ${condition} ORDER BY startTimeUTC ASC`
  var result = await helper.queryDB(db, sql, []);

  var query = `SELECT displayName, profilePicture FROM users WHERE userId=${req.userId}`;
  var resp = await helper.queryDB(db, query, []);
  var {displayName, profilePicture} = resp.rows[0];

  var events = helper.sortSports(result.rows);
  
  res.render("app", {loggedIn:true, events:events, displayName:displayName,
                       profilePicture:profilePicture, userId:req.userId, maxEvents:50})


  db.close((err) => helper.errorCatch(err));
  
}

async function getProfilePicture(req, res) {
  let db = helper.openDB();

  var sql = `SELECT profilePicture FROM users WHERE userId=${req.params.userId}`;
  var result = await helper.queryDB(db, sql, []);

  res.send({response: result.rows[0].profilePicture})
  
  db.close((err) => helper.errorCatch(err));
}

module.exports = {
  getApp,
  getChat,
  postWrite,
  getIndex,
  getSearch,
  getProfilePicture
};
