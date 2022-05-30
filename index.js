const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

const sqlite3 = require("sqlite3").verbose();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const webhook = require("webhook-discord");
const Hook = new webhook.Webhook(process.env['WEBHOOK_LINK']);

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

console.log("Initializing database...");

let accountsDb = new sqlite3.Database(__dirname + "/database/accounts.db", (err) => {
  if (err) {
    console.log(err);
  } else {
    console.log("connected to the accounts database");
  }
});


// create users table if it doesn't already exist
accountsDb.serialize(() => {
  accountsDb.run(`CREATE TABLE IF NOT EXISTS users(
    user_id INTEGER PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password_hashed TEXT NOT NULL,
    display_name TEXT NOT NULL,
    email TEXT UNIQUE
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
  socket.on("login", async (username, password, rememberMe) => {
    //open the database
    let accountsDb = new sqlite3.Database(__dirname + "/database/accounts.db", (err) => {
      if (err) {
        console.log(err);
      }
    }); 

    //get the value in the password_hashed column from the row where the username is the inputted username (if it exists)
    accountsDb.all(`SELECT password_hashed FROM users WHERE username = '${username}'`, [], (err, rows) => {
      if (err) {
        console.log(err);
      } else {
        if (rows.length === 0) {
          socket.emit("error", "nobody with that username exists", "ling will write some more stuff here");
        } else {
          bcrypt.compare(password, rows[0].password_hashed, function(err, result) {
            if (err) {
              console.log(err);
            } else {
              console.log(result);
              if (result == true) {
                let token = "";
                
                socket.emit("successfulLogin", token);
              } else {
                socket.emit("error", "wrong password bitch.", "fix it rn");
              }
            }
          });
        }
      }
    });
  });

  socket.on("signUp", (username, password, displayName, email) => {
    //open the database
    let accountsDb = new sqlite3.Database(__dirname + "/database/accounts.db", (err) => {
      if (err) {
        console.log(err);
      }
    }); 
    
    //check if there are any rows with an user whose username is the inputted username
    accountsDb.all(`SELECT * FROM users WHERE username = '${username}'`, [], (err, rows) => {
      if (err) {
        console.log(err);
      } else {
        if (rows.length === 0) { //if there aren't any rows (no existing users with username of person wanting to register)
          if (email != null) {
            //check if there are any rows with an user whose username is the inputted email (if not null)
            accountsDb.all(`SELECT * FROM users WHERE email = '${email}'`, [], (err, rows) => {
              if (err) {
                console.log(err);
              } else {
                if (email == null || rows.length === 0) { //if there aren't any rows (no existing users with username of person wanting to register)
                  bcrypt.hash(password, 10, function(bcryptError, hashedPassword) { //hash password and insert information into database table
                    if (bcryptError) {
                      console.log(bcryptError)
                    } else {
                      accountsDb.run(`INSERT INTO users(username, password_hashed, display_name, email) VALUES (?, ?, ?, ?)`, [username, hashedPassword, displayName, email], function(err) {
                        if (err) {
                          console.log(err);
                        } else {
                          socket.emit("successfullySignedUp");
                          accountsDb.close((err) => {
                            if (err) {
                              console.log(err);
                            } else {
                              console.log("Signed them up and closed the database!");
                            }
                          });
                        }
                      });
                    }
                  });
                } else {
                  socket.emit("error", "Email already taken!", "Please choose another email address to use or log in with the existing account associated with that username.");
                }
              }
            });
          }
        } else {
          socket.emit("error", "Username already taken!", "Please choose an unique username. You can choose a separate display name, which will be how you will be referred to in-game, which doesn't have to be an unique name.");
        }
      }
    });
  });

  socket.on("logDB", () => {
    let accountsDb = new sqlite3.Database(__dirname + "/database/accounts.db", (err) => {
      if (err) {
        console.log(err);
      } else {
        console.log("Connected to the accounts database because someone pressed logDB button.");
      }
    });
    
    accountsDb.all(`SELECT * FROM users`, [], (err, rows) => {
      if (err) {
        console.log(err);
      } else {
        rows.forEach(row => {
          console.log(row);
        });
      }
    });

    accountsDb.close();
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