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

//check if user is logged in when the page loads, if they are, show them the account settings div, if not, show them the login/signup div
window.onload = function() {
  let token = localStorage.getItem("token") || sessionStorage.getItem("token");
  
  if (token === null) {
    switchToFormsContainer();
  } else {
    socket.emit("getOwnProfileInfo", token);
  }
}

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

socket.on("ownProfileInfo", (info) => {
  profileContainer.style.display = "block";

  if (info.profile_picture === "defaultAvatar") {
    document.getElementById("profilePicture").src = "/assets/defaultAvatar.png";
  } else {
    document.getElementById("profilePicture").src = info.profile_picture;
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

  document.getElementById("basicInfoContainer").innerHTML += `<b><a href="/user/${info.username}" style="font-size:1.5em;">View Public Profile</a><b>`;
  if (info.public_account == "true") {
    document.getElementById("basicInfoContainer").innerHTML += `<br>Your account is <b>public</b>`;
  } else {
    document.getElementById("basicInfoContainer").innerHTML += `<br>Your account is <b>private</b>`;
  }

  if (JSON.parse(info.friends).length == 0) {
    document.getElementById("friendsContainer").innerHTML += "<h4>You have no friends.</h4>"
  } else {
    //nobody using this website has friends, so we don't need to code this part
  }

  if (JSON.parse(info.incoming_friend_requests).length == 0) {
    document.getElementById("incomingFriendRequestsContainer").innerHTML += "<h4>You have no incoming friend requests.</h4>"
  } else {
    //nobody using this website has friends, so we don't need to code this part
  }

  if (JSON.parse(info.outgoing_friend_requests).length == 0) {
    document.getElementById("outgoingFriendRequestsContainer").innerHTML += "<h4>You have no outgoing friend requests.</h4>"
  } else {
    //nobody using this website has friends, so we don't need to code this part
  }

  // Achievement Badges:
  
  let achievements = info.achievements.split(","); //get an array of achievements that the user has

  achievements.forEach(achievement => {
    let img = document.createElement("img");
    img.classList.add("achievement"); //style this class in /css/accounts.css
    img.src = `/assets/achievements/${achievement}.png`;
    document.getElementById("allBadges").appendChild(img);

    img.addEventListener("click", function() {
      let token = localStorage.getItem("token") || sessionStorage.getItem("token");
      socket.emit("updatePubliclyDisplayedAchievements", token, "add", achievement);
    });
  });

  // Public Achievement Badges:

  let publicly_displayed_achievements = info.publicly_displayed_achievements.split(",");

  publicly_displayed_achievements.forEach(publiclyDisplayedAchievement => {
    if (publiclyDisplayedAchievement !== '') {
      let img = document.createElement("img");
      img.classList.add("achievement");
      img.src = `/assets/achievements/${publiclyDisplayedAchievement}.png`;
      document.getElementById("publicBadges").appendChild(img);
  
      img.addEventListener("click", function() {
        let token = localStorage.getItem("token") || sessionStorage.getItem("token");
        socket.emit("updatePubliclyDisplayedAchievements", token, "remove", publiclyDisplayedAchievement);
      });
    }
  });

  //Buttons to change account settings:

  document.getElementById("changeBio").addEventListener("click", async function() {
    if (localStorage.getItem("theme") === "dark") {
      let { value: newBio } = await Swal.fire({
        title: "Enter your new bio",
        input: "textarea",
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
        input: "textarea",
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

  document.getElementById("profilePicture").addEventListener("click", async function() {
    if (localStorage.getItem("theme") === "dark") {
      let { value: pfp } = await Swal.fire({
        title: "Upload your new profile picture",
        input: "file",
        showCancelButton: true,
        inputLabel: "By uploading an image, you are agreeing that you have the rights to that image. No NSFW profile pictures allowed (exceptions are made for Ling and KiteFlyer).",
        inputValidator: (pfp) => {
          if (!pfp) {
            return `You have to upload a picture!`
          }
        },
        inputAttributes: {
          'accept': 'image/*'
        },
        background: themeSettings.contentBackgroundColor.dark,
        color: themeSettings.contentTextColor.dark
      });
  
      if (pfp) {
        let reader = new FileReader();
        reader.readAsDataURL(pfp);
        reader.onload = function() {
          let token = localStorage.getItem("token") || sessionStorage.getItem("token");
          socket.emit("updatePfp", token, reader.result);
        }
      }
    } else if (localStorage.getItem("theme") === "light") {
      let { value: pfp } = await Swal.fire({
        title: "Upload your new profile picture",
        input: "file",
        showCancelButton: true,
        inputLabel: "By uploading an image, you are agreeing that you have the rights to that image. No NSFW profile pictures allowed (exceptions are made for Ling and KiteFlyer).",
        inputValidator: (pfp) => {
          if (!pfp) {
            return `You have to upload a picture!`
          }
        },
        inputAttributes: {
          'accept': 'image/*'
        },
        background: themeSettings.contentBackgroundColor.light,
        color: themeSettings.contentTextColor.light
      });
  
      if (pfp) {
        let reader = new FileReader();
        reader.readAsDataURL(pfp);
        reader.onload = function() {
          let token = localStorage.getItem("token") || sessionStorage.getItem("token");
          socket.emit("updatePfp", token, reader.result);
        }
      }
    }
  });

  document.getElementById("changeDisplayName").addEventListener("click", async function() {
    if (localStorage.getItem("theme") === "dark") {
      let { value: newDisplayName } = await Swal.fire({
        title: "Enter your new display name",
        input: "text",
        inputLabel: "Display Name:",
        showCancelButton: true,
        inputValidator: (value) => {
          if (!value) {
            return "Your new display name can't be blank."
          }
        },
        background: themeSettings.contentBackgroundColor.dark,
        color: themeSettings.contentTextColor.dark
      });
  
      if (newDisplayName) {
        let token = localStorage.getItem("token") || sessionStorage.getItem("token");
        socket.emit("updateDisplayName", token, newDisplayName);
      }
    } else if (localStorage.getItem("theme") === "light") {
      let { value: newDisplayName } = await Swal.fire({
        title: "Enter your new display name",
        input: "text",
        inputLabel: "Display Name:",
        showCancelButton: true,
        inputValidator: (value) => {
          if (!value) {
            return "Your new display name can't be blank."
          }
        },
        background: themeSettings.contentBackgroundColor.light,
        color: themeSettings.contentTextColor.light
      });
  
      if (newDisplayName) {
        let token = localStorage.getItem("token") || sessionStorage.getItem("token");
        socket.emit("updateDisplayName", token, newDisplayName);
      }
    }
  });

  document.getElementById("changeEmail").addEventListener("click", async function() {
    if (localStorage.getItem("theme") === "dark") {
      let { value: newEmail } = await Swal.fire({
        title: "Enter your new e-mail address",
        input: "email",
        inputLabel: "Email:",
        showCancelButton: true,
        inputValidator: (value) => {
          if (!value) {
            return "Your new email address can't be blank"
          }
        },
        background: themeSettings.contentBackgroundColor.dark,
        color: themeSettings.contentTextColor.dark
      });

      if (newEmail) {
        let token = localStorage.getItem("token") || sessionStorage.getItem("token");
        socket.emit("updateEmail", token, newEmail);
      }
    } else if (localStorage.getItem("theme") === "light") {
      let { value: newEmail } = await Swal.fire({
        title: "Enter your new e-mail address",
        input: "email",
        inputLabel: "Email:",
        showCancelButton: true,
        inputValidator: (value) => {
          if (!value) {
            return "Your new email address can't be blank"
          }
        },
        background: themeSettings.contentBackgroundColor.light,
        color: themeSettings.contentTextColor.light
      });

      if (newEmail) {
        let token = localStorage.getItem("token") || sessionStorage.getItem("token");
        socket.emit("updateEmail", token, newEmail);
      }
    }
  });

  document.getElementById("toggleAccountVisibility").addEventListener("click", function() {
    let token = localStorage.getItem("token") || sessionStorage.getItem("token");
    let newAccountVisibility;
    
    if (info.public_account == "true") {
      newAccountVisibility = "false";
    } else {
      newAccountVisibility = "true";
    }

    socket.emit("updateAccountVisibility", token, newAccountVisibility);
  });
});

socket.on("newIncomingFriendRequest", (incomingRequest) => {
  let friendDiv = document.createElement("div"); //create container div
  friendDiv.classList.add("secondaryContentTheme", "friendDiv");
  
  let pfp = document.createElement("img"); //create element for incoming friend request person's pfp
  pfp.classList.add("friendPfp");
  if (incomingRequest.profile_picture === "defaultAvatar") {
    pfp.src = "/assets/defaultAvatar.png";
  } else {
    pfp.src = incomingRequest.profile_picture; 
  }

  let displayName = document.createElement("div"); // div for incoming friend request person's display name
  displayName.classList.add("friendDisplayName");
  displayName.innerHTML = incomingRequest.display_name;

  let usernameContainer = document.createElement("div"); // div for container for incoming friend request person's username
  usernameContainer.classList.add("friendUsername"); 
  let username = document.createElement("a"); //container will contain a <a> element that will link to their profile page
  username.textContent = "@" + incomingRequest.username;
  username.href = "/user/" + incomingRequest.username;
  usernameContainer.appendChild(username);

  let acceptButton = document.createElement("button");
  acceptButton.classList.add("btnAcceptFriendRequest", "contentTheme");
  acceptButton.innerHTML = "Accept";
  acceptButton.addEventListener("click", function() {
    let token = localStorage.getItem("token") || sessionStorage.getItem("token");
    socket.emit("acceptFriendRequest", token, incomingRequest.user_id);
  });
  

  friendDiv.appendChild(pfp);
  friendDiv.appendChild(displayName);
  friendDiv.appendChild(usernameContainer);
  friendDiv.appendChild(acceptButton);

  document.getElementById("incomingFriendRequestsContainer").appendChild(friendDiv);

  changeTheme();
});

socket.on("newOutgoingFriendRequest", (outgoingRequest) => {
  let friendDiv = document.createElement("div"); //create container div
  friendDiv.classList.add("secondaryContentTheme", "friendDiv");
  
  let pfp = document.createElement("img"); //create element for outgoing friend request person's pfp
  pfp.classList.add("friendPfp");
  if (outgoingRequest.profile_picture === "defaultAvatar") {
    pfp.src = "/assets/defaultAvatar.png";
  } else {
    pfp.src = outgoingRequest.profile_picture; 
  }

  let displayName = document.createElement("div"); // div for outgoing friend request person's display name
  displayName.classList.add("friendDisplayName");
  displayName.innerHTML = outgoingRequest.display_name;

  let usernameContainer = document.createElement("div"); // div for container for outgoing friend request person's username
  usernameContainer.classList.add("friendUsername"); 
  let username = document.createElement("a"); //container will contain a <a> element that will link to their profile page
  username.textContent = "@" + outgoingRequest.username;
  username.href = "/user/" + outgoingRequest.username;
  usernameContainer.appendChild(username);

  let cancelRequestButton = document.createElement("button");
  cancelRequestButton.classList.add("btnCancelFriendRequest", "contentTheme");
  cancelRequestButton.innerHTML = "Cancel";
  cancelRequestButton.addEventListener("click", function() {
    let token = localStorage.getItem("token") || sessionStorage.getItem("token");
    socket.emit("cancelFriendRequest", token, outgoingRequest.user_id);
  });
  

  friendDiv.appendChild(pfp);
  friendDiv.appendChild(displayName);
  friendDiv.appendChild(usernameContainer);
  friendDiv.appendChild(cancelRequestButton);

  document.getElementById("outgoingFriendRequestsContainer").appendChild(friendDiv);

  changeTheme();
});

socket.on("newFriend", (friendInfo) => {
  let friendDiv = document.createElement("div"); //create container div
  friendDiv.classList.add("secondaryContentTheme", "friendDiv");
  
  let pfp = document.createElement("img"); //create element for friend's pfp
  pfp.classList.add("friendPfp");
  if (friendInfo.profile_picture === "defaultAvatar") {
    pfp.src = "/assets/defaultAvatar.png";
  } else {
    pfp.src = friendInfo.profile_picture; 
  }

  let displayName = document.createElement("div"); // div for friend's display name
  displayName.classList.add("friendDisplayName");
  displayName.innerHTML = friendInfo.display_name;

  let usernameContainer = document.createElement("div"); // div for container for friend's username
  usernameContainer.classList.add("friendUsername"); 
  let username = document.createElement("a"); //container will contain a <a> element that will link to friend's profile page
  username.textContent = "@" + friendInfo.username;
  username.href = "/user/" + friendInfo.username;
  usernameContainer.appendChild(username);

  let unfriendButton = document.createElement("button");
  unfriendButton.classList.add("btnCancelFriendRequest", "contentTheme");
  unfriendButton.innerHTML = "Unfriend";
  unfriendButton.addEventListener("click", function() {
    let token = localStorage.getItem("token") || sessionStorage.getItem("token");
    socket.emit("unfriend", token, friendInfo.user_id);
  });
  

  friendDiv.appendChild(pfp);
  friendDiv.appendChild(displayName);
  friendDiv.appendChild(usernameContainer);
  friendDiv.appendChild(unfriendButton);

  document.getElementById("friendsContainer").appendChild(friendDiv);

  changeTheme();
});

socket.on("successfullyUpdatedBio", () => {
  location.reload();
});

socket.on("successfullyUpdatedPfp", () => {
  location.reload();
});

socket.on("successfullyUpdatedDisplayName", () => {
  location.reload();
})

socket.on("successfullyUpdatedEmail", () => {
  location.reload();
});

socket.on("successfullyUpdatedAccountVisibility", () => {
  location.reload();
});

socket.on("successfullyUpdatedPubliclyDisplayedAchievements", () => {
  location.reload();
});

socket.on("successfullyAcceptedFriendRequest", () => {
  location.reload();
});

socket.on("successfullyCancelledFriendRequest", () => {
  location.reload();
})