const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
var path = require ('path');
const sqlite3 = require("sqlite3").verbose();
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
var helper = require('./helpers.js');
require('dotenv').config()
var userRouter = require('./routes/user.routes.js');
var mainRouter = require('./routes/main.routes.js');
var startPolling = require('./models/poll.js');
var Filter = require('bad-words');



const app = express();
app.use(express.json())
app.use(express.static("public"));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.set('views', path.join(__dirname, "views"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(async (req, res, next) => {
    // Get auth token from the cookies
    const authToken = req.cookies['AuthToken'];
    // Inject the user to the request
    // Find user where authtoken = authToken
    var db = helper.openDB();
    var query = `SELECT userId FROM users WHERE authToken="${authToken}"`;
    var result = await helper.queryDB(db, query, []);
    if (result.rows.length > 0){
      req.userId = result.rows[0].userId;
    }
    next();
});

app.use(userRouter);
app.use(mainRouter);

startPolling();

const server = http.createServer(app);
server.listen(80, () => {console.log('listening on port 80')});
const io = new Server(server);
io.on('connection', (socket) => {
  socket.on('chat message', (msg) => {
    filter = new Filter();
    msg.content = filter.clean(msg.content);
    io.emit('chat message', msg);
  });
});

// api more sports, future events, past events
// limits on displayName length, pfp size, obscene filters
// green border around username input not obscene
// frontend
// forgot password on login
// remove old events
// event details on chat page
// pre match votes? 
// voice messages
// composite keys
// chat room not unique, needs :sport

//pagination
// gif
//update events tomorrow every 6 hours
//update events today every few minutes
// muting
// improve code

//done