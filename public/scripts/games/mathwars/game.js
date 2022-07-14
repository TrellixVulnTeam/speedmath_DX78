let socket = io();

let gamePinDisplay = document.getElementById("gamePinDisplay");
let lobbyMembersContainer = document.getElementById("lobbyMembersContainer");
let lobbyChatForm = document.getElementById("lobbyChatForm");
let lobbyChatInput = document.getElementById("lobbyChatInput");
let messagesContainer = document.getElementById("messages");

window.onload = function() {
  let url = window.location.href;
  let roomCode = url.substring(url.lastIndexOf('/') + 1).toLowerCase();

  let oldSocketId = sessionStorage.getItem("mathwars_userId");
  
  if (oldSocketId) {
    socket.emit("mathwars_loadLobby", roomCode, oldSocketId);
    sessionStorage.removeItem("mathwars_userId");
  } else {
    window.location.href = '/mathwars?join=' + roomCode;
  }
}

socket.on("mathwars_invalidRoom", () => {
  window.location.href = '/mathwars';
});

socket.on("mathwars_getLobby", (roomInfo) => {
  console.log(roomInfo);
  //show room code at top of page:
  gamePinDisplay.innerHTML = `Room Code: ${roomInfo.roomCode}<br>🔗 (click to copy link) 🔗`;
  gamePinDisplay.addEventListener("click", function() {
    navigator.clipboard.writeText(`https://speedmath.ml/mathwars?join=${roomInfo.roomCode}`);
    alertify.notify('Copied to clipboard!', 'success', 5); 
  });
  //display member list:
  lobbyMembersContainer.innerHTML = ""; //clear anything from last lobby load
  roomInfo.members.forEach(member => {
    let memberDiv = document.createElement("div");
    memberDiv.textContent += member.username;
    if (member.isOwner) {
      memberDiv.textContent += " 👑";
    }
    memberDiv.classList.add("secondaryContentTheme", "memberInLobby");
    lobbyMembersContainer.appendChild(memberDiv);
  });
});



socket.on("mathwars_ownerLeftRoom", () => {
  Swal.fire({
    title: 'Room Host Left',
    text: 'You will be redirected to the MathWars home page',
    icon: 'warning',
    iconColor: themeSettings.contentTextColor[localStorage.getItem("theme")],
    background: themeSettings.contentBackgroundColor[localStorage.getItem("theme")],
    color: themeSettings.contentTextColor[localStorage.getItem("theme")]
  }).then(() => {
    window.location.href = '/mathwars';
  });
});

//chat:
lobbyChatForm.addEventListener("submit", function(e) {
  e.preventDefault();

  if (lobbyChatInput.value) {
    socket.emit("mathwars_lobbyChatMessageSend", lobbyChatInput.value);
    let newMessage = document.createElement("li");
    newMessage.innerHTML = "<b>You: </b>";
    newMessage.textContent += lobbyChatInput.value;
    messagesContainer.appendChild(newMessage);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    lobbyChatInput.value = "";
  }
});

socket.on("mathwars_lobbyChatNewMessage", (username, message) => {
  let newMessage = document.createElement("li");
  let usernameSpan = document.createElement("span");
  usernameSpan.textContent = username + ": ";
  newMessage.appendChild(usernameSpan);
  newMessage.textContent += message;
  messagesContainer.appendChild(newMessage);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
});