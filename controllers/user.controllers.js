var helper = require('../helpers.js');
var Filter = require('bad-words');


function getLogin(req, res) {
  // Render login.html when user visits /login
  res.render('login');
}

function getRegister(req, res) {
  // Render register.html when user visits /register
  res.render("register")
}

async function postRegister(req, res) {
  var { email, password, confirmPassword } = req.body;
  // If passwords don't match, send error message to client
  if (password != confirmPassword){
    res.render('register', {
        message: 'Password does not match.',
        messageClass: 'failure'
    });
    return;
  }

  var db = await helper.openDB();
  // If user already exists, send error message to client
  var sql = `SELECT email FROM users WHERE email="${email}"`;
  var result = await helper.queryDB(db, sql, []);
  if(result.rows.length > 0){
    res.render('register', {
          message: 'Error: User already registered.',
          messageClass: 'failure'
      });
      db.close((err) => helper.errorCatch(err));
      return;
  }

  // Set default profile picture and display name
  var hash = helper.hashPassword(password);
  var defaultName = email.split('@')[0];
  var defaultPicture = "/images/default.jpeg";
  var authToken = helper.genAuthToken();
  // Write them to database
  await db.run(`INSERT INTO "users" VALUES (NULL, ?, ?, ?, ?, ?, NULL)`,
          [defaultName, email, defaultPicture, hash, authToken],
          (err) => helper.errorCatch(err));
  db.close((err) => helper.errorCatch(err));

  // Leave authtoken cookie on client's browser
  res.cookie('AuthToken', authToken);

  res.redirect("app")
}


async function getProfile(req, res) {
  var db = await helper.openDB();
  var sql = `SELECT displayName, profilePicture, biography FROM users WHERE userId=${req.params.userId}`;
  var result = await helper.queryDB(db, sql, []);
  var {displayName, profilePicture, biography} = result.rows[0];

  if (req.userId == undefined){ // If user is not logged in
    res.render("profile", {loggedIn: false, displayName:displayName, profilePicture:profilePicture, biography:biography});
    return;
  } else if (req.userId == req.params.userId){ // If the requested profile is the user's
    res.render("editProfile", {loggedIn:true, displayName:displayName, profilePicture:profilePicture, biography:biography, userId:req.userId})
  } else { // If the requested profile is not the user's
    var sql = `SELECT displayName, profilePicture, biography FROM users WHERE userId=${req.userId}`;
    var result = await helper.queryDB(db, sql, []);
    var {displayName: myDisplayName, profilePicture: myProfilePicture, biography: myBiography} = result.rows[0];
    res.render("profile", {loggedIn: true, userId:req.userId, displayName:displayName, profilePicture:profilePicture, biography:biography, myBiography:myBiography, myDisplayName:myDisplayName, myProfilePicture:myProfilePicture})
  }

  db.close((err) => helper.errorCatch(err));
}

async function postLogin(req, res) {
    var { email, password } = req.body;
    var hash = helper.hashPassword(password);

    var db = await helper.openDB();
    // Queries for a user with the same email and password
    var query = `SELECT userId FROM users WHERE email="${email}" AND passwordHash="${hash}"`;
    var result = await helper.queryDB(db, query, []);

    if (result.rows.length > 0) {
      // If user was found with matching credentials:
      var userId = result.rows[0].userId;
      const authToken = helper.genAuthToken();
      await db.run(`UPDATE "users" SET authToken="${authToken}" WHERE userId=${userId}`, [],
             (err) => helper.errorCatch(err));
      res.cookie('AuthToken', authToken);
      res.redirect('app');
    } else {
      // If no user was found with the matching credentials:
      res.render('login', {
        message: 'Invalid email or password',
        messageClass: 'failure'
    });
    }
    db.close((err) => helper.errorCatch(err));
}

async function postProfile (req, res) {
  console.log(req.body)
  var {newDisplayName, newImageUrl, newBiography} = req.body;
  filter = new Filter();
  newDisplayName = filter.clean(newDisplayName);
  newBiography = filter.clean(newBiography);

  if(newDisplayName.length > 10) newDisplayName = newDisplayName.substring(0,10);
  if(newBiography.length > 10) newBiography = newBiography.substring(0,10);

  let db = helper.openDB();
  await db.run(`UPDATE "users" SET displayName="${newDisplayName}", profilePicture="${newImageUrl}", biography="${newBiography}" WHERE userId=${req.userId}`, [],
         (err) => helper.errorCatch(err));

  db.close((err) => helper.errorCatch(err));
  res.sendStatus(200);
}

async function getLogout(req, res) {
  let db = helper.openDB();
  await db.run(`UPDATE "users" SET authToken=NULL WHERE userId=${req.userId}`, [],
         (err) => helper.errorCatch(err));

  db.close((err) => helper.errorCatch(err));

  res.redirect("/");
}

async function getDelete(req, res) {
  let db = helper.openDB();
  await db.run(`DELETE FROM "users" WHERE userId=${req.userId}`, [],
         (err) => helper.errorCatch(err));
  db.close((err) => helper.errorCatch(err));

  res.redirect("/");
}


async function postChangePassword(req, res) {
  var { currentPass, newPass } = req.body;
  var hash = helper.hashPassword(currentPass);
  var newHash = helper.hashPassword(newPass);

  var db = await helper.openDB();
  var query = `SELECT passwordHash FROM users WHERE userId=${req.userId}`;
  var result = await helper.queryDB(db, query, []);
  if (result.rows[0].passwordHash == hash){
    await db.run(`UPDATE "users" SET passwordHash="${newHash}" WHERE userId=${req.userId}`, [],
             (err) => helper.errorCatch(err));
    res.send({response: "Succesfully changed password.", class:"success"})
  } else {
    res.send({response: "Incorrect current password", class:"error"})
  }
  db.close((err) => helper.errorCatch(err));
}



module.exports = {
  getLogin,
  postRegister,
  getRegister,
  getProfile,
  postProfile,
  getDelete,
  getLogout,
  postLogin,
  postChangePassword
};
