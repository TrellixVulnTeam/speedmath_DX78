//KaTeX auto-render:
document.addEventListener("DOMContentLoaded", function() {
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
      throwOnError : false
    });
});

BigInt.prototype.mod = function(n) {
  return ((this%n)+n)%n;
}

class BigDecimal {
  constructor(string) {
    if (string.includes(".")) {
      this.decimalPlaces = string.length - string.indexOf(".") - 1;
    } else {
      this.decimalPlaces = 0;
    }
    this.bigintRepresentation = BigInt(string.replace('.', ''));
    this.bigdecRepresentation = string;
  }

  add(bigdec) {
    if (this.decimalPlaces > bigdec.decimalPlaces) {
      let difference = this.decimalPlaces - bigdec.decimalPlaces;
      return new BigDecimal(BigDecimal.bigIntRepToBigDec(this.bigintRepresentation + (bigdec.bigintRepresentation * (10n ** BigInt(difference))), this.decimalPlaces));
    } else {
      let difference = bigdec.decimalPlaces - this.decimalPlaces;
      return new BigDecimal(BigDecimal.bigIntRepToBigDec(bigdec.bigintRepresentation + (this.bigintRepresentation * (10n ** BigInt(difference))), bigdec.decimalPlaces));
    }
  }

  subtract(bigdec) {
    let negativeOne = new BigDecimal("-1");
    return this.add(negativeOne.multiply(bigdec));
  }

  multiply(bigdec) {
    let totalDecimalPlaces = this.decimalPlaces + bigdec.decimalPlaces;
    return new BigDecimal(BigDecimal.bigIntRepToBigDec((this.bigintRepresentation * bigdec.bigintRepresentation), totalDecimalPlaces));
  }

  divide(bigdec, precision) {
    
  }

  exponentiate(bigdec) {
    
  }

  //only supports positive whole numbers for now...
  factorial(precision) {
    let num = this.bigintRepresentation;
    let ans = 1n;

    while (num > 1n) {
      ans *= num;
      num--;
    }
    
    return new BigDecimal(BigDecimal.bigIntRepToBigDec(ans, precision));
  }

  //static function to remove trailing zeros and/or the decimal point if there's nothing after it:
  //ex. 4.58400 => 4.584
  //ex. 10.0 => 10
  static removeTrailingZeros(string) {
    if (string.includes(".")) {
      while (string.charAt(string.length - 1) === "0") {
        string = string.slice(0, -1);
      }

      if (string.charAt(string.length - 1) === ".") {
        string = string.slice(0, -1);
      }
    }
    
    return string;
  }

  //static function to convert a bigint representation of a bigdec object to a bigdec string. parameters are bigint representation and decimal places that should be in the bigdec string
  static bigIntRepToBigDec(bigint, decPlaces) {
    let bigIntString = bigint.toString();
    let index = bigIntString.length - decPlaces;
    let bigDecString = bigIntString.slice(0, index) + "." + bigIntString.slice(index);
    return BigDecimal.removeTrailingZeros(bigDecString);
  }

  toString() {
    return this.bigdecRepresentation;
  }
}

let inputX = document.getElementById("inputX");
let inputY = document.getElementById("inputY");
let precision = document.getElementById("precision");
let result = document.getElementById("result");
let add = document.getElementById("add");
let subtract = document.getElementById("subtract");
let multiply = document.getElementById("multiply");
let divide = document.getElementById("divide");
let mod = document.getElementById("mod");
let exponentiate = document.getElementById("exponentiate");
let factorial = document.getElementById("factorial");
let btnDownload = document.getElementById("downloadResultAsTxt");
let answerToX = document.getElementById("answerToX");
let answerToY = document.getElementById("answerToY");
let reset = document.getElementById("reset");

add.addEventListener("click", function() {
  if (inputValueExists(inputX) && inputValueExists(inputY)) {
    if (inputsAreDecimal()) {
      let x = new BigDecimal(inputX.value);
      let y = new BigDecimal(inputY.value);
      result.textContent = x.add(y);
      showResultsDivButtons();
    } else {
      let x = BigInt(inputX.value);
      let y = BigInt(inputY.value);
      result.textContent = x + y;
      showResultsDivButtons();
    }
  } else {
    SwalError("Input(s) missing", "Two inputs (x and y) are needed for this operation, since you are trying to add two numbers.");
  }
});

