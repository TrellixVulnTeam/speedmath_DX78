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
let email = document.getElementById("email");

loginForm.addEventListener("submit", function(e) {
  e.preventDefault();

  socket.emit("login", usernameLogin.value, passwordLogin.value);
  loginForm.reset();
});

signUpForm.addEventListener("submit", function(e) {
  e.preventDefault();

  if (passwordSignUp.value === confirmPassword.value) {
    socket.emit("signUp", usernameSignUp.value, passwordSignUp.value, displayName.value, email.value);
    signUpForm.reset();
  } else {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Please make sure that your password and confirm passwords match?? that sounds weird + i cant grammar rn someone fix this later'
    });
  }
});

btnSwitchToSignUpForm.addEventListener("click", function(e) {
  loginForm.style.display = "none";
  signUpForm.style.display = "block";
});

btnSwitchToLoginForm.addEventListener("click", function() {
  signUpForm.style.display = "none";
  loginForm.style.display = "block";
});

logDB.addEventListener("click", function() {
  socket.emit("logDB");
});