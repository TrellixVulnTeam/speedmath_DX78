var socket = io();

let btnPlay = document.getElementById("btnPlay");
let btnShowLeaderboard = document.getElementById("btnShowLeaderboard");

window.onload = function() {
  let token = localStorage.getItem("token") || sessionStorage.getItem("token");

  if (token === null) {
    document.getElementById("divNotLoggedIn").style.display = "block";
  } else {
    document.getElementById("gameInfoContainer").style.display = "block";
  }
}