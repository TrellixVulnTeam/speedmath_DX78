let socket = io();

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