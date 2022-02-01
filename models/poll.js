var helper = require('../helpers.js');
const fetch = require("node-fetch");
require('dotenv').config()



class Event {
  constructor(eventId, sport, startTimeUTC, statusGame, league, arena, city, country, 
    currentPeriod, vTeamShortName, vTeamFullName, vTeamLogo, vTeamScore, hTeamShortName, 
    hTeamFullName, hTeamLogo, hTeamScore){
    this.eventId = eventId;
    this.sport = sport;
    this.startTimeUTC = startTimeUTC;
    this.statusGame = statusGame;
    this.league = league;
    this.arena = arena;
    this.city = city;
    this.country = country;
    this.currentPeriod = currentPeriod;
    this.vTeamShortName = vTeamShortName;
    this.vTeamFullName = vTeamFullName;
    this.vTeamLogo = vTeamLogo;
    this.vTeamScore = vTeamScore;
    this.hTeamShortName = hTeamShortName;
    this.hTeamFullName = hTeamFullName;
    this.hTeamLogo = hTeamLogo;
    this.hTeamScore = hTeamScore;
  }

  getList(){
    return [this.eventId, this.sport, this.startTimeUTC, this.statusGame, this.league, this.arena,
       this.city, this.country, this.currentPeriod, this.vTeamShortName, this.vTeamFullName, 
       this.vTeamLogo, this.vTeamScore, this.hTeamShortName, this.hTeamFullName, this.hTeamLogo, this.hTeamScore];
  } 

  getPrimaryKey(){
    return this.eventId + this.sport;
  }
}



async function updateDatabase(data){
    var events = [];
    for (sport in data){
        for (game of data[sport].response) {
          console.log(sport)
          console.log(game)
          if (sport == "formula1"){
            events.push(new Event(game.id, "formula1", game.date, game.status, game.competition.name, 
            game.circuit.name, game.competition.location.city, game.competition.location.country, game.laps.current,
            "", "", "", "",
            "", "", "", ""));
          } else {
          if (sport == "basketball"){
            game.arena = game.stage;
            game.scores.away = game.scores.away.total;
            game.scores.home = game.scores.home.total;
          } else if (sport == "baseball"){
            game.scores.away = game.scores.away.total;
            game.scores.home = game.scores.home.total;
          } else if (sport == "football"){
            game.date = game.fixture.date;
            game.status = {};
            game.status.long =  game.fixture.status.long;
            game.arena = game.fixture.venue.name;
            game.city = game.fixture.venue.city;
            game.country = {};
            game.country.name = game.league.country;
            game.status.short = game.fixture.status.short;
            game.scores = {};
            game.scores.away = game.goals.away;
            game.scores.home = game.goals.home;
          }

            events.push(new Event(game.id, "rugby", game.date, game.status.long, game.league.name, game.arena, game.city, 
            game.country.name, game.status.short, game.teams.away.name, game.teams.away.name, game.teams.away.logo, game.scores.away,
            game.teams.home.name, game.teams.home.name, game.teams.home.logo, game.scores.home));
          }
        }
    }

    let db = await helper.openDB();
    for (sportEvent of events){
    await db.run(`REPLACE INTO "events" VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, sportEvent.getList(), 
    function(err) {if (err) {console.error(err.message)}
                  console.log(`A row has been inserted with rowid ${this.lastID}`);
  });
  }
  await db.close((err) => helper.errorCatch(err));
}




async function fetchEvents() {
    var today = new Date()
    var todayString = today.toISOString().split('T')[0]

    var endpoints = [
      {url: "https://api-football-v1.p.rapidapi.com/v3/fixtures?season=2022&date=" + todayString,
       sport: "football",
       headers: {"x-rapidapi-host": "api-football-v1.p.rapidapi.com", "x-rapidapi-key": process.env.API_KEY}},
       {url: "https://api-basketball.p.rapidapi.com/games?date=" + todayString,
        sport: "basketball",
       headers: {"x-rapidapi-host": "api-basketball.p.rapidapi.com", "x-rapidapi-key": process.env.API_KEY}},
        {url: "https://api-baseball.p.rapidapi.com/games?date=" + todayString,
        sport: "baseball",
        headers: {"x-rapidapi-host": "api-baseball.p.rapidapi.com", "x-rapidapi-key": process.env.API_KEY}},
        {url: "https://api-rugby.p.rapidapi.com/games?date=" + todayString,
        sport: "rugby",
        headers: {"x-rapidapi-host": "api-rugby.p.rapidapi.com", "x-rapidapi-key": process.env.API_KEY}},
        {url: "https://api-hockey.p.rapidapi.com/games/?date=" + todayString,
        sport: "hockey",
        headers: {"x-rapidapi-host": "api-hockey.p.rapidapi.com", "x-rapidapi-key": process.env.API_KEY}},
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
  var minutes = 10000;
  var interval = minutes * 60 * 1000;
  setInterval(async () => {
    var events = await fetchEvents();
    await updateDatabase(events);
  }, interval);
}


module.exports = startPolling;
