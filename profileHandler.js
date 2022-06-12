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
            accountsDb.serialize(() => {
              //get username, display name, and pfp of the user ids in row.friends, which is stored as a JSON.stringified array string in the database
              JSON.parse(row.friends).forEach(friendId => {
                accountsDb.get(`SELECT username, display_name, profile_picture FROM users WHERE user_id = ?`, [friendId], function(err, friendInfoRow) {
                  if (err) {
                    console.log(err);
                  } else {
                    let friend = {
                      user_id: friendId,
                      display_name: friendInfoRow.display_name,
                      username: friendInfoRow.username,
                      profile_picture: friendInfoRow.profile_picture
                    }
    
                    socket.emit("newFriend", friend); //to add friend to container on client side
                  }
                });
              });
              
              //get username, display name, and pfp of the user ids in row.incoming_friend_requests, which is stored as a JSON.stringified array string in the database
              JSON.parse(row.incoming_friend_requests).forEach(incomingFriendRequestId => {
                accountsDb.get(`SELECT username, display_name, profile_picture FROM users WHERE user_id = ?`, [incomingFriendRequestId], function(err, friendInfoRow) {
                  if (err) {
                    console.log(err);
                  } else {
                    let incomingRequest = {
                      user_id: incomingFriendRequestId,
                      display_name: friendInfoRow.display_name,
                      username: friendInfoRow.username,
                      profile_picture: friendInfoRow.profile_picture
                    }
    
                    socket.emit("newIncomingFriendRequest", incomingRequest); //to add incoming friend request div to container on client side
                  }
                });
              });

              //get username, display name, and pfp of the user ids in row.outgoing_friend_requests, which is stored as a JSON.stringified array string in the database
              JSON.parse(row.outgoing_friend_requests).forEach(outgoingFriendRequestId => {
                accountsDb.get(`SELECT username, display_name, profile_picture FROM users WHERE user_id = ?`, [outgoingFriendRequestId], function(err, friendInfoRow) {
                  if (err) {
                    console.log(err);
                  } else {
                    let outgoingRequest = {
                      user_id: outgoingFriendRequestId,
                      display_name: friendInfoRow.display_name,
                      username: friendInfoRow.username,
                      profile_picture: friendInfoRow.profile_picture
                    }
    
                    socket.emit("newOutgoingFriendRequest", outgoingRequest); //to add outgoing friend request div to container on client side
                  }
                });
              });

              accountsDb.close();
            });
            
            socket.emit("ownProfileInfo", row);
          }
        });
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
              bio: rows[0].bio,
              publicly_displayed_achievements: rows[0].publicly_displayed_achievements
            }

            socket.emit("userProfilePageInfo", info);
          } else {
            //what's different if it's not a public account?
          }
        }
      }
    });
  });

  socket.on("getUserInfoWhileLoggedIn", (token, username) => {
    
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

  socket.on("updatePubliclyDisplayedAchievements", (token, addOrRemove, achievement) => {
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

        accountsDb.get(`SELECT achievements FROM users WHERE user_id = ?`, [user.id], function(err, row) {
          if (err) {
            console.log(err); 
          } else {
            let achievements = row.achievements.split(","); //get user's achievements in the form of an array
            //check whether the user's achievements include this achievement
            if (achievements.includes(achievement)) { //if it does, continue, else, tell the user that they're hacking, because there's no other way this error can occur
              if (addOrRemove === "add") { //to add to publiclyDisplayedAchievements...
                accountsDb.get(`SELECT publicly_displayed_achievements FROM users WHERE user_id = ?`, [user.id], function(err, row) {
                  if (err) {
                    console.log(err);
                  } else {
                    let publicly_displayed_achievements = row.publicly_displayed_achievements.split(","); //get array of currently publicly displayed achievements
    
                    if (publicly_displayed_achievements.length >= 6) { // if there are >= 5 publicly displayed, prompt user to remove one (this number was made 6 because there's a bug that makes the first value in the array an empty string but i'm too lazy to fix it, so this is a workaround)
                      socket.emit("error", "You already have 5 publicly displayed achievements", "Please remove one before pinning a new one. You can have a maximum of 5 publicly displayed badges.")
                    } else if (publicly_displayed_achievements.includes(achievement)) {
                      socket.emit("error", "You already pinned that achievement!", "If you want to unpin it, click on the badge in the \"Publicly Displayed Achievements\" box.")
                    } else {
                      publicly_displayed_achievements.push(achievement); //add achievement to the array
                      //set database entry for publicly displayed achievements to array joined by commas
                      accountsDb.run(`UPDATE users SET publicly_displayed_achievements = ? WHERE user_id = ?`, [publicly_displayed_achievements.join(","), user.id], function(err) {
                        if (err) {
                          console.log(err);
                        } else {
                          socket.emit("successfullyUpdatedPubliclyDisplayedAchievements");
                        }
                      });
                    }
                  }
                });
              } else if (addOrRemove === "remove") { //to remove from publiclyDisplayedAchievements...
                accountsDb.get(`SELECT publicly_displayed_achievements FROM users WHERE user_id = ?`, [user.id], function(err, row) {
                  if (err) {
                    console.log(err); 
                  } else {
                    let publicly_displayed_achievements = row.publicly_displayed_achievements.split(","); //get array of currently publicly displayed achievements
    
                    publicly_displayed_achievements = removeItemFromArray(publicly_displayed_achievements, achievement); //remove the achievement from the array using the helper function
    
                    //set database entry for publicly displayed achievements to array joined by commas
                    accountsDb.run(`UPDATE users SET publicly_displayed_achievements = ? WHERE user_id = ?`, [publicly_displayed_achievements.join(","), user.id], function(err) {
                      if (err) {
                        console.log(err);
                      } else {
                        socket.emit("successfullyUpdatedPubliclyDisplayedAchievements");
                      }
                    });
                  }
                });
              }
            } else {
              socket.emit("error", "You don't have the achievement that you are trying to make public/private", "This shouldn't happen unless you are injecting a script. Stop trying to hack.");
            }
          }
        });

        accountsDb.close();
      }
    });

    //helper function to remove item from array and return new array after item has been removed
    function removeItemFromArray(array, value) {
      let index = array.indexOf(value);
      if (index !== -1) {
        array.splice(index, 1);
      }

      return array;
    }
  });
}