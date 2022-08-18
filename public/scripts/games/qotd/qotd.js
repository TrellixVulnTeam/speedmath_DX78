var socket = io();

let divNotLoggedIn = document.getElementById("divNotLoggedIn");
let gameInfoContainer = document.getElementById("gameInfoContainer");
let alreadyCompletedTodays = document.getElementById("alreadyCompletedTodays");
let gameContainer = document.getElementById("gameContainer");
let endScreenContainer = document.getElementById("endScreenContainer");

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

socket.on("qotd_alreadyCompletedTodays", (secondsUntilTomorrows) => {
  gameInfoContainer.style.display = "none";
  gameContainer.style.display = "none";
  alreadyCompletedTodays.style.display = "block";

  document.getElementById("countdown").innerHTML = "Tomorrow's QOTD in <br>" + new Date(secondsUntilTomorrows * 1000).toISOString().slice(11, 19);
  
  let countdownUpdate = setInterval(function() {
    if (secondsUntilTomorrows > 0) {
      secondsUntilTomorrows -= 1;
      document.getElementById("countdown").innerHTML = "Tomorrow's QOTD in <br>" + new Date(secondsUntilTomorrows * 1000).toISOString().slice(11, 19);
    } else {
      location.reload();
    }
  }, 1000);
});

socket.on("qotd_displayQuestion", (question) => {
  gameContainer.style.display = "block";
  gameInfoContainer.style.display = "none";
  alreadyCompletedTodays.style.display = "none";

  let q = document.getElementById("question");

  q.innerHTML = question.question;

  renderMathInElement(q, {
    // customised options
    // • auto-render specific keys, e.g.:
    delimiters: [
        {left: '$$', right: '$$', display: true},
        {left: '$', right: '$', display: false},
        {left: '\\(', right: '\\)', display: false},
        {left: '\\[', right: '\\]', display: true}
    ],
    // • rendering keys, e.g.:
    throwOnError: false
  });

  Object.keys(question.answerChoices).forEach(choice => {
    let answerBtn = document.createElement("button");
    answerBtn.classList.add("answerChoiceButton", "contentTheme");
    answerBtn.id = choice;
    answerBtn.innerHTML = question.answerChoices[choice]; 

    renderMathInElement(answerBtn, {
      // customised options
      // • auto-render specific keys, e.g.:
      delimiters: [
          {left: '$$', right: '$$', display: true},
          {left: '$', right: '$', display: false},
          {left: '\\(', right: '\\)', display: false},
          {left: '\\[', right: '\\]', display: true}
      ],
      // • rendering keys, e.g.:
      throwOnError: false
    });
    
    document.getElementById("answerChoicesContainer").appendChild(answerBtn);

    answerBtn.addEventListener("click", function() {
      let token = localStorage.getItem("token") || sessionStorage.getItem("token");
      if (token) {
        socket.emit("qotd_verifyAnswer", token, choice);
      }
    });
  });
});

socket.on("qotd_displayEndScreen", (points, timeTaken, secondsUntilTomorrows) => {
  gameContainer.style.display = "none";
  gameInfoContainer.style.display = "none";
  alreadyCompletedTodays.style.display = "none";
  endScreenContainer.style.display = "block";

  document.getElementById("results").innerHTML = `You took ${Math.floor(timeTaken)} minutes and ${Math.floor((timeTaken - Math.floor(timeTaken))*60)} seconds to solve today's QOTD.<br>You earned ${points} points.`;
  document.getElementById("endScreenCountdown").innerHTML = "Tomorrow's QOTD in <br>" + new Date(secondsUntilTomorrows * 1000).toISOString().slice(11, 19);

  let countdownUpdate = setInterval(function() {
    if (secondsUntilTomorrows > 0) {
      secondsUntilTomorrows -= 1;
      document.getElementById("endScreenCountdown").innerHTML = "Tomorrow's QOTD in <br>" + new Date(secondsUntilTomorrows * 1000).toISOString().slice(11, 19);
    } else {
      location.reload();
    }
  }, 1000);
});

socket.on("error", (errorTitle, errorMessage) => {
  Swal.fire({
    title: errorTitle,
    text: errorMessage,
    icon: "error",
    iconColor: themeSettings.contentTextColor[localStorage.getItem("theme")],
    background: themeSettings.contentBackgroundColor[localStorage.getItem("theme")],
    color: themeSettings.contentTextColor[localStorage.getItem("theme")]
  });
});