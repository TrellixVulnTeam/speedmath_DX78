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

    accountsDb.all(`SELECT user_id, username, display_name, profile_picture, bio, publicly_displayed_achievements, public_account FROM users WHERE username = ?`, [username], function(err, rows) {
      if (err) {
        console.log(err);
      } else {
        if (rows.length === 0) { //if there are no entries (rows) in the database that have the username
          socket.emit("profileUsernameNotFound");
        } else {
          if (rows[0].public_account == "true") {
            let info = {
              user_id: rows[0].user_id,
              username: rows[0].username,
              displayName: rows[0].display_name,
              profilePicture: rows[0].profile_picture,
              bio: rows[0].bio,
              publicly_displayed_achievements: rows[0].publicly_displayed_achievements
            }

            socket.emit("userProfilePageInfo", info);
          } else {
            //what's different if it's not a public account?
            let info = {
              
            }
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
            socket.emit("successfullyUpdatedDisplayName", newDisplayName);
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
            socket.emit("successfullyUpdatedEmail", newEmail);
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
  });

  socket.on("acceptFriendRequest", (token, friendId) => {
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
        
        //get list of friends of user who's accepting the friend request
        accountsDb.get(`SELECT friends FROM users WHERE user_id = ?`, [user.id], function(err, row) {
          let friends = JSON.parse(row.friends); //get array of user's friends
          friends.push(friendId); //add new friend's id to array of user's friends
          //save the new array by JSON.stringify()ing it and putting it in the database
          accountsDb.run(`UPDATE users SET friends = ? WHERE user_id = ?`, [JSON.stringify(friends), user.id], function(err) {
            if (err) {
              console.log(err);
            } else {
              //get list of incoming friend requests of user who's accepting the friend request
              accountsDb.get(`SELECT incoming_friend_requests FROM users WHERE user_id = ?`, [user.id], function(err, row) {
                let incoming_friend_requests = JSON.parse(row.incoming_friend_requests); //get array of user's incoming friend requests
                incoming_friend_requests = removeItemFromArray(incoming_friend_requests, friendId); //remove id of newly-added friend from user's list of incoming friend requests using a helper function
                //save the new array by JSON.stringify()ing it and putting it in the database
                accountsDb.run(`UPDATE users SET incoming_friend_requests = ? WHERE user_id = ?`, [JSON.stringify(incoming_friend_requests), user.id], function(err) {
                  if (err) {
                    console.log(err);
                  } else {
                    //get friend list of outgoing friend requests of user who was sending the friend request and got accepted
                    accountsDb.get(`SELECT outgoing_friend_requests FROM users WHERE user_id = ?`, [friendId], function(err, row) {
                      let outgoing_friend_requests = JSON.parse(row.outgoing_friend_requests); //get array of friend's outgoing friend requests
                      outgoing_friend_requests = removeItemFromArray(outgoing_friend_requests, user.id) //remove user's id from friend's list of outgoing friend requests using helper function
                      //save the new array by JSON.stringify()ing it and putting it in the database
                      accountsDb.run(`UPDATE users SET outgoing_friend_requests = ? WHERE user_id = ?`, [JSON.stringify(outgoing_friend_requests), friendId], function(err) {
                        if (err) {
                          console.log(err);
                        } else {
                          //get friend list of user's newly added friend
                          accountsDb.get(`SELECT friends FROM users WHERE user_id = ?`, [friendId], function(err, row) {
                            let friends = JSON.parse(row.friends); //get array of friend's friends
                            friends.push(user.id); //add user's id to their friend's friend list
                            //save the new array by JSON.stringify()ing it and putting it in the database
                            accountsDb.run(`UPDATE users SET friends = ? WHERE user_id = ?`, [JSON.stringify(friends), friendId], function(err) {
                              if (err) {
                                console.log(err);
                              } else {
                                socket.emit("successfullyAcceptedFriendRequest");
                              }
                            });
                          });
                        }
                      });
                    });
                  }
                });
              });
            }
          })
        });

        accountsDb.close();
      }
    });
  });

  socket.on("declineFriendRequest", (token, friendId) => {
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

        //get incoming friend requests list of user
        accountsDb.get(`SELECT incoming_friend_requests FROM users WHERE user_id = ?`, [user.id], function(err, row) {
          if (err) {
            console.log(err);
          } else {
            let incoming_friend_requests = JSON.parse(row.incoming_friend_requests); //get array of user's incoming friend requests
            incoming_friend_requests = removeItemFromArray(incoming_friend_requests, friendId); //remove id of newly-added friend from user's list of incoming friend requests using a helper function
            //save the new array by JSON.stringify()ing it and putting it in the database
            accountsDb.run(`UPDATE users SET incoming_friend_requests = ? WHERE user_id = ?`, [JSON.stringify(incoming_friend_requests), user.id], function(err) {
              if (err) {
                console.log(err);
              } else {
                // get outgoing friend requests list of friend that got declined </3
                accountsDb.get(`SELECT outgoing_friend_requests FROM users WHERE user_id = ?`, [friendId], function(err, row) {
                  let outgoing_friend_requests = JSON.parse(row.outgoing_friend_requests); //get array of rejected friend's outgoing friend requests
                  console.log(outgoing_friend_requests);
                  outgoing_friend_requests = removeItemFromArray(outgoing_friend_requests, user.id) //remove user's id from rejected friend's list of outgoing friend requests using helper function
                  console.log(outgoing_friend_requests);
                  //save the new array by JSON.stringify()ing it and putting it in the database
                  accountsDb.run(`UPDATE users SET outgoing_friend_requests = ? WHERE user_id = ?`, [JSON.stringify(outgoing_friend_requests), friendId], function(err) {
                    if (err) {
                      console.log(err);
                    } else {
                      socket.emit("successfullyDeclinedFriendRequest");
                    }
                  });
                });
              }
            });
          }
        });

        accountsDb.close();
      }
    });
  });

  socket.on("cancelOutgoingFriendRequest", (token, friendId) => {
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
        
        //get outgoing friend requests list of user
        accountsDb.get(`SELECT outgoing_friend_requests FROM users WHERE user_id = ?`, [user.id], function(err, row) {
          if (err) {
            console.log(err);
          } else {
            let outgoing_friend_requests = JSON.parse(row.outgoing_friend_requests); //get array of outgoing friend requests of user
            outgoing_friend_requests = removeItemFromArray(outgoing_friend_requests, friendId); //remove friend's id from user's outgoing friend requests list using a helper function
            //save the new array by JSON.stringify()ing it and putting it in the database
            accountsDb.run(`UPDATE users SET outgoing_friend_requests = ? WHERE user_id = ?`, [JSON.stringify(outgoing_friend_requests), user.id], function(err) {
              if (err) {
                console.log(err);
              } else {
                //get incoming friend requests list of friend
                accountsDb.get(`SELECT incoming_friend_requests FROM users WHERE user_id = ?`, [friendId], function(err, row) {
                  if (err) {
                    console.log(err);
                  } else {
                    let incoming_friend_requests = JSON.parse(row.incoming_friend_requests); //get array of incoming friend requests of friend
                    incoming_friend_requests = removeItemFromArray(incoming_friend_requests, user.id); //remove user's id from friend's incoming friend requests list using a helper function
                    //save the new array by JSON.stringify()ing it and putting it in the database
                    accountsDb.run(`UPDATE users SET incoming_friend_requests = ? WHERE user_id = ?`, [JSON.stringify(incoming_friend_requests), friendId], function(err) {
                      if (err) {
                        console.log(err); 
                      } else {
                        socket.emit("successfullyCancelledFriendRequest");
                        accountsDb.close();
                      }
                    });
                  }
                });
              }
            });
          }
        });
      }
    });
  });

  socket.on("unfriend", (token, friendId) => {
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

        //get list of user's friends
        accountsDb.get(`SELECT friends FROM users WHERE user_id = ?`, [user.id], function(err, row) {
          if (err) {
            console.log(err);
          } else {
            let friends = JSON.parse(row.friends); //get array of user's friends
            friends = removeItemFromArray(friends, friendId); //remove friend that is to be unfriended's id from array of user's friends' ids using a helper function
            //save the new array by JSON.stringify()ing it and putting it in the database
            accountsDb.run(`UPDATE users SET friends = ? WHERE user_id = ?`, [JSON.stringify(friends), user.id], function(err) {
              if (err) {
                console.log(err);
              } else {
                //get list of unfriended friend's friends
                accountsDb.get(`SELECT friends FROM users WHERE user_id = ?`, [friendId], function(err, row) {
                  if (err) {
                    console.log(err);
                  } else {
                    let friends = JSON.parse(row.friends); //get array of friend's friends
                    friends = removeItemFromArray(friends, user.id); //remove user's id from friend list of friend that is to be unfriended
                    //save the new array by JSON.stringify()ing it and putting it in the database
                    accountsDb.run(`UPDATE users SET friends = ? WHERE user_id = ?`, [JSON.stringify(friends), friendId], function(err) {
                      if (err) {
                        console.log(err);
                      } else {
                        socket.emit("successfullyUnfriendedFriend");
                        accountsDb.close();
                      }
                    });
                  }
                });
              }
            })
          }
        });
      }
    });
  });

  socket.on("sendFriendRequest", (token, friendId) => {
    jwt.verify(token, process.env['JWT_PRIVATE_KEY'], function(err, user) {
      if (err) {
        console.log(err);
        socket.emit("error", "This should not happen.", "Sorry. Please describe what you did to get this error and submit a suggestion on the home page. We'll look into it as soon as possible.");
      } else if (user.id === friendId) { //check if user is trying to friend themselves
        socket.emit("youAreTryingToFriendYourself"); 
      } else {
        let accountsDb = new sqlite3.Database(__dirname + "/database/accounts.db", (err) => {
          if (err) {
            console.log(err);
          }
        });

        //get list of outgoing friend requests of user
        accountsDb.get(`SELECT outgoing_friend_requests FROM users WHERE user_id = ?`, [user.id], function(err, row) {
          if (err) {
            console.log(err);
          } else {
            let outgoing_friend_requests = JSON.parse(row.outgoing_friend_requests); //get array of outgoing friend requests of user
            outgoing_friend_requests.push(friendId); // add friend's id to list of user's outgoing friend requests
            //save the new array by JSON.stringify()ing it and putting it in the database
            accountsDb.run(`UPDATE users SET outgoing_friend_requests = ? WHERE user_id = ?`, [JSON.stringify(outgoing_friend_requests), user.id], function(err) {
              if (err) {
                console.log(err);
              } else {
                //get list of incoming friend requests of friend
                accountsDb.get(`SELECT incoming_friend_requests FROM users WHERE user_id = ?`, [friendId], function(err, row) {
                  if (err) {
                    console.log(err);
                  } else {
                    let incoming_friend_requests = JSON.parse(row.incoming_friend_requests); //get array of incoming friend requests of friend
                    incoming_friend_requests.push(user.id); //add user's id to friend's list of incoming friend requests
                    //save the new array by JSON.stringify()ing it and putting it in the database
                    accountsDb.run(`UPDATE users SET incoming_friend_requests = ? WHERE user_id = ?`, [JSON.stringify(incoming_friend_requests), friendId], function(err) {
                      if (err) {
                        console.log(err);
                      } else {
                        socket.emit("successfullySentFriendRequest");
                        accountsDb.close();
                      }
                    });
                  }
                });
              }
            })
          }
        });
      }
    });
  });

  //helper function to remove item from array and return new array after item has been removed
  function removeItemFromArray(array, value) {
    let index = array.indexOf(value);
    if (index !== -1) {
      array.splice(index, 1);
    }

    return array;
  }
}