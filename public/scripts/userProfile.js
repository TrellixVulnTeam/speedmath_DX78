var socket = io();

let btnSendFriendRequest = document.getElementById("btnSendFriendRequest");

window.onload = function() {
  let url = window.location.href;
  
  let token = localStorage.getItem("token") || sessionStorage.getItem("token");

  if (token == null) { //if user isn't logged in,
    // get whatever's after the last / to get the username, and send it to the server to get the public info associated with that username
    socket.emit("getPublicUserInfo", url.substring(url.lastIndexOf('/') + 1).toLowerCase()); 
  } else {
    // get whatever's after the last / to get the username, and send it to the server to get the public info associated with that username
    socket.emit("getUserInfoWhileLoggedIn", token, url.substring(url.lastIndexOf('/') + 1).toLowerCase()); 
  }
}

socket.on("profileUsernameNotFound", () => {
  document.title = "Dream Not Found";
  document.getElementById("usernameNotFound").style.display = "block";
});

socket.on("userProfilePageInfo", info => {
  //alert(JSON.stringify(info.topicsPracticeStats));
  
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

  // Display topics practice stats
  if (info.topicsPracticeStats) {
    let topicsPracticeStats = info.topicsPracticeStats;
    delete topicsPracticeStats.user_id;
    document.getElementById("topicsPracticeStatsContainer").style.display = "block";
    let table = document.getElementById("topicsPracticeStatsTable");

    Object.keys(topicsPracticeStats).forEach(topic => { //for each topic...
      let newRow = table.insertRow(); //insert a new row into the table
      let topicCell = newRow.insertCell(0); //cell to hold topic name
      let topicLevelCell = newRow.insertCell(1); //cell to hold level user is on for that topic

      topicCell.textContent = getTopicFromDatabaseColumnName(topic); //use helper function to get topic name from database column name
      topicLevelCell.textContent = topicsPracticeStats[topic];
    });
  }

  if (info.isFriend) {
    btnSendFriendRequest.textContent = "Unfriend";
    btnSendFriendRequest.addEventListener("click", function() { //make button an "Unfriend" button
      let token = localStorage.getItem("token") || sessionStorage.getItem("token");
      socket.emit("unfriend", token, info.user_id);
    });
  } else if (info.sentFriendRequest) {
    btnSendFriendRequest.textContent = "Cancel Friend Request";
    btnSendFriendRequest.addEventListener("click", function() {
      let token = localStorage.getItem("token") || sessionStorage.getItem("token");
      socket.emit("cancelOutgoingFriendRequest", token, info.user_id);
    });
  } else if (info.gettingFriendRequest) {
    btnSendFriendRequest.textContent = "Accept Friend Request";
    btnSendFriendRequest.addEventListener("click", function() {
      let token = localStorage.getItem("token") || sessionStorage.getItem("token");
      socket.emit("acceptFriendRequest", token, info.user_id);
    });
  } else {
    //Send friend request button code:
    btnSendFriendRequest.addEventListener("click", function() {
      let token = localStorage.getItem("token") || sessionStorage.getItem("token");
  
      if (token === null) { //if page viewer is not logged in...
        Swal.fire({
          title: "You are not logged in!",
          text: "You must be logged in to send friend requests.",
          icon: "error",
          iconColor: themeSettings.contentTextColor[localStorage.getItem("theme")],
          background: themeSettings.contentBackgroundColor[localStorage.getItem("theme")],
          color: themeSettings.contentTextColor[localStorage.getItem("theme")],
        });
      } else {
        socket.emit("sendFriendRequest", token, info.user_id);
      }
    });
  }
});

socket.on("successfullySentFriendRequest", () => {
  btnSendFriendRequest.textContent = "Friend Request Sent!";
  btnSendFriendRequest.disabled = true;
    
  Swal.fire({
    icon: 'success',
    title: 'Friend Request sent!',
    iconColor: themeSettings.contentTextColor[localStorage.getItem("theme")],
    background: themeSettings.contentBackgroundColor[localStorage.getItem("theme")],
    color: themeSettings.contentTextColor[localStorage.getItem("theme")],
  });
});

socket.on("successfullyUnfriendedFriend", () => {
  Swal.fire({
    icon: 'success',
    title: 'Successfully unfriended user!',
    iconColor: themeSettings.contentTextColor[localStorage.getItem("theme")],
    background: themeSettings.contentBackgroundColor[localStorage.getItem("theme")],
    color: themeSettings.contentTextColor[localStorage.getItem("theme")]
  }).then(() => {
    location.reload();
  });
});

socket.on("successfullyAcceptedFriendRequest", () => {
  Swal.fire({
    icon: 'success',
    title: 'Successfully accepted friend request!',
    iconColor: themeSettings.contentTextColor[localStorage.getItem("theme")],
    background: themeSettings.contentBackgroundColor[localStorage.getItem("theme")],
    color: themeSettings.contentTextColor[localStorage.getItem("theme")]
  }).then(() => {
    location.reload();
  });
});

socket.on("successfullyCancelledFriendRequest", () => {
  Swal.fire({
    icon: 'success',
    title: 'Successfully cancelled friend request!',
    iconColor: themeSettings.contentTextColor[localStorage.getItem("theme")],
    background: themeSettings.contentBackgroundColor[localStorage.getItem("theme")],
    color: themeSettings.contentTextColor[localStorage.getItem("theme")]
  }).then(() => {
    location.reload();
  });
});

socket.on("youAreTryingToFriendYourself", () => {
  Swal.fire({
    icon: 'error',
    title: 'You cannot friend yourself.',
    text: "This is your own public profile. You aren't allowed to friend yourself.",
    iconColor: themeSettings.contentTextColor[localStorage.getItem("theme")],
    background: themeSettings.contentBackgroundColor[localStorage.getItem("theme")],
    color: themeSettings.contentTextColor[localStorage.getItem("theme")],
  });
});

//function to convert something like the string "addition_level" to "Addition"
function getTopicFromDatabaseColumnName(databaseColumnName) {
  databaseColumnName = databaseColumnName.substring(0, databaseColumnName.length - 6); //use substring to cut out the last 6 chars of the topic to get the topic by itself, because it's initally in the form topic_level (because that's what the database column name is)
  databaseColumnName.replaceAll("_", " "); //replace all other underscores with spaces after the "_level" at the end has been removed
  databaseColumnName = databaseColumnName[0].toUpperCase() + databaseColumnName.substring(1); //capitalize the first letter

  return databaseColumnName;
}