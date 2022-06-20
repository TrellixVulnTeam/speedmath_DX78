const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

const sqlite3 = require("sqlite3").verbose();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

app.use(express.static("public"));

app.get('/', (req, res) => {
  res.sendFile(__dirname + "/pages/honk.html");
});

app.get('/games', (req, res) => {
  res.sendFile(__dirname + "/pages/games/gamesIndex.html");
});

app.get('/games/:game', (req, res) => {
  res.sendFile(__dirname + "/pages/games/" + req.params.game + ".html");
});

app.get('/topics', (req, res) => {
  res.sendFile(__dirname + "/pages/topics/topicsIndex.html");
});

app.get('/topics/:topic', (req, res) => {
  res.sendFile(__dirname + "/pages/topics/" + req.params.topic + ".html");
});

app.get('/contributors', (req, res) => {
  res.sendFile(__dirname +"/pages/contributors.html");
});

app.get('/account', (req, res) => {
  res.sendFile(__dirname + "/pages/account.html");
});

app.get('/user/:username', (req, res) => {
  res.sendFile(__dirname + "/pages/user.html");
});

app.get('/nsfw', (req, res) => {
  res.redirect("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
});

app.get('/tos', (req, res) => {
  res.sendFile(__dirname + "/pages/tos.html");
});


//THIS HAS TO BE KEPT AT THE END OF THE ROUTING SECTION OF THE CODE
app.get('*', (req, res) => { //if user tries to go to a random subpage that doesn't exist,
  res.redirect('/'); //redirect them to the home page
});

console.log("Initializing database...");

let accountsDb = new sqlite3.Database(__dirname + "/database/accounts.db", (err) => {
  if (err) {
    console.log(err);
  } else {
    console.log("connected to the accounts database");
  }
});


// create tables for user info and practice stats if they don't already exist
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
      publicly_displayed_achievements TEXT,
      achievements TEXT,
      public_account TEXT,
      topic_practice_stats_privacy TEXT,
      qotd_points INTEGER
    )`
  );
  
  accountsDb.run(`
    CREATE TABLE IF NOT EXISTS topicsPracticeStats(
      user_id INTEGER PRIMARY KEY,
      addition_level INTEGER,
      subtraction_level INTEGER,
      multiplication_level INTEGER,
      division_level INTEGER,
      squaring_level INTEGER
    )`
  );
  
  //accountsDb.all(`SELECT user_id, username, display_name, email, bio, friends, incoming_friend_requests, outgoing_friend_requests, publicly_displayed_achievements, achievements, public_account, topic_practice_stats_privacy FROM users`, [], (err, rows) => {
  accountsDb.all(`SELECT * FROM topicsPracticeStats`, [], (err, rows) => {
    if (err) {
      console.log(err);
    } else {
      rows.forEach(row => {
        console.log(row);
      });
    }
  });
});

accountsDb.close((err) => {
  if (err) {
    console.log(err);
  } else {
    console.log("Successfully initialized database!");
  }
});

io.on('connection', (socket) => {
  require('./accountHandler.js')(socket, sqlite3, bcrypt, jwt); //logging in, signing up
  require('./profileHandler.js')(socket, sqlite3, jwt); //public profile pages, getting own profile info, updating profile info, adding friends, getting incoming/outgoing friend requests
  require('./suggestionHandler.js')(socket); //suggestions 

  socket.on("getTopicPracticeStats", (token, topic) => {
    jwt.verify(token, process.env['JWT_PRIVATE_KEY'], function (err, user) {
      if (err) {
        console.log(err);
        socket.emit("error", "This should not happen.", "Sorry. Please describe what you did to get this error and submit a suggestion on the home page. We'll look into it as soon as possible.");
      } else {
        let topicColumn = getTopicColumn(topic);

        if (topicColumn != null) {
          let accountsDb = new sqlite3.Database(__dirname + "/database/accounts.db", (err) => {
            if (err) {
              console.log(err);
            }
          });
          
          accountsDb.get(`SELECT ${topicColumn} FROM topicsPracticeStats WHERE user_id = ?`, [user.id], function(err, row) {
            if (err) {
              console.log(err);
            } else {
              socket.emit("topicPracticeLevel", row[topicColumn]);
            }
          });
  
          accountsDb.close();
        } else {
          socket.emit("error", "Stop trying to hack.", "You shouldn't be getting this error unless you're trying to hack using a SQL injection attack.");
        }
      }
    });
  });

  socket.on("updateTopicPracticeStats", (token, topic, level) => {
    jwt.verify(token, process.env['JWT_PRIVATE_KEY'], function(err, user) {
      if (err) {
        console.log(err);
        socket.emit("error", "This should not happen.", "Sorry. Please describe what you did to get this error and submit a suggestion on the home page. We'll look into it as soon as possible.");
      } else {
        let topicColumn = getTopicColumn(topic);

        if (topicColumn != null) {
          let accountsDb = new sqlite3.Database(__dirname + "/database/accounts.db", (err) => {
            if (err) {
              console.log(err);
            }
          });
          
          accountsDb.run(`UPDATE topicsPracticeStats SET ${topicColumn} = ? WHERE user_id = ?`, [level, user.id], function(err) {
            if (err) {
              console.log(err);
            }
          });
  
          if (level === 11) { //if they reached level 11
            //first get their achievements
            accountsDb.get(`SELECT achievements FROM users WHERE user_id = ?`, [user.id], function(err, data) {
              if (err) {
                console.log(err);
              } 
              else {
                let achievements = JSON.parse(data.achievements); //get an array of their achievements
                achievements.push("mastered-" + topic); //add "mastered " + topic to this array
                //JSON.stringify() the achievements array and save it in the database
                accountsDb.run('UPDATE users SET achievements = ? WHERE user_id = ?', [JSON.stringify(achievements), user.id], function(err) {
                  if (err) {
                    console.log(err);
                  }
                });
              }
            });
          }
  
          accountsDb.close(); 
        } else {
          socket.emit("error", "Stop trying to hack.", "You shouldn't be getting this error unless you're trying to hack using a SQL injection attack.");
        }
      }
    });
  });
});

server.listen(process.env['PORT'], () => {
  console.log("I AM WORKING!");
});

/* helper functions */

//get column in the topicPracticeStats table that corresponds to a practice topic's level
function getTopicColumn(topic) {
  //format is topic: column name
  let dictionary = {
    "addition": "addition_level",
    "subtraction": "subtraction_level",
    "multiplication": "multiplication_level",
    "division": "division_level",
    "squaring": "squaring_level"
  }

  if (topic in dictionary) {
    return dictionary[topic];
  } else {
    return null;
  }
}