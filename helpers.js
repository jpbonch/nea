const sqlite3 = require("sqlite3").verbose();
const crypto = require('crypto');


function formatDate(inputDateString){
  var inputDate = new Date(inputDateString);
  var todaysDate = new Date();
  if(inputDate.toDateString() == todaysDate.toDateString()) {
    var time = inputDate.getHours() + ':' + inputDate.getMinutes();
  } else {
    var time = message.time.split(' ')[0];
  }
  return time;
}


function openDB(){
  let db = new sqlite3.Database(
    `./database.db`, // can be nba,
    sqlite3.OPEN_READWRITE,
    (err) => {
      if (err) {console.error(err.message);}
    }
  );
  return db;
}

var errorCatch = function (err){
  if (err) {
    console.error(err.message);
  }
}

function hashPassword(password) {
    var sha256 = crypto.createHash('sha256');
    var hash = sha256.update(password).digest('base64');
    return hash;
}

function genAuthToken(){
    return crypto.randomBytes(30).toString('hex');
}

function queryDB(db, sql, params){
  return new Promise(function (resolve, reject){
    db.all(sql, params, function (error, rows){
      if(error){
        reject(error);
      } else {
        resolve({rows:rows})
      }
    })
  })
}

module.exports = {
  formatDate: formatDate,
  openDB: openDB,
  errorCatch: errorCatch,
  hashPassword: hashPassword,
  genAuthToken: genAuthToken,
  queryDB: queryDB
}
