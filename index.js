const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

const sqlite3 = require("sqlite3").verbose();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

//const webhook = require("webhook-discord");
//const Hook = new webhook.Webhook(process.env['WEBHOOK_LINK']);

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

console.log("Initializing database...";

let accountsDb = new sqlite3.Database(__dirname + "/database/accounts.db", (err) => {
  if (err) {
    console.log(err);
  } else {
    console.log("connected to the accounts database");
  }
});


// create users table if it doesn't already exist
accountsDb.serialize(() => {
  accountsDb.run(`
    CREATE TABLE IF NOT EXISTS users(
      user_id INTEGER PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      password_hashed TEXT NOT NULL,
      display_name TEXT NOT NULL,
      email TEXT UNIQUE,
      profile_picture TEXT,
      bio TEXT,
      friends TEXT,
      incoming_friend_requests TEXT,
      outgoing_friend_requests TEXT,
      achievements TEXT,
      public_account TEXT
    )`
  );
  
  accountsDb.run(`
    CREATE TABLE IF NOT EXISTS topicsPracticeStats(
      user_id INTEGER PRIMARY KEY,
      addition_level INTEGER,
      subtraction_level INTEGER,
      multiplication_level INTEGER,
      division_level INTEGER
    )`
  );
});

accountsDb.close((err) => {
  if (err) {
    console.log(err);
  } else {
    console.log("Successfully initialized database!");
  }
});

io.on('connection', (socket) => {
  require('./accountHandler.js')(socket, sqlite3, bcrypt, jwt);

  socket.on("getOwnProfileInfo", token => {
    jwt.verify(token, process.env['JWT_PRIVATE_KEY'], function(err, user) {
      if (err) {
        console.log(err);
        socket.emit("error", "This should not happen.", "Sorry. Please describe what you did to get this error and submit a suggestion on the home page. We'll look into it as soon as possible.");
      } else {
        let accountsDb = new sqlite3.Database(__dirname + "/database/accounts.db", (err) => {
          if (err) {
            console.log(err);
          }
        }); 

        accountsDb.get(`SELECT username, display_name, email, profile_picture, bio, friends, incoming_friend_requests, outgoing_friend_requests, achievements, public_account FROM users WHERE username = ?`, [user.name], function(err, row) {
          if (err) {
            console.log(err);
          } else {
            let friendsInfo = {
              friends: [],
              incoming_friend_requests: [],
              outgoing_friend_requests: []
            }
            
            socket.emit("ownProfileInfo", row, friendsInfo);
          }
        });

        accountsDb.close();
      }
    });
  });

  socket.on("updateBio", (token, newBio) => {
    jwt.verify(token, process.env['JWT_PRIVATE_KEY'], function(err, user) {
      if (err) {
        console.log(err);
        socket.emit("error", "This should not happen.", "Sorry. Please describe what you did to get this error and submit a suggestion on the home page. We'll look into it as soon as possible.");
      } else {
        let accountsDb = new sqlite3.Database(__dirname + "/database/accounts.db", (err) => {
          if (err) {
            console.log(err);
          }
        }); 

        accountsDb.run(`UPDATE users SET bio = ? WHERE username = ?`, [newBio, user.name], function(err) {
          if (err) {
            console.log(err);
          } else {
            accountsDb.close();
            socket.emit("successfullyUpdatedBio");
          }
        });
      }
    });
  });
  
  socket.on("suggestion", async (contact, suggestion) => {
    
    if (suggestion.length > 900) {
      var part = 1;

      while (suggestion.length > 900) {
        await hookEmbedSend(
          "SpeedMath Suggestion",
          `**Contact:**\n ${contact}\n\n\n**Suggestion:**\n ${suggestion.substring(0, 900)} **(Part ${part})**`,
          "New Suggestion",
          "#e33e32"
        );
        suggestion = suggestion.substring(900, suggestion.length);
        part++;
      }
    
      hookEmbedSend(
        "SpeedMath Suggestion",
        `**Contact:**\n ${contact}\n\n\n**Suggestion:**\n ${suggestion} **(Part ${part})**`,
        "New Suggestion",
        "#e33e32"
      );
    } else {
      hookEmbedSend(
        "SpeedMath Suggestion",
        `**Contact:**\n ${contact}\n\n\n**Suggestion:**\n ${suggestion}`,
        "New Suggestion",
        "#e33e32"
      );
    }
  });
});

server.listen(process.env['PORT'], () => {
  console.log("I AM WORKING!");
});

function hookEmbedSend(username, content, title, color) {
  return new Promise(resolve => {
    Hook.custom(username, content, title, color);

    setTimeout(() => {
      resolve();
    }, 2000);
  });
}