var socket = io();

let btnSendFriendRequest = document.getElementById("btnSendFriendRequest");

window.onload = function() {
  let url = window.location.href;
  // get whatever's after the last / to get the username, and send it to the server to get the public info associated with that username
  socket.emit("getPublicUserInfo", url.substring(url.lastIndexOf('/') + 1).toLowerCase());
}

socket.on("profileUsernameNotFound", () => {
  document.title = "Dream Not Found";
  document.getElementById("usernameNotFound").style.display = "block";
});

socket.on("userProfilePageInfo", info => {
  document.title = info.displayName;
  
  document.getElementById("userInfoContainer").style.display = "block";

  if (info.profilePicture === "defaultAvatar") {
    document.getElementById("profilePicture").src = "/assets/defaultAvatar.png";
  } else {
    document.getElementById("profilePicture").src = info.profilePicture;
  }

  document.getElementById("username").textContent = ("@" + info.username);
  document.getElementById("displayName").textContent = info.displayName;
  document.getElementById("bio").textContent = info.bio;

  // Display achievements:
  
  let publicly_displayed_achievements = JSON.parse(info.publicly_displayed_achievements);

  publicly_displayed_achievements.forEach(publiclyDisplayedAchievement => {
    let img = document.createElement("img");
    img.classList.add("achievement");
    img.src = `/assets/achievements/${publiclyDisplayedAchievement}.png`;
    document.getElementById("achievementsContainer").appendChild(img);
  });

  //Send friend request button code:

  btnSendFriendRequest.addEventListener("click", function() {
    let token = localStorage.getItem("token") || sessionStorage.getItem("token");

    if (token === null) { //if page viewer is not logged in...
      if (localStorage.getItem("theme") === "dark") {
        Swal.fire({
          title: "You are not logged in!",
          text: "You must be logged in to send friend requests.",
          icon: "error",
          iconColor: themeSettings.contentTextColor.dark,
          background: themeSettings.contentBackgroundColor.dark,
          color: themeSettings.contentTextColor.dark
        });
      } else if (localStorage.getItem("theme") === "light") {
        Swal.fire({
          title: "You are not logged in!",
          text: "You must be logged in to send friend requests.",
          icon: "error",
          iconColor: themeSettings.contentTextColor.light,
          background: themeSettings.contentBackgroundColor.light,
          color: themeSettings.contentTextColor.light
        });
      }
    } else {
      socket.emit("sendFriendRequest", token, info.user_id);
    }
  });
});

socket.on("successfullySentFriendRequest", () => {
  btnSendFriendRequest.textContent = "Friend Request Sent!";
  btnSendFriendRequest.disabled = true;
    
  if (localStorage.getItem("theme") === "dark") {
    Swal.fire({
      icon: 'success',
      title: 'Friend Request sent!',
      iconColor: themeSettings.contentTextColor.dark,
      background: themeSettings.contentBackgroundColor.dark,
      color: themeSettings.contentTextColor.dark
    });
  } else if (localStorage.getItem("theme") === "light") {
    Swal.fire({
      icon: 'success',
      title: 'Friend Request sent!',
      iconColor: themeSettings.contentTextColor.light,
      background: themeSettings.contentBackgroundColor.light,
      color: themeSettings.contentTextColor.light
    });
  }
});

socket.on("youAreTryingToFriendYourself", () => {
  if (localStorage.getItem("theme") === "dark") {
    Swal.fire({
      icon: 'error',
      title: 'You cannot friend yourself.',
      text: "This is your own public profile. You aren't allowed to friend yourself.",
      iconColor: themeSettings.contentTextColor.dark,
      background: themeSettings.contentBackgroundColor.dark,
      color: themeSettings.contentTextColor.dark
    });
  } else if (localStorage.getItem("theme") === "light") {
    Swal.fire({
      icon: 'error',
      title: 'You cannot friend yourself.',
      text: "This is your own public profile. You aren't allowed to friend yourself.",
      iconColor: themeSettings.contentTextColor.light,
      background: themeSettings.contentBackgroundColor.light,
      color: themeSettings.contentTextColor.light
    });
  }
});