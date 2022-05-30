var socket = io();

let formContainer = document.getElementById("formContainer");
let profileContainer = document.getElementById("profileContainer"); 
let loginForm = document.getElementById("loginForm");
let signUpForm = document.getElementById("signUpForm");
let usernameLogin = document.getElementById("usernameLogin");
let passwordLogin = document.getElementById("passwordLogin");
let rememberMe = document.getElementById("rememberMe");
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

  socket.emit("login", usernameLogin.value, passwordLogin.value, rememberMe.checked);
  loginForm.reset();
});

signUpForm.addEventListener("submit", function(e) {
  e.preventDefault();

  if (passwordSignUp.value === confirmPassword.value) {
    socket.emit("signUp", usernameSignUp.value, passwordSignUp.value, displayName.value, email.value || null);
    signUpForm.reset();
  } else {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Your password does not match your confirmed password. Please correctly re-input the confirmed password.'
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

/*
logDB.addEventListener("click", function() {
  socket.emit("logDB");
});
*/

function switchToUserInfoContainer() {
  formContainer.style.display = "none";
  profileContainer.style.display = "block";
}

socket.on("successfullySignedUp", () => {
  if (localStorage.getItem("theme") === "dark") {
    Swal.fire({
      icon: "success",
      title: "Successfully Signed Up!",
      text: "Log in to begin playing! 👍",
      confirmButtonText: "Log in",
      iconColor: themeSettings.contentTextColor.dark,
      background: themeSettings.contentBackgroundColor.dark,
      color: themeSettings.contentTextColor.dark
    }).then(() => {
      btnSwitchToLoginForm.click();
    }); 
  } else if (localStorage.getItem("theme") === "light") {
    Swal.fire({
      icon: "success",
      title: "Successfully Signed Up!",
      text: "Log in to begin playing! 👍",
      confirmButtonText: "Log in",
      iconColor: themeSettings.contentTextColor.light,
      background: themeSettings.contentBackgroundColor.light,
      color: themeSettings.contentTextColor.light
    }).then(() => {
      btnSwitchToLoginForm.click();
    }); 
  }
});

socket.on("error", (errorTitle, errorMessage) => {
  if (localStorage.getItem("theme") === "dark") {
    Swal.fire({
      title: errorTitle,
      text: errorMessage,
      icon: "error",
      iconColor: themeSettings.contentTextColor.dark,
      background: themeSettings.contentBackgroundColor.dark,
      color: themeSettings.contentTextColor.dark
    });
  } else if (localStorage.getItem("theme") === "light") {
    Swal.fire({
      title: errorTitle,
      text: errorMessage,
      icon: "error",
      iconColor: themeSettings.contentTextColor.light,
      background: themeSettings.contentBackgroundColor.light,
      color: themeSettings.contentTextColor.light
    });
  }
});

socket.on("successfulLogin", (token) => {
  localStorage.setItem("token", token);

  if (localStorage.getItem("theme") === "dark") {
    Swal.fire({
      icon: "success",
      title: "Successfully Logged In!",
      text: "Enjoy our website!",
      confirmButtonText: "Continue",
      iconColor: themeSettings.contentTextColor.dark,
      background: themeSettings.contentBackgroundColor.dark,
      color: themeSettings.contentTextColor.dark
    }).then(() => {
      switchToUserInfoContainer();
    }); 
  } else if (localStorage.getItem("theme") === "light") {
    Swal.fire({
      icon: "success",
      title: "Successfully Logged In!",
      text: "Enjoy our website!",
      confirmButtonText: "Continue",
      iconColor: themeSettings.contentTextColor.light,
      background: themeSettings.contentBackgroundColor.light,
      color: themeSettings.contentTextColor.light
    }).then(() => {
      switchToUserInfoContainer();
    }); 
  }
});