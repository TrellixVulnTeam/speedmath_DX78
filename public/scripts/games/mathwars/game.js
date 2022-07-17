let socket = io();

let gamePinDisplay = document.getElementById("gamePinDisplay");
let gameTopicsContainer = document.getElementById("gameTopicsContainer");
let lobbyMembersContainer = document.getElementById("lobbyMembersContainer");
let lobbyChatForm = document.getElementById("lobbyChatForm");
let lobbyChatInput = document.getElementById("lobbyChatInput");
let messagesContainer = document.getElementById("messages");

let isRoomOwner;

let possibleMathWarsTopics = {
  "addition": {
    "name": "Addition"
  },
  "subtraction": {
    "name": "Subtraction"
  },
  "multiplication": {
    "name": "Multiplication"
  },
  "division": {
    "name": "Division"
  },
  "squaring": {
    "name": "Squaring"
  },
  "sqrt": {
    "name": "Square Rooting"
  }
}

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

socket.on("mathwars_updateLobby", (roomInfo) => {
  if (roomInfo.isOwner) {
    isRoomOwner = true;
    let addTopic = document.getElementById("addTopic");
    let topicInput = document.getElementById("topicInput");
    document.getElementById("chooseGameTopicsContainer").style.display = "block";
    addTopic.disabled = false;
    addTopic.addEventListener("click", function() {
      if (topicInput.value) {
        //client side validation for topic:
        let isValidTopic = false;
        Object.keys(roomInfo.possibleTopics).forEach(topic => {
          if (roomInfo.possibleTopics[topic].name === topicInput.value) {
            isValidTopic = true;
            socket.emit("mathwars_addTopic", topic, roomInfo.roomCode);
          }
        });

        if (!isValidTopic) {
          Swal.fire({
            title: "Invalid Topic",
            text: "Please pick a topic from the drop-down list.",
            icon: "error",
            iconColor: themeSettings.contentTextColor[localStorage.getItem("theme")],
            background: themeSettings.contentBackgroundColor[localStorage.getItem("theme")],
            color: themeSettings.contentTextColor[localStorage.getItem("theme")]
          });
        }

        topicInput.value = "";
      }
    });
    Object.keys(roomInfo.possibleTopics).forEach(topic => {
      let option = document.createElement("option");
      option.value = roomInfo.possibleTopics[topic].name;
      document.getElementById("topicsList").appendChild(option);
    });
  }
                
  //show room code at top of page:
  gamePinDisplay.innerHTML = `Room Code: ${roomInfo.roomCode}<br>🔗 (click to copy link) 🔗`;
  //display game topics:
  gameTopicsContainer.innerHTML = "";
  roomInfo.settings.topics.forEach(topic => {
    let gameTopic = document.createElement("div");
    gameTopic.classList.add("secondaryContentTheme");
    gameTopic.textContent = possibleMathWarsTopics[topic].name;
    gameTopicsContainer.appendChild(gameTopic);
  });
  //display member list:
  lobbyMembersContainer.innerHTML = ""; //clear anything from last lobby load
  roomInfo.members.forEach(member => {
    let memberDiv = document.createElement("div");
    memberDiv.textContent += member.username;
    if (member.isOwner) {
      memberDiv.textContent += " 👑";
    } else {
      if (isRoomOwner) {
        memberDiv.title = 'Double-click to kick...';
        memberDiv.addEventListener("dblclick", function() {
          Swal.fire({
            title: "Are you sure you want to kick" + member.username + "?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Kick',
            iconColor: themeSettings.contentTextColor[localStorage.getItem("theme")],
            background: themeSettings.contentBackgroundColor[localStorage.getItem("theme")],
            color: themeSettings.contentTextColor[localStorage.getItem("theme")]
          }).then((result) => {
            if (result.isConfirmed) {
              socket.emit("mathwars_kickPlayerFromLobby", member.user_id, roomInfo.roomCode);
              Swal.fire({
                title: "Kicked player!",
                icon: 'success',
                iconColor: themeSettings.contentTextColor[localStorage.getItem("theme")],
                background: themeSettings.contentBackgroundColor[localStorage.getItem("theme")],
                color: themeSettings.contentTextColor[localStorage.getItem("theme")]
              });
            }
          });
        });
      }
    }
    memberDiv.classList.add("secondaryContentTheme", "memberInLobby");
    lobbyMembersContainer.appendChild(memberDiv);
  });
});

gamePinDisplay.addEventListener("click", function() {
  let url = window.location.href;
  let roomCode = url.substring(url.lastIndexOf('/') + 1).toLowerCase();
  navigator.clipboard.writeText(`https://speedmath.ml/mathwars?join=${roomCode}`);
  alertify.notify('Copied to clipboard!', 'success', 5); 
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

//update game topics display:
socket.on("mathwars_updateTopicsDisplay", (topics) => {
  gameTopicsContainer.innerHTML = "";
  topics.forEach(topic => {
    let gameTopic = document.createElement("div");
    gameTopic.classList.add("secondaryContentTheme");
    gameTopic.textContent = possibleMathWarsTopics[topic].name;
    gameTopicsContainer.appendChild(gameTopic);
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

//general error alert:
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