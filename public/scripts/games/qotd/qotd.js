var socket = io();

let divNotLoggedIn = document.getElementById("divNotLoggedIn");
let gameInfoContainer = document.getElementById("gameInfoContainer");

let btnPlay = document.getElementById("btnPlay");
let btnShowLeaderboard = document.getElementById("btnShowLeaderboard");


//check if user is logged in on pageload
window.onload = function() {
  let token = localStorage.getItem("token") || sessionStorage.getItem("token");

  if (token === null) {
    divNotLoggedIn.style.display = "block";
  } else {
    gameInfoContainer.style.display = "block";
  }
}

btnPlay.addEventListener("click", function() {
  socket.emit("qotd_getQuestion");
});

