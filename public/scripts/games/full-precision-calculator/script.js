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

let inputX = document.getElementById("inputX");
let inputY = document.getElementById("inputY");
let result = document.getElementById("result");
let add = document.getElementById("add");
let subtract = document.getElementById("subtract");
let multiply = document.getElementById("multiply");
let divide = document.getElementById("divide");
let exponentiate = document.getElementById("exponentiate");
let factorial = document.getElementById("factorial");
let btnDownload = document.getElementById("downloadResultAsTxt");
let answerToX = document.getElementById("answerToX");
let answerToY = document.getElementById("answerToY");

add.addEventListener("click", function() {
  let x = BigInt(inputX.value);
  let y = BigInt(inputY.value);
  result.textContent = x + y;
  showResultsDivButtons();
});

subtract.addEventListener("click", function() {
  let x = BigInt(inputX.value);
  let y = BigInt(inputY.value);
  result.textContent = x - y;
  showResultsDivButtons();
});

multiply.addEventListener("click", function() {
  let x = BigInt(inputX.value);
  let y = BigInt(inputY.value);
  result.textContent = x * y;
  showResultsDivButtons();
});

exponentiate.addEventListener("click", function() {
  let x = BigInt(inputX.value);
  let y = BigInt(inputY.value);
  result.textContent = x ** y;
  showResultsDivButtons();
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

// helper functions:

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
  inputX.value = "";
  inputY.value = "";
}

function SwalError(errorTitle, errorMessage) {
  Swal.fire({
    title: errorTitle,
    text: errorMessage,
    icon: "error",
    iconColor: themeSettings.contentTextColor[localStorage.getItem("theme")],
    background: themeSettings.contentBackgroundColor[localStorage.getItem("theme")],
    color: themeSettings.contentTextColor[localStorage.getItem("theme")]
  });
}