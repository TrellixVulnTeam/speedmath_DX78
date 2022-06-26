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
      text: 'Your password does not match your confirmed password. Please correctly re-input the confirmed password.',
      iconColor: themeSettings.contentTextColor[localStorage.getItem("theme")],
      background: themeSettings.contentBackgroundColor[localStorage.getItem("theme")],
      color: themeSettings.contentTextColor[localStorage.getItem("theme")]
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
  Swal.fire({
    icon: "success",
    title: "Successfully Signed Up!",
    text: "Log in to begin playing! 👍",
    confirmButtonText: "Log in",
    iconColor: themeSettings.contentTextColor[localStorage.getItem("theme")],
    background: themeSettings.contentBackgroundColor[localStorage.getItem("theme")],
    color: themeSettings.contentTextColor[localStorage.getItem("theme")],
  }).then(() => {
    let urlParams = new URLSearchParams(window.location.search);
    btnSwitchToLoginForm.click();
  }); 
});

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

socket.on("successfulLogin", (token, remember) => {
  if (remember) {
    localStorage.setItem("token", token);
  } else {
    sessionStorage.setItem("token", token);
  }

  Swal.fire({
    icon: "success",
    title: "Successfully Logged In!",
    text: "Enjoy our website!",
    confirmButtonText: "Continue",
    iconColor: themeSettings.contentTextColor[localStorage.getItem("theme")],
    background: themeSettings.contentBackgroundColor[localStorage.getItem("theme")],
    color: themeSettings.contentTextColor[localStorage.getItem("theme")]
  }).then(() => {
    let urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has("redirect")) {
      window.location.href = urlParams.get("redirect");
    } else {
      location.reload();
    }
  }); 
});

