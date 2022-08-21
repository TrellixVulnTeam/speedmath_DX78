module.exports = function(socket, sqlite3, bcrypt, jwt, hcaptcha, sendgridMailer) {
  socket.on("login", async (username, password, rememberMe) => {
    //open the database
    let accountsDb = new sqlite3.Database(__dirname + "/database/accounts.db", (err) => {
      if (err) {
        console.log(err);
      }
    }); 

    //get the value in the password_hashed column from the row where the username is the inputted username (if it exists)
    accountsDb.all(`SELECT user_id, password_hashed FROM users WHERE username = ?`, [username], (err, rows) => {
      if (err) {
        console.log(err);
      } else {
        if (rows.length === 0) {
          socket.emit("error", "An account with that username does not exist.", "If you want that username, please create an account by clicking the \"Register\" button.");
        } else {
          bcrypt.compare(password, rows[0].password_hashed, function(err, result) {
            if (err) {
              console.log(err);
            } else {
              if (result == true) {
                let user = { id: rows[0].user_id };
                jwt.sign(user, process.env['JWT_PRIVATE_KEY'], function(err, token) {
                  if (err) {
                    console.log(err);
                  } else {
                    socket.emit("successfulLogin", token, rememberMe);
                  }
                });
              } else {
                socket.emit("error", "Wrong password.", "Please try again.");
              }
            }

            accountsDb.close();
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
    accountsDb.all(`SELECT username FROM users WHERE username = ?`, [username], (err, rows) => {
      if (err) {
        console.log(err);
      } else {
        if (rows.length === 0) { //if there aren't any rows (no existing users with username of person wanting to register)
            //check if there are any rows with an user whose email is the inputted email (if not null)
            accountsDb.all(`SELECT email FROM users WHERE email = ?`, [email], (err, rows) => {
              if (err) {
                console.log(err);
              } else {
                if (email == null || rows.length === 0) { //if there aren't any rows (no existing users with username of person wanting to register)
                  bcrypt.hash(password, 10, function(bcryptError, hashedPassword) { //hash password and insert information into database table
                    if (bcryptError) {
                      console.log(bcryptError)
                    } else {
                      accountsDb.run(`INSERT INTO users(username, password_hashed, display_name, email, profile_picture, bio, friends, incoming_friend_requests, outgoing_friend_requests, achievements, publicly_displayed_achievements, public_account, topic_practice_stats_privacy, qotd_points, balance, direct_messages) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [username, hashedPassword, displayName, email, "defaultAvatar", "No bio yet.", "[]", "[]", "[]", "[]", "[]", "true", "friends", 0, 0, "{}"], function(err) {
                        if (err) {
                          console.log(err);
                        } else {
                          accountsDb.run(`INSERT INTO topicsPracticeStats(addition_level, subtraction_level, multiplication_level, division_level, squaring_level, square_root_level, modular_arithmetic_level) VALUES (?, ?, ?, ?, ?, ?, ?)`, [1, 1, 1, 1, 1, 1, 1], function(err) {
                            if (err) {
                              console.log(err);
                            } else {
                              socket.emit("successfullySignedUp");
                              accountsDb.close((err) => {
                                if (err) {
                                  console.log(err);
                                }
                              });
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
        } else {
          socket.emit("error", "Username already taken!", "Please choose an unique username. You can choose a separate display name, which will be how you will be referred to in-game, which doesn't have to be an unique name.");
        }
      }
    });
  });

  socket.on("deleteAccount", (token, password) => {
    jwt.verify(token, process.env['JWT_PRIVATE_KEY'], function(err, user) {
      if (err) {
        console.log(err);
        socket.emit("error", "This should not happen.", "Sorry. Please describe what you did to get this error and submit a suggestion on the home page. We'll look into it as soon as possible.");
      } else {
        //open the database
        let accountsDb = new sqlite3.Database(__dirname + "/database/accounts.db", (err) => {
          if (err) {
            console.log(err);
          }
        }); 

        accountsDb.get(`SELECT password_hashed FROM users WHERE user_id = ?`, [user.id], function(err, row) {
          if (err) {
            console.log(err);
            accountsDb.close();
          } else {
            bcrypt.compare(password, row.password_hashed, function(err, result) {
              if (err) {
                console.log(err);
                accountsDb.close();
              } else {
                if (result == true) {
                  accountsDb.run(`DELETE FROM users WHERE user_id = ?`, [user.id], function(err) {
                    if (err) {
                      console.log(err);
                      accountsDb.close();
                    } else {
                      accountsDb.run(`DELETE FROM topicsPracticeStats WHERE user_id = ?`, [user.id], function(err) {
                        if (err) {
                          console.log(err);
                          accountsDb.close();
                        } else {
                          socket.emit("successfullyDeletedAccount");
                          accountsDb.close();
                        }
                      });
                    }
                  });
                } else {
                  socket.emit("error", "Wrong Password", "If you want to delete your account, you have to recall your password correctly.");
                  accountsDb.close();
                }
              }
            });
          }
        });
      }
    });
  });

  socket.on("requestPasswordResetEmail", (email) => {
    //open the database
    let accountsDb = new sqlite3.Database(__dirname + "/database/accounts.db", (err) => {
      if (err) {
        console.log(err);
      }
    });

    //check if there are any accounts with the email
    accountsDb.all(`SELECT user_id, email, username FROM users WHERE email = ?`, [email], (err, rows) => {
      if (err) {
        console.log(err);
        accountsDb.close();
      } else {
        accountsDb.close();
        
        if (rows.length === 0) {
          socket.emit("error", "There is not an account associated with that email.");
        } else {
          let user = { id: rows[0].user_id };
          jwt.sign(user, process.env['JWT_PRIVATE_KEY'], { expiresIn: '30m' }, function(err, token) {
            if (err) {
              console.log(err);
            } else {
              const msg = {
                to: email, // recipient
                from: 'reset@speedmath.ml', // sender email on SendGrid
                subject: 'Reset Password',
                text: 'Reset your SpeedMath account\'s password',
                html: `<p>Dear<strong><span style="font-size:18px"> ${rows[0].username},</span></strong></p>
              
                <p><span style="font-size:18px">Please click the following link within the next 30 minutes to reset your password!<br />
                <strong><a href="https://speedmath.ml/forgot-password?token=${token}">Reset Password</a></strong><br />
                <br />
                If the hyperlink doesn&#39;t work in your browser, copy-paste this link and paste it in a new browser tab:</span></p>
                
                <p><strong><span style="font-size:18px"><a href="https://speedmath.ml/forgot-password?token=${token}">https://speedmath.ml/forgot-password?token=${token}</a></span></strong></p>
                
                <p><span style="font-size:18px">Thank you for using SpeedMath to practice math!</span></p>
                
                <p><strong><span style="font-size:18px">Sincerely,<br />
                SpeedMath Development Team</span></strong></p>
                
                <p><span style="font-size:14px">If you did not request this email, you can safely ignore it.</span></p>`,
              }
    
              sendgridMailer.send(msg).catch((error) => {
                console.error(error);
              });
    
              socket.emit("sentPasswordResetEmail");
            }
          });
        }
      }
    });
  });

  //verify user's password reset token:
  socket.on("requestPasswordResetForm", (token) => {
    jwt.verify(token, process.env['JWT_PRIVATE_KEY'], function(err, user) {
      if (err) {
        socket.emit("invalidPasswordResetToken");
      } else {
        socket.emit("showNewPasswordForm");
      }
    });
  });

  socket.on("updatePassword", (password, token) => {
    jwt.verify(token, process.env['JWT_PRIVATE_KEY'], function(err, user) {
      if (err) {
        socket.emit("invalidPasswordResetToken");
      } else {
        //open the database
        let accountsDb = new sqlite3.Database(__dirname + "/database/accounts.db", (err) => {
          if (err) {
            console.log(err);
          }
        });

        bcrypt.hash(password, 10, function(bcryptError, hashedPassword) { //hash password and insert information into database table
          if (bcryptError) {
            console.log(bcryptError);
            socket.emit("error", "Sorry, there was an error.", "");
            accountsDb.close();
          } else {
            accountsDb.run(`UPDATE users SET password_hashed = ? WHERE user_id = ?`, [hashedPassword, user.id], function(err) {
              if (err) {
                console.log(err);
                accountsDb.close();
              } else {
                accountsDb.close();
                socket.emit("successfullyChangedPassword");
              }
            });
          }
        });
      }
    });
  });
}