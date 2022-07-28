var socket = io();

//https://web.archive.org/web/20090717035140if_/javascript.about.com/od/problemsolving/a/modulobug.htm
Number.prototype.mod = function(n) {
  return ((this%n)+n)%n;
}

class Question {
  //type for question type, such as basic, addition, subtraction, multiplication, exponentiation, etc.
  //args for array of arguments to decide the size of the numbers in the question
  constructor (type, args) {
    this.type = type;
    this.args = args;
    switch (type) {
      case "basic":
        if (args.length === 4) {
          let dividend = randomNumberBetween(args[0], args[1]);
          let divisor = randomNumberBetween(args[2], args[3]);
          this.question = `${dividend}\\operatorname{mod}${divisor}`;
          this.answer = dividend.mod(divisor);
          this.work = `$${dividend} \\div ${divisor}=${Math.floor(dividend/divisor)}\\ R\\ ${this.answer}\\\\
          \\text{Thus}\\medspace ${dividend}\\operatorname{mod}${divisor} = ${this.answer}$`;
        }
        break;
      case "negative":
        if (args.length === 4) {
          let dividend = randomNumberBetween(args[0], args[1]);
          let divisor = randomNumberBetween(args[2], args[3]);
          this.question = `${dividend}\\operatorname{mod}${divisor}`;
          this.answer = dividend.mod(divisor);
          this.work = `$${dividend}+${divisor}\\left(${Math.ceil(Math.abs(dividend)/divisor)}\\right)=${this.answer}$`;
        }
        break;
      case "addition":
        let add_a = randomNumberBetween(args[0], args[1]);
        let add_b = randomNumberBetween(args[2], args[3]);
        let add_c = randomNumberBetween(args[4], args[5]);
        this.question = `\\left(${add_a}+${add_b}\\right)\\operatorname{mod}${add_c}`;
        this.answer = (add_a + add_b).mod(add_c);
        this.work = `$${add_a} \\operatorname{mod} ${add_c} = ${add_a.mod(add_c)}\\\\
                    ${add_b} \\operatorname{mod} ${add_c} = ${add_b.mod(add_c)}\\\\
                    \\left(${add_a.mod(add_c)} + ${add_b.mod(add_c)}\\right)\\operatorname{mod}${add_c}\\\\
                    ${add_a.mod(add_c) + add_b.mod(add_c)}\\operatorname{mod}${add_c} = ${this.answer}$`;
        break;
      case "subtraction":
        let subtract_a = randomNumberBetween(args[0], args[1]);
        let subtract_b = randomNumberBetween(args[2], args[3]);
        let subtract_c = randomNumberBetween(args[4], args[5]);
        if (subtract_a >= subtract_b) {
          this.question = `\\left(${subtract_a}-${subtract_b}\\right)\\operatorname{mod}${subtract_c}`;
          this.answer = (subtract_a - subtract_b).mod(subtract_c);
          this.work = `$${subtract_a} \\operatorname{mod} ${subtract_c} = ${subtract_a.mod(subtract_c)}\\\\
                      ${subtract_b} \\operatorname{mod} ${subtract_c} = ${subtract_b.mod(subtract_c)}\\\\
                      \\left(${subtract_a.mod(subtract_c)} - ${subtract_b.mod(subtract_c)}\\right)\\operatorname{mod}${subtract_c}\\\\
                      ${subtract_a.mod(subtract_c) - subtract_b.mod(subtract_c)}\\operatorname{mod}${subtract_c} = ${this.answer}$`;
        } else {
          this.question = `\\left(${subtract_b}-${subtract_a}\\right)\\operatorname{mod}${subtract_c}`;
          this.answer = (subtract_b - subtract_a).mod(subtract_c);
          this.work = `$${subtract_b} \\operatorname{mod} ${subtract_c} = ${subtract_b.mod(subtract_c)}\\\\
                      ${subtract_a} \\operatorname{mod} ${subtract_c} = ${subtract_a.mod(subtract_c)}\\\\
                      \\left(${subtract_b.mod(subtract_c)} - ${subtract_a.mod(subtract_c)}\\right)\\operatorname{mod}${subtract_c}\\\\
                      ${subtract_b.mod(subtract_c) - subtract_a.mod(subtract_c)}\\operatorname{mod}${subtract_c} = ${this.answer}$`;
        }
        break;
      case "multiplication":
        let multiply_a = randomNumberBetween(args[0], args[1]);
        let multiply_b = randomNumberBetween(args[2], args[3]);
        let multiply_c = randomNumberBetween(args[4], args[5]);
        this.question = `\\left(${multiply_a}\\times${multiply_b}\\right)\\operatorname{mod}${multiply_c}`;
        this.answer = (multiply_a * multiply_b).mod(multiply_c);
        this.work = `$${multiply_a} \\operatorname{mod} ${multiply_c} = ${multiply_a.mod(multiply_c)}\\\\
                    ${multiply_b} \\operatorname{mod} ${multiply_c} = ${multiply_b.mod(multiply_c)}\\\\
                    \\left(${multiply_a.mod(multiply_c)} \\times ${multiply_b.mod(multiply_c)}\\right)\\operatorname{mod}${multiply_c}\\\\
                    ${multiply_a.mod(multiply_c) * multiply_b.mod(multiply_c)}\\operatorname{mod}${multiply_c} = ${this.answer}$`;
        break;
      case "exponentiation":
        let exponentiate_a = randomNumberBetween(args[0], args[1]);
        let exponentiate_b = randomNumberBetween(args[2], args[3]);
        let exponentiate_c = randomNumberBetween(args[4], args[5]);
        let answer = fastModularExponentiation(exponentiate_a, exponentiate_b, exponentiate_c);
        this.question = `${exponentiate_a}^{${exponentiate_b}}\\operatorname{mod}${exponentiate_c}`;
        this.answer = answer.answer;
        this.work = answer.work;
        break;
    }
  }

