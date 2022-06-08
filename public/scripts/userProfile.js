var socket = io();

window.onload = function() {
  let url = window.location.href;
  // get whatever's after the last / to get the username, and send it to the server to get the public info associated with that username
  socket.emit("getPublicUserInfo", url.substring(url.lastIndexOf('/') + 1));
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
});