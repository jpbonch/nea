var helper = require('../helpers.js');
const fetch = require("node-fetch");
require('dotenv').config()
const sqlite3 = require("sqlite3").verbose();

async function updateBasketball(data){
  let db = await helper.openDB();
  for (game of data.response){

  await db.run(`REPLACE INTO "events" VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  [game.id, "basketball", game.date, game.status.long, game.league.name, game.stage, game.city, game.country.name, game.status.short,
  game.teams.away.name, game.teams.away.name, game.teams.away.logo, game.scores.away.total,
  game.teams.home.name, game.teams.home.name, game.teams.home.logo, game.scores.home.total],
  function(err) {if (err) {console.error(err.message)}
    console.log(`A row has been inserted with rowid ${this.lastID}`);
  });
}
await db.close((err) => helper.errorCatch(err));
}

async function updateFootball(data){
  let db = await helper.openDB();
  for (game of data.response){
    await db.run(`REPLACE INTO "events" VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [game.id, "football", game.fixture.date, game.fixture.status.long, game.league.name, game.fixture.venue.name, game.fixture.venue.city, game.league.country, game.fixture.status.short,
    game.teams.away.name, game.teams.away.name, game.teams.away.logo, game.goals.away,
    game.teams.home.name, game.teams.home.name, game.teams.home.logo, game.goals.home],
    function(err) {if (err) {console.error(err.message)}
      console.log(`A row has been inserted with rowid ${this.lastID}`);
    });
  }
  await db.close((err) => helper.errorCatch(err));
}

async function updateBaseball(data){
  let db = await helper.openDB();
  for (game of data.response){
  await db.run(`REPLACE INTO "events" VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [game.id, "baseball", game.date, game.status.long, game.league.name, game.arena, game.city, game.country.name, game.status.short,
    game.teams.away.name, game.teams.away.name, game.teams.away.logo, game.scores.away.total,
    game.teams.home.name, game.teams.home.name, game.teams.home.logo, game.scores.home.total],
    function(err) {if (err) {console.error(err.message)}
      console.log(`A row has been inserted with rowid ${this.lastID}`);
    });
  }
  await db.close((err) => helper.errorCatch(err));
}

async function updateRugby(data){
  let db = await helper.openDB();
  for (game of data.response){
  await db.run(`REPLACE INTO "events" VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [game.id, "rugby", game.date, game.status.long, game.league.name, game.arena, game.city, game.country.name, game.status.short,
    game.teams.away.name, game.teams.away.name, game.teams.away.logo, game.scores.away,
    game.teams.home.name, game.teams.home.name, game.teams.home.logo, game.scores.home],
    function(err) {if (err) {console.error(err.message)}
      console.log(`A row has been inserted with rowid ${this.lastID}`);
    });
  }
  await db.close((err) => helper.errorCatch(err));
}

async function updateHockey(data){
  let db = await helper.openDB();
  for (game of data.response){
  await db.run(`REPLACE INTO "events" VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [game.id, "hockey", game.date, game.status.long, game.league.name, game.arena, game.city, game.country.name, game.status.short,
    game.teams.away.name, game.teams.away.name, game.teams.away.logo, game.scores.away,
    game.teams.home.name, game.teams.home.name, game.teams.home.logo, game.scores.home],
    function(err) {if (err) {console.error(err.message)}
      console.log(`A row has been inserted with rowid ${this.lastID}`);
    });
  }
  await db.close((err) => helper.errorCatch(err));
}

async function updateFormula1(data){
  let db = await helper.openDB();
  for (game of data.response){
  await db.run(`REPLACE INTO "events" VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [game.id, "formula1", game.date, game.status, game.competition.name, game.circuit.name, game.competition.location.city, game.competition.location.country, game.laps.current,
    "", "", "", "",
    "", "", "", ""],
    function(err) {if (err) {console.error(err.message)}
      console.log(`A row has been inserted with rowid ${this.lastID}`);
    });
  }
  await db.close((err) => helper.errorCatch(err));
}


async function updateDatabase(data){

    for (sport in data){
      console.log(sport);
      if (sport == "basketball"){
        updateBasketball(data[sport])
      } else if (sport == "football"){
        updateFootball(data[sport])
      } else if (sport == "baseball"){
        updateBaseball(data[sport])
      } else if (sport == "rugby"){
      updateRugby(data[sport])
    } else if (sport == "hockey"){
      updateHockey(data[sport])
    } else if (sport == "formula1")
      updateFormula1(data[sport])
    }
}


async function fetchEvents() {
    var today = new Date()
    var todayString = today.toISOString().split('T')[0]

    var endpoints = [
      // {url: "https://api-football-v1.p.rapidapi.com/v3/fixtures?season=2022&date=" + todayString,
      //  sport: "football",
      //  headers: {"x-rapidapi-host": "api-football-v1.p.rapidapi.com", "x-rapidapi-key": process.env.API_KEY}},
      //  {url: "https://api-basketball.p.rapidapi.com/games?date=" + todayString,
      //   sport: "basketball",
      //  headers: {"x-rapidapi-host": "api-basketball.p.rapidapi.com", "x-rapidapi-key": process.env.API_KEY}},
        // {url: "https://api-baseball.p.rapidapi.com/games?date=" + todayString,
        // sport: "baseball",
        // headers: {"x-rapidapi-host": "api-baseball.p.rapidapi.com", "x-rapidapi-key": process.env.API_KEY}},
        // {url: "https://api-rugby.p.rapidapi.com/games?date=" + todayString,
        // sport: "rugby",
        // headers: {"x-rapidapi-host": "api-rugby.p.rapidapi.com", "x-rapidapi-key": process.env.API_KEY}}
        // {url: "https://api-hockey.p.rapidapi.com/games/?date=" + todayString,
        // sport: "hockey",
        // headers: {"x-rapidapi-host": "api-hockey.p.rapidapi.com", "x-rapidapi-key": process.env.API_KEY}}
        {url: "https://api-formula-1.p.rapidapi.com/races?date=" + todayString,
        sport: "formula1",
        headers: {"x-rapidapi-host": "api-formula-1.p.rapidapi.com", "x-rapidapi-key": process.env.API_KEY}}
    ];
    
    var events = {}

    for (endpoint of endpoints){
      var response = await fetch(endpoint.url, {headers: endpoint.headers});
      var jsonResult = await response.json();
      events[endpoint.sport] = jsonResult;
  }

  return events;
}

async function startPolling() {
  var minutes = 1000;
  var interval = minutes * 60 * 1000;
  setInterval(async () => {
    var events = await fetchEvents();
    console.log(events)
    await updateDatabase(events);
  }, interval);
}


module.exports = startPolling;