  regen() {
    return new Question(this.type, this.args);
  }
}

document.addEventListener("DOMContentLoaded", function() {
  //KaTeX rendering on page load:
  renderMathInElement(document.body, {
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

  //Making quick-practice containers functional:
  let quickPracticeQuestionDivs = Array.from(document.getElementsByClassName("quickPracticeQuestion"));
  quickPracticeQuestionDivs.forEach((questionDiv) => {
    let question;
    switch (questionDiv.parentElement.dataset.questionType) {
      case "basic":
        question = new Question("basic", [5, 100, 2, 10]);
        break;
      case "negative":
        question = new Question("negative", [-100, -5, 2, 10]);
        break;
      case "additionOrSubtraction":
        if (Math.random() < 0.5) {
          question = new Question("addition", [10, 100, 10, 100, 2, 10]);
        } else {
          question = new Question("subtraction", [10, 100, 10, 100, 2, 10]);
        }
        break;
      case "multiplication":
        question = new Question("multiplication", [50, 100, 50, 100, 2, 10]);
        break;
      case "exponentiation":
        question = new Question("exponentiation", [5, 10, 10, 120, 5, 15]);
        break;
    }

    questionDiv.innerHTML = katex.renderToString(question.question);
    let answerInput = questionDiv.parentElement.querySelector('.quickPracticeAnswerInput');
    let btnCheckAnswer = questionDiv.parentElement.querySelector('.checkAnswerButton');
    let resultsDiv = questionDiv.parentElement.querySelector('.result');
    btnCheckAnswer.addEventListener("click", function() {
      if (btnCheckAnswer.textContent === "Try Another!") {
        answerInput.value = "";
        resultsDiv.innerHTML = "";
        question = question.regen();
        questionDiv.innerHTML = katex.renderToString(question.question);
        btnCheckAnswer.textContent = "Check";
      } else {
        let inputtedAnswer = parseInt(answerInput.value);
        if (question.answer === inputtedAnswer) {
          resultsDiv.innerHTML += "<h3>Correct, congratulations!</h3>";
        } else {
          resultsDiv.innerHTML += "<h3>Sorry...incorrect!</h3>"
        }
        resultsDiv.innerHTML += `How we did it:`;
        let work = document.createElement("p");
        work.classList.add("quickPracticeWork");
        resultsDiv.appendChild(work);
        work.innerHTML = question.work;
        renderMathInElement(work, {
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
        btnCheckAnswer.textContent = "Try Another!";
        answerInput.value = "";
      }
    });
  });
  
});

//returns a random number between a and b (inclusive)
function randomNumberBetween(a, b) {
  return Math.floor(a + Math.random() * (b - a + 1));
}

//converts a decimal number to binary
function decimalToBinary(num) {
  return num.toString(2);
}

function fastModularExponentiation(base, exponent, divisor) {
  let work = "";
  let answer;
  let exponentInBinary = decimalToBinary(exponent);
  let powersOfTwoNeeded = [];
  let sumInPowersOfTwo = ``;
  let modWithNthPowerOfTwo = new Map();

  for (let i = 0; i < exponentInBinary.length; i++) {
    let power = exponentInBinary.length - i - 1;

    if (exponentInBinary.charAt(i) === "1") {
      powersOfTwoNeeded.push(2 ** power);
    }
  }

  for (let i = 0; i < powersOfTwoNeeded.length; i++) {
    if (i === powersOfTwoNeeded.length - 1) {
      sumInPowersOfTwo += powersOfTwoNeeded[i];
    } else {
      sumInPowersOfTwo += `${powersOfTwoNeeded[i]}+`;
    }
  }
  
  work += `First, we have to break up ${exponent} into powers of 2, or convert it to binary:<br><br>`;
  work += `$${exponent}_{10}=${exponentInBinary}_{2}\\\\$`;
  work += `<br>$${exponent} = ${sumInPowersOfTwo}\\\\$`;
  work += `<br>Now, we have to find $${base}^{n}\\operatorname{mod}${divisor}$ with exponents n that are powers of 2 until we reach $${base}^{${powersOfTwoNeeded[0]}}\\\\$`;
  work += `<br>$${base}\\operatorname{mod}${divisor}=${base.mod(divisor)}\\\\$`;

  let lastMod = base.mod(divisor);
  modWithNthPowerOfTwo.set(1, lastMod);
  
  for (let i = 2; i <= powersOfTwoNeeded[0]; i *= 2) {
    work += `$${base}^{${i}}\\operatorname{mod}${divisor}=\\left(${base}^{${i/2}}\\operatorname{mod}${divisor}\\right)^{2}\\operatorname{mod}${divisor}=${Math.pow(lastMod, 2).mod(divisor)}\\\\$`;
    
    modWithNthPowerOfTwo.set(i, Math.pow(lastMod, 2).mod(divisor));
    lastMod = Math.pow(lastMod, 2).mod(divisor);
  }

  work += "<br>Now, we put it all back together with the modular multiplication property:<br><br>";
  work += `$${base}^{${exponent}}\\operatorname{mod}${divisor}=\\left(`;

  for (let i = 0; i < powersOfTwoNeeded.length; i++) {
    work += `${base}^{${powersOfTwoNeeded[i]}}`;
    if (i !== powersOfTwoNeeded.length - 1) {
      work += '\\cdot';
    }
  }
  
  work += `\\right)\\operatorname{mod}${divisor}\\\\$`;

  work += `$=\\left(`;

  for (let i = 0; i < powersOfTwoNeeded.length; i++) {
    work += `\\left(${base}^{${powersOfTwoNeeded[i]}}\\operatorname{mod}${divisor}\\right)`;
    if (i !== powersOfTwoNeeded.length - 1) {
      work += '\\cdot';
    }
  }
  
  work += `\\right)\\operatorname{mod}${divisor}\\\\$`;

  work += `<br>Now, we substitute in the values that we found earlier:<br><br>`;

  work += `$=\\left(`;

  let product = 1;
  
  for (let i = 0; i < powersOfTwoNeeded.length; i++) {
    work += modWithNthPowerOfTwo.get(powersOfTwoNeeded[i]);
    product *= modWithNthPowerOfTwo.get(powersOfTwoNeeded[i]);
    if (i !== powersOfTwoNeeded.length - 1) {
      work += '\\cdot';
    }
  }

  work += `\\right)\\operatorname{mod}${divisor}\\\\=${product}\\operatorname{mod}${divisor}\\\\=${product.mod(divisor)}\\\\$<br>`;
  
  answer = product.mod(divisor);

  work += `Thus, the answer is <strong>${answer}</strong>`;
  
  return {
    work: work, 
    answer: answer
  };
}


//practice modular addition code:
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

//defining question type for each level of the game
function generateQuestion(level) {
  switch (level) {
    case 1:
      return new Question("basic", [5, 100, 2, 10]);
    case 2: 
      return new Question("negative", [-100, -5, 2, 10]);
    case 3:
      return new Question("addition", [10, 100, 10, 100, 2, 10]);
    case 4:
      return new Question("addition", [100, 500, 100, 500, 5, 20]);
    case 5:
      return new Question("subtraction", [10, 100, 10, 100, 2, 10]);
    case 6:
      return new Question("subtraction", [100, 500, 100, 500, 5, 20]);
    case 7:
      return new Question("multiplication", [50, 100, 50, 100, 2, 10]);
    case 8: 
      return new Question("multiplication", [50, 200, 50, 200, 5, 20]);
    case 9:
      return new Question("exponentiation", [5, 10, 10, 120, 5, 10]);
    case 10:
      return new Question("exponentiation", [3, 20, 50, 200, 10, 25]);
  }
}

//defining how much time user will have at each level
//format is level: time (seconds)
let levelTime = {
  1: 8,
  2: 15,
  3: 20,
  4: 25,
  5: 20,
  6: 25,
  7: 20,
  8: 30,
  9: 60,
  10: 120
}

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
  socket.emit("getTopicPracticeStats", token, "modular-arithmetic");
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
          socket.emit("updateTopicPracticeStats", token, "modular-arithmetic", userStats.level);
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
            socket.emit("updateTopicPracticeStats", token, "modular-arithmetic", userStats.level);
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
