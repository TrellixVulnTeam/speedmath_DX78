var socket = io();

let divNotLoggedIn = document.getElementById("divNotLoggedIn");
let gameInfoContainer = document.getElementById("gameInfoContainer");
let alreadyCompletedTodays = document.getElementById("alreadyCompletedTodays");
let gameContainer = document.getElementById("gameContainer");

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
  let token = localStorage.getItem("token") || sessionStorage.getItem("token");
  if (token) {
    socket.emit("qotd_getQuestion", token);
  }
});

socket.on("qotd_displayQuestion", (question) => {
  gameContainer.style.display = "block";
  gameInfoContainer.style.display = "none";

  document.getElementById("question").innerHTML = question.question;

  Object.keys(question.answerChoices).forEach(choice => {
    let answerBtn = document.createElement("button");
    answerBtn.classList.add("answerChoiceButton", "contentTheme");
    answerBtn.id = choice;
    answerBtn.innerHTML = question.answerChoices[choice]; 
    document.getElementById("answerChoicesContainer").appendChild(answerBtn);
  });

  changeTheme();
  //alert(JSON.stringify(question));
});