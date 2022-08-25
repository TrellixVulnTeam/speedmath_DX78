module.exports = function(socket, sqlite3, jwt, sendgridMailer) {
  socket.on("adminPortal_login", (password) => {
    if (password === process.env['ADMIN_PORTAL_PASSWORD']) {
      let user = {
        admin: true
      }

      jwt.sign(user, process.env['JWT_PRIVATE_KEY'], function(err, token) {
        if (err) {
          console.log(err);
        } else {
          socket.emit("adminPortal_successfullyLoggedIn", token);
        }
      });
    } else {
      socket.emit("error", "Wrong password.", "Please try again.");
    }
  });

  socket.on("adminPortal_getAccountsTableColumns", (token) => {
    jwt.verify(token, process.env['JWT_PRIVATE_KEY'], function(err, user) {
      if (err) {
        console.log(err);
        socket.emit("error", "This should not happen.", "Error Code #1. Sorry. Please describe what you did to get this error and submit a suggestion on the About Us page. We'll look into it as soon as possible.");
      } else {
        if (user.admin) {
          let accountsDb = new sqlite3.Database(__dirname + "/database/accounts.db", (err) => {
            if (err) {
              console.log(err);
            }
          }); 
          
          accountsDb.get(`SELECT * FROM users`, [], function(err, row) {
            if (err) {
              console.log(err);
              accountsDb.close();
            } else {
              socket.emit("adminPortal_accountsTableColumns", Object.keys(row));
              accountsDb.close();
            }
          });
        } else {
          socket.emit("error", "This should not happen.", "Error Code #2. Sorry. Please describe what you did to get this error and submit a suggestion on the About Us page. We'll look into it as soon as possible.");
        }
      }
    });
  });

  socket.on("adminPortal_getTopicPracticeTableColumns", (token) => {
    jwt.verify(token, process.env['JWT_PRIVATE_KEY'], function(err, user) {
      if (err) {
        console.log(err);
        socket.emit("error", "This should not happen.", "Error Code #3. Sorry. Please describe what you did to get this error and submit a suggestion on the About Us page. We'll look into it as soon as possible.");
      } else {
        if (user.admin) {
          let accountsDb = new sqlite3.Database(__dirname + "/database/accounts.db", (err) => {
            if (err) {
              console.log(err);
            }
          }); 
          
          accountsDb.get(`SELECT * FROM topicsPracticeStats`, [], function(err, row) {
            if (err) {
              console.log(err);
              accountsDb.close();
            } else {
              socket.emit("adminPortal_topicPracticeTableColumns", Object.keys(row));
              accountsDb.close();
            }
          });
        } else {
          socket.emit("error", "This should not happen.", "Error Code #4. Sorry. Please describe what you did to get this error and submit a suggestion on the About Us page. We'll look into it as soon as possible.");
        }
      }
    });
  });

  socket.on("adminPortal_requestColumns", (token, table, columnsRequested, orderBy) => {
    if (columnsRequested == "") {
      socket.emit("error", "Please select at least one column to view.", "");
    } else {
      jwt.verify(token, process.env['JWT_PRIVATE_KEY'], function(err, user) {
        if (err) {
          console.log(err);
          socket.emit("error", "This should not happen.", "Error Code #5. Sorry. Please describe what you did to get this error and submit a suggestion on the About Us page. We'll look into it as soon as possible.");
        } else {
          if (user.admin) {
            let accountsDb = new sqlite3.Database(__dirname + "/database/accounts.db", (err) => {
              if (err) {
                console.log(err);
              }
            });
    
            accountsDb.all(`SELECT ${columnsRequested} FROM ${table} ORDER BY ${orderBy.column} ${orderBy.order}`, function(err, rows) {
              if (err) {
                console.log(err);
                accountsDb.close();
              } else {
                socket.emit("adminPortal_tableData", rows);
                accountsDb.close();
              }
            });
          } else {
            socket.emit("error", "This should not happen.", "Error Code #6. Sorry. Please describe what you did to get this error and submit a suggestion on the About Us page. We'll look into it as soon as possible.");
          }
        }
      });
    }
  });

  socket.on("adminPortal_changeData", (token, table, column, userId, newEntry) => {
    jwt.verify(token, process.env['JWT_PRIVATE_KEY'], function(err, user) {
      if (err) {
        console.log(err);
        socket.emit("error", "This should not happen.", "Error Code #7. Sorry. Please describe what you did to get this error and submit a suggestion on the About Us page. We'll look into it as soon as possible.");
      } else {
        if (user.admin) {
          let accountsDb = new sqlite3.Database(__dirname + "/database/accounts.db", (err) => {
            if (err) {
              console.log(err);
            }
          });

          accountsDb.run(`UPDATE ${table} SET ${column} = ? WHERE user_id = ?`, [newEntry, userId], function(err) {
            if (err) {
              console.log(err);
              socket.emit("error", "Error!", err);
              accountsDb.close();
            } else {
              socket.emit("adminPortal_successfullyUpdatedData");
              accountsDb.close();
            }
          });
        } else {
          socket.emit("error", "This should not happen.", "Error Code #8. Sorry. Please describe what you did to get this error and submit a suggestion on the About Us page. We'll look into it as soon as possible.");
        }
      }
    });
  });

  

  socket.on("adminPortal_deleteAccount", (token, userId, reason) => {
    jwt.verify(token, process.env['JWT_PRIVATE_KEY'], function(err, user) {
      if (err) {
        console.log(err);
        socket.emit("error", "This should not happen.", "Error Code #9. Sorry. Please describe what you did to get this error and submit a suggestion on the About Us page. We'll look into it as soon as possible.");
      } else {
        if (user.admin) {
          let accountsDb = new sqlite3.Database(__dirname + "/database/accounts.db", (err) => {
            if (err) {
              console.log(err);
            }
          });

          accountsDb.get(`SELECT email, display_name, username FROM users WHERE user_id = ?`, [userId], function(err, row) {
            if (err) {
              console.log(err);
              socket.emit("error", "This should not happen.", "Error Code #10. Sorry. Please describe what you did to get this error and submit a suggestion on the About Us page. We'll look into it as soon as possible.");
            } else {
              console.log(row);

              //log the ban in the discord channel:
              const webhook = require("webhook-discord");
              const Hook = new webhook.Webhook(process.env['WEBHOOK_LINK_BAN_LOG']);  
              
              Hook.custom("SpeedMath Moderation", `**User ID:** ${userId}\n**Username:** ${row.username}\n**Display Name:** ${row.display_name}\n**Email:** ${row.email}\n\n**Ban Reason:** ${reason}`, "Account Banned", "#e33e32");

              //email the user that's about to get banned if they have an email address attached to the account
              if (row.email != null) {
                let message = {
                  to: row.email, //recipient,
                  from: 'moderation@speedmath.ml',
                  subject: 'Account Banned',
                  text: 'Your SpeedMath account has been banned',
                  html: `<p><strong><span style="font-size:18px">Dear ${row.display_name} </span></strong><span style="font-size:18px">(@${row.username})</span><strong><span style="font-size:18px">,</span></strong></p>

                        <p><span style="font-size:18px">Your SpeedMath account has been banned due to one or more violations of our <a href="https://speedmath.ml/tos">Terms of Service</a>.</span></p>
                        
                        <p>&nbsp;</p>
                        
                        <p><span style="font-size:18px">Ban Reason:</span></p>
                        
                        <p><strong>${reason}</strong></p>
                        
                        <p>&nbsp;</p>
                        
                        <p><span style="font-size:18px">If you feel like you were banned by mistake and want to request a ban appeal, please email us back at <a href="mailto:speedmath.ml@gmail.com?subject=Ban%20Appeal%20Request">speedmath.ml@gmail.com</a></span></p>
                        
                        <p><strong><span style="font-size:18px">Sincerely,<br />
                        SpeedMath Moderation Team</span></strong></p>`
                }

                sendgridMailer.send(msg).catch((error) => {
                  console.error(error);
                });
              }

              //actually remove their account now:
              accountsDb.run(`DELETE FROM users WHERE user_id = ?`, [userId], function(err) {
                if (err) {
                  console.log(err);
                  socket.emit("error", "This should not happen.", "Error Code #11. Sorry. Please describe what you did to get this error and submit a suggestion on the About Us page. We'll look into it as soon as possible.");
                  accountsDb.close();
                } else {
                  accountsDb.run(`DELETE FROM topicsPracticeStats WHERE user_id = ?`, [userId], function(err) {
                    if (err) {
                      console.log(err);
                      socket.emit("error", "This should not happen.", "Error Code #12. Sorry. Please describe what you did to get this error and submit a suggestion on the About Us page. We'll look into it as soon as possible.");
                      accountsDb.close();
                    } else {
                      socket.emit("adminPortal_successfullyDeletedUserAccount");
                      accountsDb.close();
                    }
                  });
                }
              });
            }
          });
        } else {
          socket.emit("error", "This should not happen.", "Error Code #13. Sorry. Please describe what you did to get this error and submit a suggestion on the About Us page. We'll look into it as soon as possible.");
        }
      }
    });
  });
}