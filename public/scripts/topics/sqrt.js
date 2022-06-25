var socket = io();

class Question {
  //to create a question about finding the square root of a number between lowerBound and upperBound
  constructor(lowerBound, upperBound) {
    //square root the lower and upper bounds to get a range to generate a random number in that we can then square to generate a question
    let a = Math.ceil(Math.sqrt(lowerBound));
    let b = Math.floor(Math.sqrt(upperBound));

    let number = Math.floor(a + Math.random() * (b - a + 1)); //to generate a random number between a and b (inclusive)

    this.question = `\\sqrt{${number**2}}`;
    this.answer = number;
  }
}

//defining question type for each level of the game
function generateQuestion(level) {
  switch (level) {
    case 1:
      return new Question(1, 100);
    case 2: 
      return new Question(1, 400);
    case 3:
      return new Question(100, 900);
    case 4:
      return new Question(400, 2500);
    case 5:
      return new Question(100, 8100);
    case 6:
      return new Question(2500, 10000);
    case 7:
      return new Question(9801, 90000);
    case 8: 
      return new Question(90000, 1000000);
    case 9:
      return new Question(250000, 100000000);
    case 10:
      return new Question(100000000, 10000000000);
  }
}

//defining how much time user will have at each level
//format is level: time (seconds)
let levelTime = {
  1: 8,
  2: 8,
  3: 15,
  4: 20,
  5: 25,
  6: 25,
  7: 30,
  8: 25,
  9: 35,
  10: 40
}

let intro = document.getElementById("intro");
let game = document.getElementById("game");
let btnStart = document.getElementById("btnStart");
let answerField = document.getElementById("answerField");
let btnSubmit = document.getElementById("btnSubmit");
let questionBox = document.getElementById("question");
let timer = document.getElementById("timer");
let newLevelContainer = document.getElementById("newLevelContainer");
let levelsProgressBar = document.getElementById("levelsProgressBar");
let btnContinue = document.getElementById("btnContinue");
let newLevelMessage = document.getElementById("newLevelMessage");
let questionsProgressBar = document.getElementById("questionsProgressBar");
let mastered = document.getElementById("mastered");

// so that pressing enter = clicking submit button
answerField.addEventListener("keyup", function(e) {
  if (e.keyCode === 13) {
    btnSubmit.click();
  }
});

let userStats = {
  level: 1,
  question: 1,
  wrongStreak: 0
}

let token = localStorage.getItem("token") || sessionStorage.getItem("token");
let loggedIn;

if (token !== null) {
  loggedIn = true;
  socket.emit("getTopicPracticeStats", token, "squareroot");
} else {
  loggedIn = false;
  btnStart.addEventListener("click", function() {
    intro.classList.add('animate__animated', 'animate__zoomOut'); //animation using a library
  
    intro.addEventListener("animationend", startGame);
  });
}

socket.on("topicPracticeLevel", level => {
  userStats.level = level;
  
  if (userStats.level === 11) {
    displayMasteredScreen();
  }

  btnStart.addEventListener("click", function() {
    intro.classList.add('animate__animated', 'animate__zoomOut'); //animation using a library
  
    intro.addEventListener("animationend", startGame);
  });
});

btnContinue.addEventListener("click", function() {
  startGame();
});

function startGame() {
  intro.style.display = "none";
  game.style.display = "grid";
  newLevelContainer.style.display = "none";
  answerField.value = "";

  displayLevel();
  nextQuestion();
}

function nextQuestion() {
  let question = generateQuestion(userStats.level);
  questionBox.innerHTML = katex.renderToString(question.question);

  answerField.focus();

  let timeLeft = levelTime[userStats.level];

  timer.innerHTML = `${Math.floor(timeLeft/60)}m${timeLeft%60}s`;

  var countdown = setInterval(function() { 
    timeLeft -= 1;
    
    if (timeLeft > 0) {
      timer.innerHTML = `${Math.floor(timeLeft/60)}m${timeLeft%60}s`;
    } else {
      clearInterval(countdown);
      btnSubmit.click();
    }
  }, 1000);

  btnSubmit.addEventListener("click", verifyAnswer);

  function verifyAnswer() {
    clearInterval(countdown);
    btnSubmit.removeEventListener("click", verifyAnswer);
    if (answerField.value == question.answer) { //if correct:
      userStats.wrongStreak = 0; //wrong streak resets
      if (userStats.question == 10) { //level goes up if 10 questions of the previous level are done
        userStats.level++; 
        userStats.question = 1;
        displayLevelScreen();
        if (loggedIn) {
          socket.emit("updateTopicPracticeStats", token, "squareroot", userStats.level);
        }
        return;
      } else {
        userStats.question++; //if correct but 10 questions of level not done, question number simply goes up
      }
    } 
    else { //if wrong:
      userStats.wrongStreak++; //increment wrong streak
      if (userStats.wrongStreak >= 3) { //if wrong streak reaches 3...
        if (userStats.level > 1) { //if on a level higher than 1,
          userStats.level--; //go a level down
          userStats.question = 1;
          displayLevelScreen();
          if (loggedIn) {
            socket.emit("updateTopicPracticeStats", token, "squareroot", userStats.level);
          }
          return;
        } else {
          userStats.question = 1; //if on level 1 and wrong streak reaches 3, level resets
          //i seriously hope this never happens to someone
        }
  
        userStats.wrongStreak = 0; //wrong streak goes back to 0 after wrong streak reaches 3 and an action is done
      } else {
        if (userStats.question > 1) {
          userStats.question--; //go down a question if not already at question #1
        }
      }
    }
    
    answerField.value = "";
    displayLevel();
    nextQuestion();
  }
}

function displayLevel() {
  document.getElementById("spanCurrentLevel").innerHTML = `Level ${userStats.level}`;
  if (userStats.level < 10) {
    document.getElementById("spanNextLevel").innerHTML = `Level ${userStats.level + 1}`;
  } else {
    document.getElementById("spanNextLevel").innerHTML = `Mastery`;
  }

  questionsProgressBar.value = userStats.question;  
}

function displayLevelScreen() {
  if (userStats.level === 11) {
    displayMasteredScreen();
    return;
  }
  
  game.style.display = "none";
  levelsProgressBar.value = userStats.level;
  newLevelMessage.innerHTML = `You are now on Level <span style="font-weight:bold;font-size:1.3em;">${userStats.level}</span>. Press the continue button to continue playing!`;
  newLevelContainer.style.display = "block";
}

function displayMasteredScreen() {
  intro.style.display = "none";
  game.style.display = "none";
  newLevelContainer.style.display = "none";
  mastered.style.display = "block";
}
