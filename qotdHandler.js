module.exports = function(socket, sqlite3, jwt) {
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

  socket.on("qotd_getQuestion", () => {
    let releaseDate = new Date("June 21, 2022 04:00:00");
    let currentTime = new Date();

    let days = Math.floor((currentTime.getTime() - releaseDate.getTime())/(1000*60*60*24));

    console.log(days);
  });
}