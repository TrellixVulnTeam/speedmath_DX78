module.exports = function(socket, sqlite3, jwt) {
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

        accountsDb.get(`SELECT username, display_name, email, profile_picture, bio, friends, incoming_friend_requests, outgoing_friend_requests, achievements, publicly_displayed_achievements, public_account FROM users WHERE user_id = ?`, [user.id], function(err, row) {
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

  socket.on("getPublicUserInfo", username => {
    let accountsDb = new sqlite3.Database(__dirname + "/database/accounts.db", (err) => {
      if (err) {
        console.log(err);
      }
    });

    accountsDb.all(`SELECT username, display_name, profile_picture, bio, publicly_displayed_achievements, public_account FROM users WHERE username = ?`, [username], function(err, rows) {
      if (err) {
        console.log(err);
      } else {
        if (rows.length === 0) { //if there are no entries (rows) in the database that have the username
          socket.emit("profileUsernameNotFound");
        } else {
          if (rows[0].public_account == "true") {
            let info = {
              username: rows[0].username,
              displayName: rows[0].display_name,
              profilePicture: rows[0].profile_picture,
              bio: rows[0].bio
            }

            socket.emit("userProfilePageInfo", info);
          } else {
            //what's different if it's not a public account?
          }
        }
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

        accountsDb.run(`UPDATE users SET bio = ? WHERE user_id = ?`, [newBio, user.id], function(err) {
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

  socket.on("updatePfp", (token, newPfp) => {
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

        accountsDb.run(`UPDATE users SET profile_picture = ? WHERE user_id = ?`, [newPfp, user.id], function(err) {
          if (err) {
            console.log(err);
          } else {
            accountsDb.close();
            socket.emit("successfullyUpdatedPfp");
          }
        });
      }
    });
  });

  socket.on("updateDisplayName", (token, newDisplayName) => {
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

        accountsDb.run(`UPDATE users SET display_name = ? WHERE user_id = ?`, [newDisplayName, user.id], function(err) {
          if (err) {
            console.log(err);
          } else {
            accountsDb.close();
            socket.emit("successfullyUpdatedDisplayName");
          }
        });
      }
    });
  });

  socket.on("updateEmail", (token, newEmail) => {
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

        accountsDb.run(`UPDATE users SET email = ? WHERE user_id = ?`, [newEmail, user.id], function(err) {
          if (err) {
            console.log(err);
          } else {
            accountsDb.close();
            socket.emit("successfullyUpdatedEmail");
          }
        });
      }
    });
  });

  socket.on("updateAccountVisibility", (token, newAccountVisibility) => {
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

        accountsDb.run(`UPDATE users SET public_account = ? WHERE user_id = ?`, [newAccountVisibility, user.id], function(err) {
          if (err) {
            console.log(err);
          } else {
            accountsDb.close();
            socket.emit("successfullyUpdatedAccountVisibility");
          }
        });
      }
    });
  });
}