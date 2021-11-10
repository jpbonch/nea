const path = require("path");
var helper = require('./helpers.js');


function createRoutes(app){

  app.get("/app", async function (req, res) {
    var db = helper.openDB();
    var query = `SELECT * FROM events`;
    var {rows} = await helper.queryDB(db, query, []);
    if (req.userId){
      var query = `SELECT displayName, profilePicture FROM users WHERE userId=${req.userId}`;
      var result = await helper.queryDB(db, query, []);
      var {displayName, profilePicture} = result.rows[0];
      res.render("app", {loggedIn:true, events:rows, displayName:displayName,
                         profilePicture:profilePicture})
    } else {
      res.render("app", {loggedIn: false, events:rows})
    }
    db.close((err) => helper.errorCatch(err));
  });

  app.get("/chat/:eventId", async function (req, res) {
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
  });

  app.post("/write", async function (req, res) {
    var {userId, displayName, content, time, eventId} = req.body;

    let db = helper.openDB();
    await db.run(`INSERT INTO "messages" VALUES (?, ?, ?, ?)`,
           [userId, content, time, eventId],
           (err) => helper.errorCatch(err));

    db.close((err) => helper.errorCatch(err));
  });

  app.get("/register", function (req, res) {
    res.render("register")
  });

  app.post("/register", async function (req, res) {
    var { email, password, confirmPassword } = req.body;
    if (password != confirmPassword){
      res.render('register', {
          message: 'Password does not match.',
          messageClass: 'failure'
      });
      return;
    }

      var db = await helper.openDB();
      // if user already exists
      var sql = `SELECT email FROM users WHERE email="${email}"`;
      var result = await helper.queryDB(db, sql, []);
      if(result.rows.length > 0){
        res.render('register', {
              message: 'User already registered.',
              messageClass: 'failure'
          });
          db.close((err) => helper.errorCatch(err));
          return;
      }
// restructure

// api more sports, future events, past events
// change password
// limits on displayName length, pfp size, obscene filters
// message when new profile saved
// green border around username input not obscene
// email address verification
// frontend
//forgot password on login
//make separate stylesheets
// profile pictures on messages (need to change db)
// make search actually work
// remove old events
// event details on chat page
// add red dot to live games
      var hash = helper.hashPassword(password);
      var defaultName = email.split('@')[0];
      var defaultPicture = "/images/default.jpeg";
      var authToken = helper.genAuthToken();
      await db.run(`INSERT INTO "users" VALUES (NULL, ?, ?, ?, ?, ?, NULL)`,
             [defaultName, email, defaultPicture, hash, authToken],
             (err) => helper.errorCatch(err));
      db.close((err) => helper.errorCatch(err));

      res.cookie('AuthToken', authToken);

      res.redirect("profile")



  });

  app.get('/login', (req, res) => {
    res.render('login');
  });

  app.post('/login', async (req, res) => {
      var { email, password } = req.body;
      var hash = helper.hashPassword(password);

      var db = await helper.openDB();
      var query = `SELECT userId FROM users WHERE email="${email}" AND passwordHash="${hash}"`;
      var result = await helper.queryDB(db, query, []);

      if (result.rows.length > 0){
        var userId = result.rows[0].userId;
        const authToken = helper.genAuthToken();
        await db.run(`UPDATE "users" SET authToken="${authToken}" WHERE userId=${userId}`, [],
               (err) => helper.errorCatch(err));
        res.cookie('AuthToken', authToken);
        res.redirect('app');
      } else {
        res.render('login', {
          message: 'Invalid username or password',
          messageClass: 'failure'
      });
      }
      db.close((err) => helper.errorCatch(err));
      });

      app.get('/', (req, res) => {
          res.render('index', {loggedIn: req.userId != undefined});
      });

      app.get('/profile', (req, res) => {
        if (req.userId){
          res.redirect('/profile/' + req.userId)
        } else {
          res.redirect('/')
        }
      });

      app.get('/profile/:userId', async (req, res) => {
        // get profile pic and displayname from db

        var db = await helper.openDB();
        var sql = `SELECT displayName, profilePicture, biography FROM users WHERE userId=${req.params.userId}`;
        var result = await helper.queryDB(db, sql, []);
        var {displayName, profilePicture, biography} = result.rows[0];

        if (req.userId == undefined){
          res.render("profile", {loggedIn: false, displayName:displayName, profilePicture:profilePicture, biography:biography});
          return;
        } else if (req.userId == req.params.userId){
          res.render("editProfile", {displayName:displayName, profilePicture:profilePicture, biography:biography})
        } else {
          var sql = `SELECT displayName, profilePicture, biography FROM users WHERE userId=${req.userId}`;
          var result = await helper.queryDB(db, sql, []);
          var {displayName: myDisplayName, profilePicture: myProfilePicture, biography: myBiography} = result.rows[0];
          res.render("profile", {loggedIn: true, displayName:displayName, profilePicture:profilePicture, biography:biography, myBiography:myBiography, myDisplayName:myDisplayName, myProfilePicture:myProfilePicture})
        }



        db.close((err) => helper.errorCatch(err));

        // var db = await helper.openDB();
        // var sql = `SELECT displayName, profilePicture, biography FROM users WHERE userId=${req.params.userId}`;
        // var result = await helper.queryDB(db, sql, []);
        // var {myDisplayName, myProfilePicture, myBiography} = result.rows[0];
        // if (req.params.userId == req.userId){
        //   res.render("editProfile", {displayName:myDisplayName, profilePicture:myProfilePicture, biography:myBiography});
        // } else{
        //   var sql = `SELECT displayName, profilePicture, biography FROM users WHERE userId=${req.params.userId}`;
        // var result = await helper.queryDB(db, sql, []);
        // var {myDisplayName, myProfilePicture, myBiography} = result.rows[0];
        //   res.render("profile", {displayName:displayName, profilePicture:profilePicture, biography:biography});
        // }
      });

      app.post("/profile", async (req, res) => {
        console.log(req.body)
        var {newDisplayName, newImageUrl, newBiography} = req.body;

        let db = helper.openDB();
        await db.run(`UPDATE "users" SET displayName="${newDisplayName}", profilePicture="${newImageUrl}", biography="${newBiography}" WHERE userId=${req.userId}`, [],
               (err) => helper.errorCatch(err));

        db.close((err) => helper.errorCatch(err));
        res.sendStatus(200);
      });

      app.get("/logout", async (req, res) => {
        let db = helper.openDB();
        await db.run(`UPDATE "users" SET authToken=NULL WHERE userId=${req.userId}`, [],
               (err) => helper.errorCatch(err));

        db.close((err) => helper.errorCatch(err));

        res.redirect("/");
      });

      app.get("/delete", async (req, res) => {
        let db = helper.openDB();
        await db.run(`DELETE FROM "users" WHERE userId=${req.userId}`, [],
               (err) => helper.errorCatch(err));
        db.close((err) => helper.errorCatch(err));

        res.redirect("/");
      })

}

module.exports = {
  router: createRoutes
};
