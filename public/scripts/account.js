var socket = io();

let loginForm = document.getElementById("loginForm");
let signUpForm = document.getElementById("signUpForm");
let usernameLogin = document.getElementById("usernameLogin");
let passwordLogin = document.getElementById("passwordLogin");
let btnLogin = document.getElementById("login");
let btnSwitchToSignUpForm = document.getElementById("btnSwitchToSignUpForm");
let usernameSignUp = document.getElementById("usernameSignUp");
let displayName = document.getElementById("displayName");
let passwordSignUp = document.getElementById("passwordSignUp");
let confirmPassword = document.getElementById("confirmPassword");
let btnSignUp = document.getElementById("signUp");
let btnSwitchToLoginForm = document.getElementById("btnSwitchToLoginForm");

loginForm.addEventListener("submit", function(e) {
  e.preventDefault();

  let username = usernameLogin.value.replace(/\s/g, "");
  let password = passwordLogin.value.replace(/\s/g, "");

  socket.emit("login", username, password);
});

signUpForm.addEventListener("submit", function(e) {
  e.preventDefault();

  let username = usernameSignUp.value.replace(/\s/g, "");
  let password = passwordSignUp.value.replace(/\s/g, "");
  
});

btnSwitchToSignUpForm.addEventListener("click", function(e) {
  loginForm.style.display = "none";
  signUpForm.style.display = "block";
});

btnSwitchToLoginForm.addEventListener("click", function() {
  signUpForm.style.display = "none";
  loginForm.style.display = "block";
});