const sqlite3 = require("sqlite3").verbose();
const crypto = require('crypto');


function formatDate(inputDateString){
  var inputDate = new Date(inputDateString);
  var todaysDate = new Date();
  if(inputDate.toDateString() == todaysDate.toDateString()) {
     // Shorthand to add trailing zeroes
    var time = ("0" + inputDate.getHours()).slice(-2) + ':' + ("0" + inputDate.getMinutes()).slice(-2);
  } else {
    var time = inputDateString.split('T')[0];
  }
  return time;
}


function openDB(){
  let db = new sqlite3.Database(
    `./database.db`,
    sqlite3.OPEN_READWRITE, // Pick db mode: can be read, write, read/write
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
    // 30 bytes used, so 60 chars in total (One hex char = 4 bits)
    return crypto.randomBytes(30).toString('hex');
}

function queryDB(db, sql, params){
  return new Promise(function (resolve, reject){
    db.all(sql, params, function (error, rows){
      if(error){
        reject(error);
      } else {
        // Resolution of Promise
        resolve({rows:rows})
      }
    })
  })
}

function sortSports(events){
  var sortedEvents = {};
  for(event of events) {
    if (sortedEvents[event.sport] == undefined){
      sortedEvents[event.sport] = [];
    } 
    sortedEvents[event.sport].push(event)
  }
  return sortedEvents;
}

// Exporting functions
module.exports = {
  formatDate: formatDate,
  openDB: openDB,
  errorCatch: errorCatch,
  hashPassword: hashPassword,
  genAuthToken: genAuthToken,
  queryDB: queryDB,
  sortSports: sortSports
}
