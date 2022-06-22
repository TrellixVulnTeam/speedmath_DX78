var socket = io();

let leaderboardContainer = document.getElementById("leaderboardContainer");
let btnPrevious10 = document.getElementById("btnPrevious10");
let btnNext10 = document.getElementById("btnNext10");

let leaderboardTable = document.getElementById("leaderboardTable");

let leaderboardView = {
  high: 1, //highest user to show
  low: 10 //lowest user to show
}

window.onload = function() {
  socket.emit("qotd_getLeaderboard", leaderboardView.high, leaderboardView.low);
}

btnPrevious10.addEventListener("click", function() {
  leaderboardView.high -= 10;
  leaderboardView.low -= 10;

  socket.emit("qotd_getLeaderboard", leaderboardView.high, leaderboardView.low);
});

btnNext10.addEventListener("click", function() {
  leaderboardView.high += 10;
  leaderboardView.low += 10;

  socket.emit("qotd_getLeaderboard", leaderboardView.high, leaderboardView.low);
});

socket.on("qotd_leaderboardData", (data, showPrevious, showNext) => {
  //first clear the current leaderboard:
  let tableRows = document.querySelectorAll("#leaderboardTable tr");

  //make sure to start at i = 1 to keep the table headings row
  for (let i = 1; i < tableRows.length; i++) {
    leaderboardTable.deleteRow(1);
  }

  //then use the data from the server to populate the leaderboard:
  let rank = leaderboardView.high;
  
  data.forEach((entry) => {
    let newRow = leaderboardTable.insertRow();
    let rankCell = newRow.insertCell(0);
    let nameCell = newRow.insertCell(1);
    let pointsCell = newRow.insertCell(2);

    rankCell.textContent = rank;
    rank++;

    let nameDisplay = document.createElement("a");
    nameDisplay.href = "/user/" + entry.username;
    nameDisplay.textContent = entry.display_name;
    nameCell.append(nameDisplay);

    pointsCell.textContent = entry.qotd_points;
  });

  if (showPrevious) {
    document.getElementById("btnPrevious10").style.display = "inline-block";
  } else {
    document.getElementById("btnPrevious10").style.display = "none";
  }

  if (showNext) {
    document.getElementById("btnNext10").style.display = "inline-block";
  } else {
    document.getElementById("btnNext10").style.display = "none";
  }
});