const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

const sqlite3 = require("sqlite3").verbose();
const bcrypt = require('bcrypt');

app.use(express.static("public"));

app.get('/', (req, res) => {
  res.sendFile(__dirname + "/pages/honk.html");
});

app.get('/arithmetic', (req, res) => {
  res.sendFile(__dirname + "/pages/speedmath.html")
});

app.get('/topics', (req, res) => {
  res.sendFile(__dirname + "/pages/topics/topicsIndex.html")
});

app.get('/topics/:topic', (req, res) => {
  res.sendFile(__dirname + "/pages/topics/" + req.params.topic + ".html");
});

app.get('/contributors', (req, res) => {
  res.sendFile(__dirname + "/pages/contributors.html");
});

app.get('/account', (req, res) => {
  res.sendFile(__dirname + "/pages/account.html");
});

/*
console.log("Initializing database...");
let accountsDb = new sqlite3.Database(__firname + "/database/accounts.db", (err) => {
  if (err) {
    console.log(err);
  }

  console.log("connected to the accounts database");
});


// create users table if it doesn't already exist
accountsDb.serialize(() => {
  db.run(`CREATE TABLE [IF NOT EXISTS] users(
    user_id INTEGER PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    email TEXT UNIQUE
  )`)
});

accountsDb.close((err) => {
  if (err) {
    console.log(err);
  } else {
    console.log("Successfully initialized database!");
  }
});

*/

io.on('connection', (socket) => {
  socket.on("login", (username, password) => {
    console.log(`Someone is trying to login.\nUsername: ${username}\nPassword: ${password}\n`);
  });

  socket.on("signUp", (username, password, displayName, email) => {
    console.log(`Someone is trying to sign up!\nUsername: ${username}\nPassword: ${password}\nDisplay Name: ${displayName}\nEmail: ${email}\n`);

    
  });

  socket.on("logDB", () => {
    console.log("uh");
  });
});

server.listen(process.env['PORT'], () => {
  console.log("I AM WORKING!");
});