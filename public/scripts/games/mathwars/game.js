let socket = io();

//actual game code starts at around line 250, the rest is about the lobby

let lobbyContainer = document.getElementById("lobbyContainer");
let gameContainer = document.getElementById("gameContainer");
let gamePinDisplay = document.getElementById("gamePinDisplay");
let gameTopicsContainer = document.getElementById("gameTopicsContainer");
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
  },
  "modular": {
    "name": "Modular Arithmetic"
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
    
    //start game:
    btnStartGame.style.display = "block"; //make button visible if they're the owner
  } else {
    gameTopicsContainer.style.marginTop = "-25px"; //because i'm bad at CSS classes and would rather use JS
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
            title: "Are you sure you want to kick " + member.username + "?",
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

btnStartGame.addEventListener("click", function() {
  let url = window.location.href;
  let roomCode = url.substring(url.lastIndexOf('/') + 1).toLowerCase();
  socket.emit("mathwars_startGame", roomCode);
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
  sessionStorage.setItem('mathwars_kicked', 'true');
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

//actual game:
let canvas = document.getElementById("gameCanvas");
let map = canvas.getContext("2d");

let upgradesContainer = document.getElementById("upgradesContainer");
let openUpgradesContainer = document.getElementById("openUpgradesContainer");
let backToMapCategoryToggle = document.getElementById("backToMapCategoryToggle");
let leaderboardCategoryToggle = document.getElementById("leaderboardCategoryToggle");
let defenseCategoryToggle = document.getElementById("defenseCategoryToggle");
let attackCategoryToggle = document.getElementById("attackCategoryToggle");
let earnCategoryToggle = document.getElementById("earnCategoryToggle");
let leaderboardContainer = document.getElementById("leaderboardContainer");
let defenseContainer = document.getElementById("defenseContainer");
let attackContainer = document.getElementById("attackContainer");
let earnContainer = document.getElementById("earnContainer");

openUpgradesContainer.addEventListener("click", function() {
  upgradesContainer.style.display = "grid";
});

backToMapCategoryToggle.addEventListener("click", function() {
  upgradesContainer.style.display = "none";
});

leaderboardCategoryToggle.addEventListener("click", function() {
  leaderboardCategoryToggle.classList.add("selected");
  defenseCategoryToggle.classList.remove("selected");
  attackCategoryToggle.classList.remove("selected");
  earnCategoryToggle.classList.remove("selected");
  leaderboardContainer.classList.add("selected");
  defenseContainer.classList.remove("selected");
  attackContainer.classList.remove("selected");
  earnContainer.classList.remove("selected");
});

defenseCategoryToggle.addEventListener("click", function() {
  leaderboardCategoryToggle.classList.remove("selected");
  defenseCategoryToggle.classList.add("selected");
  attackCategoryToggle.classList.remove("selected");
  earnCategoryToggle.classList.remove("selected");
  leaderboardContainer.classList.remove("selected");
  defenseContainer.classList.add("selected");
  attackContainer.classList.remove("selected");
  earnContainer.classList.remove("selected");
});

attackCategoryToggle.addEventListener("click", function() {
  leaderboardCategoryToggle.classList.remove("selected");
  defenseCategoryToggle.classList.remove("selected");
  attackCategoryToggle.classList.add("selected");
  earnCategoryToggle.classList.remove("selected");
  leaderboardContainer.classList.remove("selected");
  defenseContainer.classList.remove("selected");
  attackContainer.classList.add("selected");
  earnContainer.classList.remove("selected");
});

earnCategoryToggle.addEventListener("click", function() {
  leaderboardCategoryToggle.classList.remove("selected");
  defenseCategoryToggle.classList.remove("selected");
  attackCategoryToggle.classList.remove("selected");
  earnCategoryToggle.classList.add("selected");
  leaderboardContainer.classList.remove("selected");
  defenseContainer.classList.remove("selected");
  attackContainer.classList.remove("selected");
  earnContainer.classList.add("selected");
});

function updateLeaderboard(data) {
  let rank = 1;
  
  //first clear the current leaderboard:
  let tableRows = document.querySelectorAll("#leaderboardTable tr");
  //make sure to start at i = 1 to keep the table headings row
  for (let i = 1; i < tableRows.length; i++) {
    leaderboardTable.deleteRow(1);
  }

  //then, use the data to populate the leaderboard:
  data.forEach(entry => {
    let newRow = leaderboardTable.insertRow();
    let rankCell = newRow.insertCell(0);
    let nameCell = newRow.insertCell(1);
    let landOwnedCell = newRow.insertCell(2);

    rankCell.textContent = rank;
    rank++;

    nameCell.textContent = entry.username;
    landOwnedCell.textContent = entry.landOwned;
  });
}

socket.on("mathwars_gameStarted", (data) => {
  //initial leaderboard table:
  let leaderboardData = [];
  data.memberInfo.forEach(member => {
    leaderboardData.push({
      username: member.username,
      landOwned: member.land
    });
  });

  updateLeaderboard(leaderboardData);
  
  lobbyContainer.style.display = "none";
  gameContainer.style.display = "block";
});