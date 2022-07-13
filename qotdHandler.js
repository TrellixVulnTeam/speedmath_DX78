module.exports = function(socket, sqlite3, jwt, qotdQuestionsJSON, qotd_usersCurrentlyPlaying) {
  socket.on("qotd_getLeaderboard", (highEnd, lowEnd) => {
    //open the database
    let accountsDb = new sqlite3.Database(__dirname + "/database/accounts.db", (err) => {
      if (err) {
        console.log(err);
      }
    });

    let offset = highEnd - 1; //how many spots down from the top to pull data from 
    let limit = lowEnd - highEnd + 1; //how many rows of data to pull

    //whether to show the previous 10/next 10 buttons on client side
    let showPrevious;
    let showNext;

    if (highEnd >= 11) { //show the "View previous 10" button if the high end of currently displayed part of leaderboard is 11th or lower (well actually higher but ykwim)
      showPrevious = true;
    } else {
      showPrevious = false;
    }

    accountsDb.all(`SELECT username, display_name, qotd_points FROM users WHERE public_account = ? ORDER BY qotd_points DESC LIMIT ? OFFSET ?`, ["true", limit, offset], function (err, rows) {
      if (err) {
        console.log(err);
        accountsDb.close();
      } else {
        accountsDb.get(`SELECT COUNT(*) FROM users`, (err, count) => {
          let numberOfUsers = count["COUNT(*)"];

          //only show the "Next 10" button if the low end of the currently displayed leaderboard is less than the total number of users, aka if there are more users than the number that were currently shown
          if (numberOfUsers > lowEnd) {
            showNext = true;
          } else {
            showNext = false;
          }
          
          socket.emit("qotd_leaderboardData", rows, showPrevious, showNext);
          accountsDb.close();
        });
      }
    });
  });

  socket.on("qotd_getQuestion", (token) => {
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
        
        let releaseDate = new Date("July 2, 2022 00:00:00"); //time when first qotd problem was released, set to 4 AM because we want it to be in terms of EDT/EST and default js time is EST
        let currentTime = new Date();

        let qotdDay = Math.ceil((currentTime.getTime() - releaseDate.getTime())/(1000*60*60*24));

        let questionToDisplay = {
          question: qotdQuestionsJSON[qotdDay].question,
          answerChoices: qotdQuestionsJSON[qotdDay].answerChoices
        }
        
        if (user.id.toString() in qotd_usersCurrentlyPlaying) {
          socket.emit("qotd_displayQuestion", questionToDisplay);
        } else {
          accountsDb.get(`SELECT qotd_points, qotd_last_completed FROM users WHERE user_id = ?`, [user.id], function(err, row) {
            if (err) {
              console.log(err);
            } else {
              if (row.qotd_last_completed === qotdDay) {
                let nextMidnight = new Date(currentTime);
                nextMidnight.setHours(23, 59, 59, 999);
                
                let secondsUntilTomorrows = (nextMidnight.getTime() - currentTime.getTime())/1000;
                
                socket.emit("qotd_alreadyCompletedTodays", secondsUntilTomorrows);
              } else {
                qotd_usersCurrentlyPlaying[user.id] = {
                  startTime: currentTime.getTime(), 
                  oldTotalScore: row.qotd_points
                };
                socket.emit("qotd_displayQuestion", questionToDisplay);
              }
            }
          });
        }

        accountsDb.close();
      }
    });
  });

  socket.on("qotd_verifyAnswer", (token, answer) => {
    jwt.verify(token, process.env['JWT_PRIVATE_KEY'], function(err, user) {
      if (err) {
        console.log(err);
        ("error", "This should not happen.", "Sorry. Please describe what you did to get this error and submit a suggestion on the home page. We'll look into it as soon as possible.");
      } else {
        let releaseDate = new Date("July 2, 2022 00:00:00"); //time when first qotd problem was released, set to 4 AM because we want it to be in terms of EDT/EST and default js time is EST
        let currentTime = new Date();
    
        let qotdDay = Math.ceil((currentTime.getTime() - releaseDate.getTime())/(1000*60*60*24));

        if (user.id.toString() in qotd_usersCurrentlyPlaying) {
          let timeDifference = (currentTime.getTime() - qotd_usersCurrentlyPlaying[user.id].startTime)/1000/60; //get time difference in minutes
          let pointsEarned;
          
          if (answer == qotdQuestionsJSON[qotdDay].correctAnswer) {
            pointsEarned = points(timeDifference);
          } else {
            pointsEarned = 0;
          }
          
          let newTotalPoints = qotd_usersCurrentlyPlaying[user.id].oldTotalScore + pointsEarned; 

          //open the database
          let accountsDb = new sqlite3.Database(__dirname + "/database/accounts.db", (err) => {
            if (err) {
              console.log(err);
            }
          });     

          //update user's qotd_points and qotd_last_completed
          accountsDb.run(`UPDATE users SET qotd_points = ?, qotd_last_completed = ? WHERE user_id = ?`, [newTotalPoints, qotdDay, user.id], function(err) {
            if (err) {
              console.log(err);
            } else {
              let nextMidnight = new Date(currentTime);
              nextMidnight.setHours(23, 59, 59, 999);  
              let secondsUntilTomorrows = (nextMidnight.getTime() - currentTime.getTime())/1000
              
              delete qotd_usersCurrentlyPlaying[user.id];
              accountsDb.close();
              socket.emit("qotd_displayEndScreen", pointsEarned, timeDifference, secondsUntilTomorrows); 
            }
          });
        } else {
          socket.emit("error", "This should not happen.", "This shouldn't be happening unless you're trying to cheat.");
        }
      }
    });
  });

  //time has to be in minutes
  function points(time) {
    return Math.floor(100 * Math.pow(0.9, time));
  }
}