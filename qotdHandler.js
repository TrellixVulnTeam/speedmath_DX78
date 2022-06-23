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
        
        let releaseDate = new Date("June 22, 2022 04:00:00"); //time when first qotd problem was released, set to 4 AM because we want it to be in terms of EDT/EST and default js time is EST
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
                let now = new Date();
                let nextMidnight = new Date(now);
                nextMidnight.setHours(24, 0, 0, 0);
                let secondsUntilTomorrows = (nextMidnight - now)/1000
                
                socket.emit("qotd_alreadyCompletedTodays", secondsUntilTomorrows);
              } else {
                qotd_usersCurrentlyPlaying[user.id] = {startTime: new Date().getTime()};
                socket.emit("qotd_displayQuestion", questionToDisplay);
              }
            }
          });
        }

        accountsDb.close();
      }
    });
  });
}