var helper = require('../helpers.js');

function getIndex(req, res) {
    // Load index.html when the user navigates to /index
    res.render('index', {loggedIn: req.userId != undefined});
}

async function getApp(req, res) {
  var db = helper.openDB();
  var query = `SELECT * FROM events ORDER BY startTimeUTC DESC`;
  var {rows} = await helper.queryDB(db, query, []);
  var events = helper.sortSports(rows);
  if (req.userId){ // If user is logged in
    var query = `SELECT displayName, profilePicture FROM users WHERE userId=${req.userId}`;
    var result = await helper.queryDB(db, query, []);
    var {displayName, profilePicture} = result.rows[0];
    // If user is logged in, load the page with their information
    res.render("app", {loggedIn:true, events:events, displayName:displayName,
                       profilePicture:profilePicture, userId:req.userId, maxEvents:4})
  } else {
    // else, load it without their information
    res.render("app", {loggedIn: false, events:events, maxEvents:4})
  }
  db.close((err) => helper.errorCatch(err));
}


async function getChat(req, res) {
  if (req.userId) { // If user is logged in
    var db = await helper.openDB();
    // Get all messages from database with matching eventId
    var query = `SELECT messages.content, messages.time, users.displayName, messages.userId, users.profilePicture
    FROM messages
    JOIN users ON messages.userId=users.userId
    WHERE eventId = ${req.params.eventId}`;
    var {rows} = await helper.queryDB(db, query, []);

    // Get user information
    var sql = `SELECT displayName, profilePicture, biography FROM users WHERE userId=${req.userId}`;
    var result = await helper.queryDB(db, sql, []);
    var {displayName: displayName, profilePicture: profilePicture, biography: biography} = result.rows[0];

    // Get event information
    var query = `SELECT startTimeUTC, vTeamFullName, hTeamFullName, vTeamLogo, hTeamLogo, vTeamScore, hTeamScore, statusGame, arena, city, country FROM events WHERE eventId=${req.params.eventId}`;
    var result = await helper.queryDB(db, query, []);
    var event = result.rows[0];
    event.startTimeUTC = helper.formatDate(event.startTimeUTC)

    res.render("chat", {loggedIn:true, userId:req.userId, messages:rows, event:event, helper:helper, eventId:req.params.eventId, displayName:displayName, profilePicture:profilePicture});

    db.close((err) => helper.errorCatch(err));
  } else {
    // Redirect to index page if not logged in
    res.redirect('/');
  }
}

async function postWrite(req, res) {
  // Get parameters from request object
  var {userId, content, time, eventId} = req.body;

  let db = helper.openDB();
  // Add new message to the database
  await db.run(`INSERT INTO "messages" VALUES (?, ?, ?, ?)`,
         [userId, content, time, eventId],
         (err) => helper.errorCatch(err));

  db.close((err) => helper.errorCatch(err));
}

async function getSearch(req, res) {
  let db = helper.openDB();
  // Search query will be like {key: value}
  // Need to create an SQL query that has 'WHERE key LIKE VALUE'
  var key = Object.keys(req.query)[0];
  if (key == "team"){
    var condition = `hTeamFullName LIKE '%${req.query[key]}%' OR vTeamFullName LIKE '%${req.query[key]}%'`;
  } else {
    var condition = `${key} LIKE '%${req.query[key]}%'`;
  }
  var sql = `SELECT * FROM events WHERE ${condition} ORDER BY startTimeUTC DESC`
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

  // Send URL of profile picture
  res.send({response: result.rows[0].profilePicture})
  
  db.close((err) => helper.errorCatch(err));
}

// Export modules
module.exports = {
  getApp,
  getChat,
  postWrite,
  getIndex,
  getSearch,
  getProfilePicture
};
