let socket = io();

let gamePinDisplay = document.getElementById("gamePinDisplay");
let gameTopicsContainer = document.getElementById("gameTopicsContainer");
let chooseGameControlsContainer = document.getElementById("chooseGameControlsContainer");
let lobbyMembersContainer = document.getElementById("lobbyMembersContainer");
let lobbyChatForm = document.getElementById("lobbyChatForm");
let lobbyChatInput = document.getElementById("lobbyChatInput");
let messagesContainer = document.getElementById("messages");
let btnStartGame = document.getElementById("btnStartGame");

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

    //adding topics
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

    //game controls inputs:
    chooseGameControlsContainer.style.display = "block";
    let timeBased = document.getElementById("timeBased");
    let timeLimitInput = document.getElementById("timeLimitInput");
    let timeLimitDisplay = document.getElementById("timeLimitDisplay");
    let questionsBased = document.getElementById("questionsBased");
    let questionsLimitInput = document.getElementById("questionsLimitInput");
    let questionsLimitDisplay = document.getElementById("questionsLimitDisplay");

    if (timeBased.checked) {
      timeLimitInput.style.display = "inline-block";
      timeLimitDisplay.style.display = "inline-block";
      questionsLimitInput.style.display = "none";
      questionsLimitDisplay.style.display = "none";
    } else if (questionsBased.checked) {
      timeLimitInput.style.display = "none";
      timeLimitDisplay.style.display = "none";
      questionsLimitInput.style.display = "inline-block";
      questionsLimitDisplay.style.display = "inline-block";
    }
    
    timeBased.addEventListener("change", function() {
      if (timeBased.checked) {
        timeLimitInput.style.display = "inline-block";
        timeLimitDisplay.style.display = "inline-block";
        questionsLimitInput.style.display = "none";
        questionsLimitDisplay.style.display = "none";
      }
    });

    questionsBased.addEventListener("change", function() {
      if (questionsBased.checked) {
        timeLimitInput.style.display = "none";
        timeLimitDisplay.style.display = "none";
        questionsLimitInput.style.display = "inline-block";
        questionsLimitDisplay.style.display = "inline-block";
      }
    });

    timeLimitInput.addEventListener("change", function() {
      let timeLimit = timeLimitInput.value;
      if (timeLimit != 1) {
        timeLimitDisplay.textContent = `Time Limit: ${timeLimit} minutes`;
      } else {
        timeLimitDisplay.textContent = `Time Limit: ${timeLimit} minute`;
      }
    });

    questionsLimitInput.addEventListener("change", function() {
      questionsLimitDisplay.textContent = `Questions: ${questionsLimitInput.value}`;
    });

    //start game:
    btnStartGame.style.display = "block"; //make button visible if they're the owner
    btnStartGame.addEventListener("click", function() {
      
    });
  } else {
    gameTopicsContainer.style.marginTop = "-25px"; //because i'm bad at CSS and would rather use JS
  }
                
  //show room code at top of page:
  gamePinDisplay.innerHTML = `Room Code: ${roomInfo.roomCode}<br>🔗 (click to copy link) 🔗`;
  //display game topics:
  gameTopicsContainer.innerHTML = "";
  roomInfo.settings.topics.forEach(topic => {
    let gameTopic = document.createElement("div");
    gameTopic.classList.add("secondaryContentTheme");
    gameTopic.textContent = possibleMathWarsTopics[topic].name;
    if (isRoomOwner) {
      gameTopic.textContent += " ❌";
      gameTopic.style.cursor = "pointer";
      gameTopic.addEventListener("click", function() {
        gameTopic.display = "none";
        socket.emit("mathwars_removeTopic", topic, roomInfo.roomCode);
      });
    }
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

socket.on("mathwars_youGotKicked", () => {
  window.location.href = '/mathwars';
});

//update game topics display:
socket.on("mathwars_updateTopicsDisplay", (topics) => {
  gameTopicsContainer.innerHTML = "";
  topics.forEach(topic => {
    let gameTopic = document.createElement("div");
    gameTopic.classList.add("secondaryContentTheme");
    gameTopic.textContent = possibleMathWarsTopics[topic].name;
    if (isRoomOwner) {
      gameTopic.textContent += " ❌";
      gameTopic.style.cursor = "pointer";
      gameTopic.addEventListener("click", function() {
        gameTopic.display = "none";
        let url = window.location.href;
        let roomCode = url.substring(url.lastIndexOf('/') + 1).toLowerCase();
        socket.emit("mathwars_removeTopic", topic, roomCode);
      });
    }
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