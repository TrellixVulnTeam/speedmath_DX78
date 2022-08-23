module.exports = function(socket, sqlite3, jwt) {
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
        socket.emit("error", "This should not happen.", "Sorry. Please describe what you did to get this error and submit a suggestion on the About Us page. We'll look into it as soon as possible.");
      } else {
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
      }
    });
  });

  socket.on("adminPortal_getTopicPracticeTableColumns", (token) => {
    jwt.verify(token, process.env['JWT_PRIVATE_KEY'], function(err, user) {
      if (err) {
        console.log(err);
        socket.emit("error", "This should not happen.", "Sorry. Please describe what you did to get this error and submit a suggestion on the About Us page. We'll look into it as soon as possible.");
      } else {
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
          socket.emit("error", "This should not happen.", "Sorry. Please describe what you did to get this error and submit a suggestion on the About Us page. We'll look into it as soon as possible.");
        } else {
          console.log(columnsRequested);
  
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
        }
      });
    }
  });
}