subtract.addEventListener("click", function() {
  if (inputValueExists(inputX) && inputValueExists(inputY)) {
    if (inputsAreDecimal()) {
      let x = new BigDecimal(inputX.value);
      let y = new BigDecimal(inputY.value);
      result.textContent = x.subtract(y);
      showResultsDivButtons();
    } else {
      let x = BigInt(inputX.value);
      let y = BigInt(inputY.value);
      result.textContent = x - y;
      showResultsDivButtons();
    }
  } else {
    SwalError("Input(s) missing", "Two inputs (x and y) are needed for this operation, since you are trying to subtract two numbers.");
  }
});

multiply.addEventListener("click", function() {
  if (inputValueExists(inputX) && inputValueExists(inputY)) {
    if (inputsAreDecimal()) {
      let x = new BigDecimal(inputX.value);
      let y = new BigDecimal(inputY.value);
      result.textContent = x.multiply(y);
      showResultsDivButtons();
    } else {
      let x = BigInt(inputX.value);
      let y = BigInt(inputY.value);
      result.textContent = x * y;
      showResultsDivButtons();
    }
  } else {
    SwalError("Input(s) missing", "Two inputs (x and y) are needed for this operation, since you are trying to multiply two numbers.");
  }
});

divide.addEventListener("click", function() {
  let x = new BigDecimal(inputX.value);
  let y = new BigDecimal(inputY.value);

  SwalError("Under Development", "Sorry");
});

mod.addEventListener("click", function() {
  if (inputValueExists(inputX) && inputValueExists(inputY)) {
    if (inputsAreDecimal()) {
      SwalError("Inputs must be integers.")
    } else {
      let x = BigInt(inputX.value);
      let y = BigInt(inputY.value);
      result.textContent = x.mod(y);
      showResultsDivButtons();
    }
  }
});

exponentiate.addEventListener("click", function() {
  let x = BigInt(inputX.value);
  let y = BigInt(inputY.value);
  result.textContent = x ** y;
  showResultsDivButtons();
});

factorial.addEventListener("click", function() {
  if (inputValueExists(inputX)) {
    if (inputX.value.includes(".") || inputX.value.charAt(0) === "-") {
      SwalError("Positive whole numbers > 0 only please!", 'We will implement the <a href="https://en.wikipedia.org/wiki/Gamma_function">Gamma Function</a> to allow users to find factorials of decimal numbers and negative numbers in the future, but now please enter a positive whole number for x.');
    } else {
      let x = new BigDecimal(inputX.value);
      result.textContent = x.factorial(0);
      showResultsDivButtons();
    }
  } else {
    SwalError("Input missing", "You need an input x for this operation.");
  }
});

btnDownload.addEventListener("click", function() {
  download("result.txt", result.textContent);
});

answerToX.addEventListener("click", function() {
  inputX.value = result.textContent;
});

answerToY.addEventListener("click", function() {
  inputY.value = result.textContent;
});

reset.addEventListener("click", function() {
  btnDownload.style.display = "none";
  document.getElementById("moveResultToInput").style.display = "none";
  inputX.value = "";
  inputY.value = "";
  result.textContent = "";
});

// helper functions:

//parameter "input" is an Element object
function inputValueExists(input) {
  if (input.value) {
    return true;
  } else {
    return false;
  }
}

//check if at least one of the inputs is a decimal
function inputsAreDecimal() {
  if (inputX.value.includes(".") || inputY.value.includes(".")) {
    return true;
  } else {
    return false;
  }
}

function download(filename, text) {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

function showResultsDivButtons() {
  btnDownload.style.display = "block";
  document.getElementById("moveResultToInput").style.display = "block";
}

function SwalError(errorTitle, errorMessage) {
  Swal.fire({
    title: errorTitle,
    html: errorMessage,
    icon: "error",
    iconColor: themeSettings.contentTextColor[localStorage.getItem("theme")],
    background: themeSettings.contentBackgroundColor[localStorage.getItem("theme")],
    color: themeSettings.contentTextColor[localStorage.getItem("theme")]
  });
}