socket.on("ownProfileInfo", (info, topicsPracticeStats) => {
  profileContainer.style.display = "block";
  sessionStorage.setItem("publicAccount", info.public_account);

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
  
  document.getElementById("profileInfoBio").textContent = info.bio;

  document.getElementById("basicInfoContainer").innerHTML += `<b><a href="/user/${info.username}" style="font-size:1.5em;">View Public Profile</a><b>`;

  let publicOrPrivate = document.createElement("span");
  publicOrPrivate.id = "profileInfoPublicOrPrivate";
  
  if (info.public_account == "true") {
    publicOrPrivate.innerHTML = `<br>Your account is <b>public</b>`;
  } else {
    publicOrPrivate.innerHTML = `<br>Your account is <b>private</b>`;
  }

  document.getElementById("basicInfoContainer").appendChild(publicOrPrivate);  

  if (JSON.parse(info.friends).length == 0) {
    document.getElementById("friendsContainer").innerHTML += "<h4>You have no friends.</h4>"
  }

  if (JSON.parse(info.incoming_friend_requests).length == 0) {
    document.getElementById("incomingFriendRequestsContainer").innerHTML += "<h4>You have no incoming friend requests.</h4>"
  }

  if (JSON.parse(info.outgoing_friend_requests).length == 0) {
    document.getElementById("outgoingFriendRequestsContainer").innerHTML += "<h4>You have no outgoing friend requests.</h4>"
  }

  // Achievement Badges:
  let achievements = JSON.parse(info.achievements); //get an array of achievements that the user has
  
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

  let publicly_displayed_achievements = JSON.parse(info.publicly_displayed_achievements);

  publicly_displayed_achievements.forEach(publiclyDisplayedAchievement => {
    let img = document.createElement("img");
    img.classList.add("achievement");
    img.src = `/assets/achievements/${publiclyDisplayedAchievement}.png`;
    document.getElementById("publicBadges").appendChild(img);

    img.addEventListener("click", function() {
      let token = localStorage.getItem("token") || sessionStorage.getItem("token");
      socket.emit("updatePubliclyDisplayedAchievements", token, "remove", publiclyDisplayedAchievement);
    });
  });

  // Topics Practice Stats:

  delete topicsPracticeStats.user_id;
  let table = document.getElementById("topicsPracticeStatsTable");

  Object.keys(topicsPracticeStats).forEach(topic => { //for each topic...
    let newRow = table.insertRow(); //insert a new row into the table
    let topicCell = newRow.insertCell(0); //cell to hold topic name
    let topicLevelCell = newRow.insertCell(1); //cell to hold level user is on for that topic

    topicCell.textContent = getTopicFromDatabaseColumnName(topic); //use helper function to get topic name from database column name
    topicLevelCell.textContent = topicsPracticeStats[topic];
  });

  //Buttons to change account settings:

  document.getElementById("changeBio").addEventListener("click", async function() {
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
      background: themeSettings.contentBackgroundColor[localStorage.getItem("theme")],
      color: themeSettings.contentTextColor[localStorage.getItem("theme")]
    }); 

    if (newBio) {
      let token = localStorage.getItem("token") || sessionStorage.getItem("token");
      socket.emit("updateBio", token, newBio);
    }
  });

  document.getElementById("profilePicture").addEventListener("click", async function() {
    let { value: pfp } = await Swal.fire({
      title: "Upload your new profile picture",
      input: "file",
      showCancelButton: true,
      inputLabel: "By uploading an image, you are agreeing that you have the rights to publicly display that image. No NSFW profile pictures allowed (exceptions are made for Ling and KiteFlyer).",
      inputValidator: (pfp) => {
        if (!pfp) {
          return `You have to upload a picture!`
        }
      },
      inputAttributes: {
        'accept': 'image/*'
      },
      background: themeSettings.contentBackgroundColor[localStorage.getItem("theme")],
      color: themeSettings.contentTextColor[localStorage.getItem("theme")]
    });

    if (pfp) {
      let reader = new FileReader();
      reader.readAsDataURL(pfp);
      reader.onload = function() {
        let token = localStorage.getItem("token") || sessionStorage.getItem("token");
        socket.emit("updatePfp", token, reader.result);
      }
    }
  });

  document.getElementById("deleteAccount").addEventListener("click", async function() {
    let { value: password } = await Swal.fire({
      title: "Are you sure?",
      text: "Are you absolutely sure that you want to delete your account? All of your achievements, progress, etc. will be deleted. This action is irreversible.",
      input: "password",
      inputLabel: "Re-enter your password:",
      showCancelButton: true,
      background: themeSettings.contentBackgroundColor[localStorage.getItem("theme")],
      color: themeSettings.contentTextColor[localStorage.getItem("theme")]
    });

    if (password) {
      let token = localStorage.getItem("token") || sessionStorage.getItem("token");
      socket.emit("deleteAccount", token, password);
    }
  });

  document.getElementById("changeDisplayName").addEventListener("click", async function() {
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
      background: themeSettings.contentBackgroundColor[localStorage.getItem("theme")],
      color: themeSettings.contentTextColor[localStorage.getItem("theme")]
    });

    if (newDisplayName) {
      let token = localStorage.getItem("token") || sessionStorage.getItem("token");
      socket.emit("updateDisplayName", token, newDisplayName);
    }
  });

  document.getElementById("changeEmail").addEventListener("click", async function() {
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
      background: themeSettings.contentBackgroundColor[localStorage.getItem("theme")],
      color: themeSettings.contentTextColor[localStorage.getItem("theme")]
    });
  
    if (newEmail) {
      let token = localStorage.getItem("token") || sessionStorage.getItem("token");
      socket.emit("updateEmail", token, newEmail);
    }
  });

  document.getElementById("toggleAccountVisibility").addEventListener("click", function() {
    let token = localStorage.getItem("token") || sessionStorage.getItem("token");
    let newAccountVisibility;
    
    if (sessionStorage.getItem("publicAccount") == "true") {
      newAccountVisibility = "false";
    } else {
      newAccountVisibility = "true";
    }

    socket.emit("updateAccountVisibility", token, newAccountVisibility);
  });

  document.getElementById("logOut").addEventListener("click", function() {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    location.reload();
  });

  document.getElementById("changeTopicsPracticeStatsPrivacy").addEventListener("click", async function() {
    let token = localStorage.getItem("token") || sessionStorage.getItem("token");

    let { value: privacySetting } = await Swal.fire({
      title: "Select setting:",
      input: "radio",
      inputOptions: {
        "public": "Public",
        "friends": "Friends-only",
        "private": "Private"
      },
      inputValidator: (value) => {
        if (!value) {
          return "Please select a privacy setting!"
        }
      },
      showCancelButton: true,
      background: themeSettings.contentBackgroundColor[localStorage.getItem("theme")],
      color: themeSettings.contentTextColor[localStorage.getItem("theme")]
    });

    if (privacySetting) {
      socket.emit("updateTopicsPracticeStatsPrivacy", token, privacySetting);
    }
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

  let acceptButton = document.createElement("button"); // button to accept the incoiming friend request
  acceptButton.classList.add("btnAcceptFriendRequest", "contentTheme");
  acceptButton.innerHTML = "Accept";
  acceptButton.addEventListener("click", function() {
    let token = localStorage.getItem("token") || sessionStorage.getItem("token");
    socket.emit("acceptFriendRequest", token, incomingRequest.user_id);
  });

  let declineButton = document.createElement("button");
  declineButton.classList.add("btnDeclineFriendRequest", "contentTheme");
  declineButton.innerHTML = "Decline";
  declineButton.addEventListener("click", function() {
    let token = localStorage.getItem("token") || sessionStorage.getItem("token");
    socket.emit("declineFriendRequest", token, incomingRequest.user_id);
  });

  friendDiv.appendChild(pfp);
  friendDiv.appendChild(displayName);
  friendDiv.appendChild(usernameContainer);
  friendDiv.appendChild(acceptButton);
  friendDiv.appendChild(declineButton);

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
    Swal.fire({
      title: "Are you sure you want to cancel your outgoing friend request?",
      icon: "warning",
      iconColor: themeSettings.contentTextColor[localStorage.getItem("theme")],
      background: themeSettings.contentBackgroundColor[localStorage.getItem("theme")],
      color: themeSettings.contentTextColor[localStorage.getItem("theme")],
      showCancelButton: true,
      showConfirmButton: true,
      cancelButtonText: "Go Back",
      confirmButtonText: "Yes"
    }).then((result) => {
      if (result.isConfirmed) {
        let token = localStorage.getItem("token") || sessionStorage.getItem("token");
        socket.emit("cancelOutgoingFriendRequest", token, outgoingRequest.user_id);
      }
    });
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

socket.on("successfullyDeletedAccount", () => {
  localStorage.removeItem("token");
  sessionStorage.removeItem("token");
  location.reload();
});

socket.on("successfullyUpdatedBio", (newBio) => {
  document.getElementById("profileInfoBio").textContent = newBio;

  Swal.fire({
    icon: 'success',
    title: 'Bio updated!',
    iconColor: themeSettings.contentTextColor[localStorage.getItem("theme")],
    background: themeSettings.contentBackgroundColor[localStorage.getItem("theme")],
    color: themeSettings.contentTextColor[localStorage.getItem("theme")],
    didClose: () => scrollToTop()
  });
});

socket.on("successfullyUpdatedPfp", (newPfp) => {
  document.getElementById("profilePicture").src = newPfp;

  Swal.fire({
    icon: 'success',
    title: 'Profile Picture updated!',
    iconColor: themeSettings.contentTextColor[localStorage.getItem("theme")],
    background: themeSettings.contentBackgroundColor[localStorage.getItem("theme")],
    color: themeSettings.contentTextColor[localStorage.getItem("theme")],
    didClose: () => scrollToTop()
  });
});

socket.on("successfullyUpdatedDisplayName", (newDisplayName) => {
  document.getElementById("profileInfoDisplayName").textContent = newDisplayName;
  
  Swal.fire({
    icon: 'success',
    title: 'Display Name updated!',
    iconColor: themeSettings.contentTextColor[localStorage.getItem("theme")],
    background: themeSettings.contentBackgroundColor[localStorage.getItem("theme")],
    color: themeSettings.contentTextColor[localStorage.getItem("theme")],
    didClose: () => scrollToTop()
  });
});

socket.on("successfullyUpdatedEmail", (newEmail) => {
  document.getElementById("profileInfoEmail").textContent = newEmail;
 
  Swal.fire({
    icon: 'success',
    title: 'Email updated!',
    iconColor: themeSettings.contentTextColor[localStorage.getItem("theme")],
    background: themeSettings.contentBackgroundColor[localStorage.getItem("theme")],
    color: themeSettings.contentTextColor[localStorage.getItem("theme")],
    didClose: () => scrollToTop()
  });
});

socket.on("successfullyUpdatedAccountVisibility", (newAccountVisibility) => {
  sessionStorage.setItem("publicAccount", newAccountVisibility);
  
  if (newAccountVisibility == "true") {
    document.getElementById("profileInfoPublicOrPrivate").innerHTML = `<br>Your account is <b>public</b>`;
  } else if (newAccountVisibility == "false") {
    document.getElementById("profileInfoPublicOrPrivate").innerHTML = `<br>Your account is <b>private</b>`;
  }

  Swal.fire({
    icon: 'success',
    title: 'Account Visibility Updated!',
    iconColor: themeSettings.contentTextColor[localStorage.getItem("theme")],
    background: themeSettings.contentBackgroundColor[localStorage.getItem("theme")],
    color: themeSettings.contentTextColor[localStorage.getItem("theme")],
    didClose: () => scrollToTop()
  });
});

socket.on("successfullyUpdatedTopicsPracticeStatsPrivacy", () => {
  Swal.fire({
    icon: 'success',
    title: 'Topics Practice Stats Privacy Updated!',
    iconColor: themeSettings.contentTextColor[localStorage.getItem("theme")],
    background: themeSettings.contentBackgroundColor[localStorage.getItem("theme")],
    color: themeSettings.contentTextColor[localStorage.getItem("theme")],
    didClose: () => scrollToTop()
  });
});

socket.on("successfullyUpdatedPubliclyDisplayedAchievements", () => {
  location.reload();
});

socket.on("successfullyAcceptedFriendRequest", () => {
  location.reload();
});

socket.on("successfullyDeclinedFriendRequest", () => {
  location.reload();
});

socket.on("successfullyCancelledFriendRequest", () => {
  location.reload();
})

socket.on("successfullyUnfriendedFriend", () => {
  location.reload();
});

function scrollToTop() {
  window.scroll({
   top: 0, 
   left: 0, 
   behavior: 'smooth' 
  });
}

//function to convert something like the string "addition_level" to "Addition"
function getTopicFromDatabaseColumnName(databaseColumnName) {
  let dict = {
    "addition_level": "Addition",
    "subtraction_level": "Subtraction",
    "multiplication_level": "Multiplication",
    "division_level": "Division",
    "squaring_level": "Squaring",
    "square_root_level": "Square Root"
  }

  return dict[databaseColumnName];
}