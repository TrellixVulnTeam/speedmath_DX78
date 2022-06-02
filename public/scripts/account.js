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

  socket.emit("login", usernameLogin.value.toLowerCase(), passwordLogin.value, rememberMe.checked);
  loginForm.reset();
});

signUpForm.addEventListener("submit", function(e) {
  e.preventDefault();

  if (passwordSignUp.value === confirmPassword.value) {
    socket.emit("signUp", usernameSignUp.value.toLowerCase(), passwordSignUp.value, displayName.value, email.value || null);
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

function switchToFormsContainer() {
  formContainer.style.display = "flex";
  profileContainer.style.display = "none";
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

socket.on("successfulLogin", (token, remember) => {
  if (remember) {
    localStorage.setItem("token", token);
  } else {
    sessionStorage.setItem("token", token);
  }

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
      location.reload();
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
      location.reload();
    }); 
  }
});

window.onload = function() {
  let token = localStorage.getItem("token") || sessionStorage.getItem("token");
  
  if (token === null) {
    switchToFormsContainer();
  } else {
    socket.emit("getOwnProfileInfo", token);
  }
}

socket.on("ownProfileInfo", (info, friendsInfo) => {
  profileContainer.style.display = "block";

  if (info.profile_picture === "defaultAvatar") {
    document.getElementById("profilePicture").src = "/assets/defaultAvatar.png";
  }

  document.getElementById("profileInfoUsername").textContent = ("@" + info.username);
  document.getElementById("profileInfoDisplayName").textContent = info.display_name;

  if (info.email == null) {
    document.getElementById("profileInfoEmail").textContent = "You didn't provide an email address.";
  } else {
    document.getElementById("profileInfoEmail").textContent = info.email; 
  }

  if (info.bio == "") {
    document.getElementById("profileInfoBio").innerHTML = `<a id="changeBio" style="font-size:1.1em;text-decoration:underline;cursor:pointer;">Add bio</a>`;
  } else {
    document.getElementById("profileInfoBio").textContent = info.bio;
    document.getElementById("profileInfoBio").innerHTML += `<br><br><a id="changeBio" style="font-size:1.1em;text-decoration:underline;cursor:pointer;">Update bio</a>`
  }

  document.getElementById("basicInfoContainer").innerHTML += `<b><a href="/user/${info.username}" style="font-size:1.5em;">View Public Profile</a><b>`

  if (friendsInfo.friends.length == 0) {
    document.getElementById("friendsContainer").innerHTML += "<h4>You have no friends.</h4>"
  } else {
    //nobody using this website has friends, so we don't need to code this part
  }

  if (friendsInfo.incoming_friend_requests.length == 0) {
    document.getElementById("incomingFriendRequestsContainer").innerHTML += "<h4>You have no incoming friend requests.</h4>"
  } else {
    //nobody using this website has friends, so we don't need to code this part
  }

  if (friendsInfo.outgoing_friend_requests.length == 0) {
    document.getElementById("outgoingFriendRequestsContainer").innerHTML += "<h4>You have no outgoing friend requests.</h4>"
  } else {
    //nobody using this website has friends, so we don't need to code this part
  }

  document.getElementById("changeBio").addEventListener("click", async function() {
    if (localStorage.getItem("theme") === "dark") {
      let { value: newBio } = await Swal.fire({
        title: "Enter your new bio",
        input: "text",
        inputLabel: "Bio:",
        showCancelButton: true,
        inputValidator: (value) => {
          if (!value) {
            return "Your new bio can't be empty."
          }
        },
        background: themeSettings.contentBackgroundColor.dark,
        color: themeSettings.contentTextColor.dark
      }); 

      if (newBio) {
        let token = localStorage.getItem("token") || sessionStorage.getItem("token");
        socket.emit("updateBio", token, newBio);
      }
    } else if (localStorage.getItem("theme") === "light") {
      let { value: newBio } = await Swal.fire({
        title: "Enter your new bio",
        input: "text",
        inputLabel: "Bio:",
        showCancelButton: true,
        inputValidator: (value) => {
          if (!value) {
            return "Your new bio can't be empty."
          }
        },
        background: themeSettings.contentBackgroundColor.light,
        color: themeSettings.contentTextColor.light
      }); 

      if (newBio) {
        let token = localStorage.getItem("token") || sessionStorage.getItem("token");
        socket.emit("updateBio", token, newBio);
      }
    }
  });
});

socket.on("successfullyUpdatedBio", () => {
  location.reload();
});