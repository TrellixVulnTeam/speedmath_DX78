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
          this.work = `${dividend} \\div ${divisor}=${Math.floor(dividend/divisor)}\\ R\\ ${this.answer}\\\\
          \\text{Thus}\\medspace ${dividend}\\operatorname{mod}${divisor} = ${this.answer}`;
        }
        break;
      case "negative":
        if (args.length === 4) {
          let dividend = randomNumberBetween(args[0], args[1]);
          let divisor = randomNumberBetween(args[2], args[3]);
          this.question = `${dividend}\\operatorname{mod}${divisor}`;
          this.answer = dividend.mod(divisor);
          this.work = ``;
        }
        break;
      case "addition":
        let add_a = randomNumberBetween(args[0], args[1]);
        let add_b = randomNumberBetween(args[2], args[3]);
        let add_c = randomNumberBetween(args[4], args[5]);
        this.question = `\\left(${add_a}+${add_b}\\right)\\operatorname{mod}${add_c}`;
        this.answer = (add_a + add_b).mod(add_c);
        this.work = `${add_a} \\operatorname{mod} ${add_c} = ${add_a.mod(add_c)}\\\\
                    ${add_b} \\operatorname{mod} ${add_c} = ${add_b.mod(add_c)}\\\\
                    \\left(${add_a.mod(add_c)} + ${add_b.mod(add_c)}\\right)\\operatorname{mod}${add_c}\\\\
                    ${add_a.mod(add_c) + add_b.mod(add_c)}\\operatorname{mod}${add_c} = ${this.answer}`;
        break;
      case "subtraction":
        let subtract_a = randomNumberBetween(args[0], args[1]);
        let subtract_b = randomNumberBetween(args[2], args[3]);
        let subtract_c = randomNumberBetween(args[4], args[5]);
        if (subtract_a >= subtract_b) {
          this.question = `\\left(${subtract_a}-${subtract_b}\\right)\\operatorname{mod}${subtract_c}`;
          this.answer = (subtract_a - subtract_b).mod(subtract_c);
          this.work = `${subtract_a} \\operatorname{mod} ${subtract_c} = ${subtract_a.mod(subtract_c)}\\\\
                      ${subtract_b} \\operatorname{mod} ${subtract_c} = ${subtract_b.mod(subtract_c)}\\\\
                      \\left(${subtract_a.mod(subtract_c)} - ${subtract_b.mod(subtract_c)}\\right)\\operatorname{mod}${subtract_c}\\\\
                      ${subtract_a.mod(subtract_c) - subtract_b.mod(subtract_c)}\\operatorname{mod}${subtract_c} = ${this.answer}`;
        } else {
          this.question = `\\left(${subtract_b}-${subtract_a}\\right)\\operatorname{mod}${subtract_c}`;
          this.answer = (subtract_b - subtract_a).mod(subtract_c);
          this.work = `${subtract_b} \\operatorname{mod} ${subtract_c} = ${subtract_b.mod(subtract_c)}\\\\
                      ${subtract_a} \\operatorname{mod} ${subtract_c} = ${subtract_a.mod(subtract_c)}\\\\
                      \\left(${subtract_b.mod(subtract_c)} - ${subtract_a.mod(subtract_c)}\\right)\\operatorname{mod}${subtract_c}\\\\
                      ${subtract_b.mod(subtract_c) - subtract_a.mod(subtract_c)}\\operatorname{mod}${subtract_c} = ${this.answer}`;
        }
        break;
      case "multiplication":
        let multiply_a = randomNumberBetween(args[0], args[1]);
        let multiply_b = randomNumberBetween(args[2], args[3]);
        let multiply_c = randomNumberBetween(args[4], args[5]);
        this.question = `\\left(${multiply_a}\\times${multiply_b}\\right)\\operatorname{mod}${multiply_c}`;
        this.answer = (multiply_a * multiply_b).mod(multiply_c);
        this.work = `${multiply_a} \\operatorname{mod} ${multiply_c} = ${multiply_a.mod(multiply_c)}\\\\
                    ${multiply_b} \\operatorname{mod} ${multiply_c} = ${multiply_b.mod(multiply_c)}\\\\
                    \\left(${multiply_a.mod(multiply_c)} \\times ${multiply_b.mod(multiply_c)}\\right)\\operatorname{mod}${multiply_c}\\\\
                    ${multiply_a.mod(multiply_c) * multiply_b.mod(multiply_c)}\\operatorname{mod}${multiply_c} = ${this.answer}`;
        break;
      case "exponentiation":
        let exponentiate_a = randomNumberBetween(args[0], args[1]);
        let exponentiate_b = randomNumberBetween(args[2], args[3]);
        let exponentiate_c = randomNumberBetween(args[4], args[5]);
        this.question = `${exponentiate_a}^{${exponentiate_b}}\\operatorname{mod}${exponentiate_c}`;
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
        question = new Question("additionOrSubtraction", [10, 100, 10, 100, 2, 10])
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
        question = new Question("exponentiation", [5, 10, 10, 100, 5, 15]);
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
        resultsDiv.appendChild(work);
        work.innerHTML = katex.renderToString(question.work);
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