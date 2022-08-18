var socket = io();

let queryString = window.location.search;
let urlParams = new URLSearchParams(queryString);

let formContainer = document.getElementById("formContainer");
let newPasswordFormContainer = document.getElementById("newPasswordFormContainer");
let invalidTokenContainer = document.getElementById("invalidTokenContainer");
let successfullyChangedPasswordContainer = document.getElementById("successfullyChangedPassword");
let sentAnEmailDiv = document.getElementById("sentAnEmailContainer");
let resetPasswordForm = document.getElementById("resetPasswordForm");
let newPasswordForm = document.getElementById("newPasswordForm");
let emailInput = document.getElementById("email");
let password = document.getElementById("password");
let confirmPassword = document.getElementById("confirmPassword");

if (urlParams.has("token")) {
  socket.emit("requestPasswordResetForm", urlParams.get("token"));
} else {
  formContainer.style.display = "block";
}

resetPasswordForm.addEventListener("submit", function(e) {
  e.preventDefault();

  socket.emit("requestPasswordResetEmail", emailInput.value);
  
  resetPasswordForm.reset();
});

newPasswordForm.addEventListener("submit", function(e) {
  e.preventDefault();

  if (password.value === confirmPassword.value) {
    socket.emit("updatePassword", password.value, urlParams.get("token"));
    newPasswordForm.reset();
    newPasswordFormContainer.style.display = "none";
  } else {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Your password does not match your confirmed password. Please correctly re-input the confirmed password.',
      iconColor: themeSettings.contentTextColor[localStorage.getItem("theme")],
      background: themeSettings.contentBackgroundColor[localStorage.getItem("theme")],
      color: themeSettings.contentTextColor[localStorage.getItem("theme")]
    });
  }
});

socket.on("sentPasswordResetEmail", function() {
  formContainer.style.display = "none";
  sentAnEmailDiv.style.display = "block";
});

socket.on("invalidPasswordResetToken", function() {
  invalidTokenContainer.style.display = "block";
});

socket.on("showNewPasswordForm", function() {
  newPasswordFormContainer.style.display = "block";
});

socket.on("successfullyChangedPassword", function() {
  localStorage.removeItem("token");
  sessionStorage.removeItem("token");
  successfullyChangedPasswordContainer.style.display = "block";
});

//general error alert
socket.on("error", (errorTitle, errorMessage) => {
  Swal.fire({
    title: errorTitle,
    text: errorMessage,
    icon: "error",
    iconColor: themeSettings.contentTextColor[localStorage.getItem("theme")],
    background: themeSettings.contentBackgroundColor[localStorage.getItem("theme")],
    color: themeSettings.contentTextColor[localStorage.getItem("theme")]
  });
});