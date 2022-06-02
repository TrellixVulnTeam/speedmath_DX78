module.exports = function(socket, sqlite3, bcrypt, jwt) {
  socket.on("login", async (username, password, rememberMe) => {
    //open the database
    let accountsDb = new sqlite3.Database(__dirname + "/database/accounts.db", (err) => {
      if (err) {
        console.log(err);
      }
    }); 

    //get the value in the password_hashed column from the row where the username is the inputted username (if it exists)
    accountsDb.all(`SELECT password_hashed FROM users WHERE username = ?`, [username], (err, rows) => {
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
              if (result == true) {
                let user = { name: username };
                jwt.sign(user, process.env['JWT_PRIVATE_KEY'], function(err, token) {
                  if (err) {
                    console.log(err);
                  } else {
                    socket.emit("successfulLogin", token, rememberMe);
                  }
                });
              } else {
                socket.emit("error", "wrong password bitch.", "fix it rn");
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
                      accountsDb.run(`INSERT INTO users(username, password_hashed, display_name, email, profile_picture, bio, friends, incoming_friend_requests, outgoing_friend_requests, achievements, public_account) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [username, hashedPassword, displayName, email, "defaultAvatar", "", "", "", "", "", "true"], function(err) {
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
        } else {
          socket.emit("error", "Username already taken!", "Please choose an unique username. You can choose a separate display name, which will be how you will be referred to in-game, which doesn't have to be an unique name.");
        }
      }
    });
  });
}