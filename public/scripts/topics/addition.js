class AdditionQuestion {
  //to create an addition question about adding an a-digit long number and a b-digit long number
  constructor(a, b) {
    let num1 = Math.floor(Math.random() * (Math.pow(10, a)-Math.pow(10, (a-1)))) + Math.pow(10, (a-1));
    let num2 = Math.floor(Math.random() * (Math.pow(10, b)-Math.pow(10, (b-1)))) + Math.pow(10, (b-1));

    this.question = `${num1} + ${num2}`;
    this.answer = num1 + num2;
  }
}

let intro = document.getElementById("intro");
let game = document.getElementById("game");
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

if (localStorage.getItem("additionStats")) {
  userStats = JSON.parse(localStorage.getItem("additionStats"));
}

if ((localStorage.getItem("masteredAddition") === "true") || (userStats.level === 11)) {
  displayMasteredScreen();
}

btnStart.addEventListener("click", function() {
  intro.classList.add('animate__animated', 'animate__zoomOut'); //animation using a library

  intro.addEventListener("animationend", startGame);
});

btnContinue.addEventListener("click", function() {
  newLevelContainer.classList.add('animate__animated', 'animate__zoomOut');
  newLevelContainer.addEventListener("animationend", function() {
    //newLevelContainer.classList.remove('animate__animated', 'animate__zoomOut');
    startGame();
  });
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
  questionBox.innerHTML = question.question;

  answerField.focus();

  let timeLeft; //seconds

  if (userStats.level < 4) {
    timeLeft = 8;
  } else if (userStats.level < 7) {
    timeLeft = 15;
  } else {
    timeLeft = 20;
  }

  timer.innerHTML = `${Math.floor(timeLeft/60)}m${timeLeft%60}s`;

  var countdown = setInterval(function() { 
    timeLeft -= 1;
    
    if (timeLeft > 0) {
      timer.innerHTML = `${Math.floor(timeLeft/60)}m${timeLeft%60}s`;
    } else {
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
        localStorage.setItem("additionStats", JSON.stringify(userStats));
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
          localStorage.setItem("additionStats", JSON.stringify(userStats));
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

    localStorage.setItem("additionStats", JSON.stringify(userStats));
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

  localStorage.setItem("masteredAddition", "true");
}

if ((localStorage.getItem("masteredAddition") === "true") || (userStats.level === 11)) {
  displayMasteredScreen();
}

//defining question type for each level of the game
function generateQuestion(level) {
  /*switch (level) {
    case 1:
      return new AdditionQuestion(1, 1);
    case 2: 
      return new AdditionQuestion(2, 1);
    case 3:
      return new AdditionQuestion(2, 2);
    case 4:
      return new AdditionQuestion(3, 2);
    case 5:
      return new AdditionQuestion(3, 3);
    case 6:
      return new AdditionQuestion(4, 3);
    case 7:
      return new AdditionQuestion(4, 4);
    case 8: 
      return new AdditionQuestion(5, 5);
    case 9:
      return new AdditionQuestion(7, 6);
    case 10:
      return new AdditionQuestion(8, 8);
  }*/

  return new AdditionQuestion(1, 1);
}