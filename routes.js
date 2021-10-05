const path = require("path");
const fetch = require("node-fetch");
var helper = require('./helpers.js');


function createRoutes(app){

  app.get("/app", async function (req, res) {
    if (req.userId){
      var db = helper.openDB();
      var query = `SELECT * FROM events`;
      var {rows} = await helper.queryDB(db, query, []);


      var query = `SELECT displayName, profilePicture FROM users WHERE userId=${req.userId}`;
      var result = await helper.queryDB(db, query, []);
      var {displayName, profilePicture} = result.rows[0];
      res.render("app", {events:rows, displayName:displayName, profilePicture:profilePicture})
      db.close((err) => helper.errorCatch(err));
    } else {
      res.redirect('/')
    }
  });

  app.get("/chat/:eventId", async function (req, res) {
    // eventtpe= database, eventid = table
    // req.params.eventId
    // load nba/gameid databse
    // add all
    if (req.userId){
    var db = await helper.openDB();
    var query = `SELECT messages.content, messages.time, users.displayName
    FROM messages
    JOIN users ON messages.userId=users.userId
    WHERE eventId = ${req.params.eventId}`;
    var result = await helper.queryDB(db, query, []);
    res.render("chat", {messages:result.rows, helper:helper, eventId:req.params.eventId});

    db.close((err) => helper.errorCatch(err));
  } else {
    res.redirect('/')
  }
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
// profile page editable
// limits on displayName length, pfp size
// sign out button on profile
// maybe navbar in chat.html
// if not logged in chat.html
// restructure
// green border around username input not obscene
//obscene filters
// redirect frmo profile to app
      var hash = helper.hashPassword(password);
      await db.run(`INSERT INTO "users" VALUES (NULL, NULL, ?, NULL, ?, NULL)`,
             [email, hash],
             (err) => helper.errorCatch(err));

      var sql =`SELECT userId FROM users WHERE email="${email}" AND passwordHash="${hash}"`;
      var result = await helper.queryDB(db, sql, []);
      var userId = result.rows[0].userId;

      var authToken = helper.genAuthToken();
      var defaultName = email.split('@')[0];
      var defaultPicture = "/default.jpeg";
      await db.run(`UPDATE "users"
      SET authToken="${authToken}", displayName="${defaultName}", profilePicture="${defaultPicture}"
      WHERE userId=${userId}`, [],
             (err) => helper.errorCatch(err));
      res.cookie('AuthToken', authToken);


     db.close((err) => helper.errorCatch(err));

  });

  app.get('/login', (req, res) => {
    res.render('login');
  });

  app.post('/login', async (req, res) => {
      var { email, password } = req.body;
      var hash = helper.hashPassword(password);

      var db = await helper.openDB();
      var query = `SELECT userId FROM users WHERE email="${email}" AND passwordHash="${hash}"`;
      var result = helper.queryDB(db, query, []);

      if (result.rows.length > 0){
        var userId = result.rows[0].userId;
        const authToken = helper.genAuthToken();
        db.run(`UPDATE "users" SET authToken="${authToken}" WHERE userId=${userId}`, [],
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
        if (req.userId){
          res.redirect('app');
        } else {
          res.render('index');
        }
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
        console.log(req.params)
        console.log('lol')
        var db = await helper.openDB();
        var sql = `SELECT displayName, profilePicture FROM users WHERE userId=${req.params.userId}`;
        var result = await helper.queryDB(db, sql, []);
        var {displayName, profilePicture} = result.rows[0];
        if (req.params.userId == req.userId){
          res.render("editProfile", {displayName:displayName, profilePicture:profilePicture});
        } else {
          res.render("profile", {displayName:displayName, profilePicture:profilePicture});
        }

      });

      app.post("/profile", async (req, res) => {
        var {newDisplayName, newImageUrl} = req.body;

        let db = helper.openDB();
        db.run(`UPDATE "users" SET displayName="${newDisplayName}", profilePicture="${newImageUrl}" WHERE userId=${req.userId}`, [],
               (err) => helper.errorCatch(err));

        db.close((err) => helper.errorCatch(err));
      });

      app.get("/logout", async (req, res) => {
        let db = helper.openDB();
        db.run(`UPDATE "users" SET authToken=NULL WHERE userId=${req.userId}`, [],
               (err) => helper.errorCatch(err));

        db.close((err) => helper.errorCatch(err));

        res.redirect("/");
      });

}

module.exports = {
  router: createRoutes
};
