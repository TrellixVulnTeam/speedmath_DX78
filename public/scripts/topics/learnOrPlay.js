/* 

To handle URL parameters "learn" or "play" 
ex. 
https://speedmath.ml/topics/addition?learn
vs
https://speedmath.ml/topics/addition?play

*/

let learnOrPracticeContainer = document.getElementById("learnOrPracticeContainer");
let learnContainer = document.getElementById("learnContainer");
let practiceContainer = document.getElementById("practiceContainer");
let btnLearn = document.getElementById("btnLearn");
let btnPractice = document.getElementById("btnPractice");

btnLearn.addEventListener("click", function() {
  learnOrPracticeContainer.style.display = "none";
  learnContainer.style.display = "block";
});

btnPractice.addEventListener("click", function() {
  learnOrPracticeContainer.style.display = "none";
  practiceContainer.style.display = "block";
})

let urlParams = new URLSearchParams(window.location.search);

if (urlParams.has("learn")) {
  btnLearn.click();
} else if (urlParams.has("play")) {
  btnPractice.click();
} else {
  learnOrPracticeContainer.style.display = "block";
}