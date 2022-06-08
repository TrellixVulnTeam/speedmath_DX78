/* 

To handle URL parameters "learn" or "play" 
ex. 
https://speedmath.ml/topics/addition?learn
vs
https://speedmath.ml/topics/addition?play


And to give a warning when on the practice pages that the user's progress won't be saved if they're not logged in
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

  let token = localStorage.getItem("token") || sessionStorage.getItem("token");
  
  if (token === null) {
    if (localStorage.getItem("theme") === "dark") {
      Swal.fire({
        icon: "warning",
        title: "You are not logged in.",
        text: "Please log in or create an account on the accounts page to save your progress. You can play as a guest user, but your progress won't be saved and you won't be able to collect achievements.",
        confirmButtonText: "OK",
        iconColor: themeSettings.contentTextColor.dark,
        background: themeSettings.contentBackgroundColor.dark,
        color: themeSettings.contentTextColor.dark
      });
    } else if (localStorage.getItem("theme") === "light") {
      Swal.fire({
        icon: "warning",
        title: "You are not logged in.",
        text: "Please log in or create an account on the accounts page to save your progress. You can play as a guest user, but your progress won't be saved and you won't be able to collect achievements.",
        confirmButtonText: "OK",
        iconColor: themeSettings.contentTextColor.light,
        background: themeSettings.contentBackgroundColor.light,
        color: themeSettings.contentTextColor.light
      });
    }
  }
})

let urlParams = new URLSearchParams(window.location.search);

if (urlParams.has("learn")) {
  btnLearn.click();
} else if (urlParams.has("play")) {
  btnPractice.click();
} else {
  learnOrPracticeContainer.style.display = "block";
}