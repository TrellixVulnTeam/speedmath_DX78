var socket = io();

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

  if (info.bio == "") {
    document.getElementById("bio").textContent = "No bio yet.";
  } else {
    document.getElementById("bio").textContent = info.bio;
  }

  let publicly_displayed_achievements = info.publicly_displayed_achievements.split(",");

  publicly_displayed_achievements.forEach(publiclyDisplayedAchievement => {
    if (publiclyDisplayedAchievement !== '') {
      let img = document.createElement("img");
      img.classList.add("achievement");
      img.src = `/assets/achievements/${publiclyDisplayedAchievement}.png`;
      document.getElementById("achievementsContainer").appendChild(img);
    }
  });
});