module.exports = function(io, socket, sqlite3, jwt, rooms, possibleMathWarsTopics) {
  class Room {
    constructor(roomId, owner, settings) {
      this.roomId = roomId;
      this.owner = owner;
      this.members = [owner];
      this.settings = settings;
    }
  }  

  class Member {
    constructor(user_id, username) {
      this.user_id = user_id;
      this.username = username;
    }
  }

  socket.on("mathwars_loadPublicRooms", () => {
    let publicRooms = [];
      
    for (let i = 0; i < rooms.length; i++) {
      if (rooms[i].settings.privacy === "public") {
        publicRooms.push({
          name: `${rooms[i].owner.username}'s room`,
          roomCode: rooms[i].roomId
        });
      }
    }

    socket.emit("mathwars_displayPublicRooms", publicRooms);
  });

  socket.on("mathwars_joinRoom", (username, roomCode) => {
    if (validateRoomId(roomCode)) {
      for (let i = 0; i < rooms.length; i++) {
        if (rooms[i].roomId === roomCode) {
          let newMember = new Member(socket.id, username);
          
          rooms[i].members.push(newMember);
          socket.emit("mathwars_redirectToRoomPage", socket.id, roomCode);
          break;
        }
      }
    } else {
      socket.emit("error", "Invalid Room Code", "The room might have been closed, or you might have mistyped it.");
    }
  });

  socket.on("mathwars_makeRoom", (username, privacy) => {
    let owner = new Member(socket.id, username);
    
    let settings = {
      privacy: privacy,
      topics: []
    }

    let roomId = generateRoomId();
    
    let room = new Room(roomId, owner, settings);
    rooms.push(room);

    socket.emit("mathwars_redirectToRoomPage", socket.id, roomId);

    if (privacy === "public") {
      let publicRooms = [];
      
      for (let i = 0; i < rooms.length; i++) {
        if (rooms[i].settings.privacy === "public") {
          publicRooms.push({
            name: `${rooms[i].owner.username}'s room`,
            roomCode: rooms[i].roomId
          });
        }
      }

      io.emit('mathwars_displayPublicRooms', publicRooms);
    }
  });

  socket.on("mathwars_loadLobby", (roomCode, oldSocketId) => {
    if (validateRoomId(roomCode)) {
      let roomIndex = getRoomIndex(roomCode);

      let roomInfo = {
        roomCode: roomCode,
        members: [],
        settings: rooms[roomIndex].settings
      }

      if (oldSocketId === rooms[roomIndex].owner.user_id) {
        rooms[roomIndex].owner.user_id = socket.id;
        roomInfo.isOwner = true;
        roomInfo.possibleTopics = possibleMathWarsTopics;
      }

      for (let i = 0; i < rooms[roomIndex].members.length; i++) {
        if (rooms[roomIndex].members[i].user_id === oldSocketId) {
          rooms[roomIndex].members[i].user_id = socket.id;
          
          break;
        }
      }

      for (let i = 0; i < rooms[roomIndex].members.length; i++) {
        roomInfo.members.push({
          username: rooms[roomIndex].members[i].username,
          user_id: rooms[roomIndex].members[i].user_id,
          isOwner: rooms[roomIndex].members[i].user_id === rooms[roomIndex].owner.user_id
        });
      }

      socket.join(`room${roomCode}`);

      io.to(`room${roomCode}`).emit("mathwars_updateLobby", roomInfo);

      socket.on("disconnect", () => {
        for (let i = 0; i < rooms.length; i++) {
          //if the user owns a room,
          if (rooms[i].owner.user_id === socket.id) {
            socket.to("room" + rooms[i].roomId).emit("mathwars_ownerLeftRoom"); //notify users that they're being kicked
            //delete the room from the array of rooms
            rooms.splice(i, 1);
            break;
          } else {
            //if the user is just a member of a room, remove them from the array of members in the room
            for (let j = 0; j < rooms[i].members.length; j++) {
              if (rooms[i].members[j].user_id === socket.id) {
                rooms[i].members.splice(j, 1);
                break;
              }
            }

            let roomInfo = {
              roomCode: rooms[i].roomId,
              members: [],
              settings: rooms[i].settings
            }

            for (let j = 0; j < rooms[i].members.length; j++) {
              roomInfo.members.push({
                username: rooms[i].members[j].username,
                user_id: rooms[i].members[j].user_id,
                isOwner: rooms[i].members[j].user_id === rooms[roomIndex].owner.user_id
              });
            }

            io.to(`room${rooms[i].roomId}`).emit("mathwars_updateLobby", roomInfo);
          }
        }
      });
    } else {
      socket.emit("mathwars_invalidRoom");
    }
  });

  socket.on("mathwars_kickPlayerFromLobby", (player_id, room_id) => {
    let roomIndex = getRoomIndex(room_id);
    if (roomIndex !== null) {
      if (rooms[roomIndex].owner.user_id === socket.id) {
        //io.sockets.connected[player_id].disconnect();
        io.to(player_id).emit("mathwars_youGotKicked");
      } else {
        socket.emit("error", "Stop trying to hack!", "You shouldn't be getting this error unless you're trying to hack!");
      }
    } else {
      socket.emit("error", "Stop trying to hack!", "You shouldn't be getting this error unless you're trying to hack!");
    }
  });

  socket.on("mathwars_addTopic", (topic, roomId) => {
    let roomIndex = getRoomIndex(roomId);
    if (roomIndex !== null) {
      //check to make sure the person sending the request is actually the owner of the room and not injecting a script
      if (rooms[roomIndex].owner.user_id === socket.id) {
        if (topic in possibleMathWarsTopics) { //validate the topic on server side again 
          if (rooms[roomIndex].settings.topics.includes(topic)) { //if the topic is already chosen
            socket.emit("error", "Topic already added!", "Please choose a different topic to add.");
          } else {
            rooms[roomIndex].settings.topics.push(topic); //add the topic to the room's settings
            io.to(`room${roomId}`).emit("mathwars_updateTopicsDisplay", rooms[roomIndex].settings.topics);
          }
        } else {
          socket.emit("error", "Stop trying to hack!", "You shouldn't be getting this error unless you're trying to hack!");
        }
      } else {
        socket.emit("error", "Stop trying to hack!", "You shouldn't be getting this error unless you're trying to hack!");
      }
    }
  });

  socket.on("mathwars_removeTopic", (topic, roomId) => {
    let roomIndex = getRoomIndex(roomId);
    if (roomIndex !== null) {
      //check to make sure the person sending the request is actually the owner of the room and not injecting a script
      if (rooms[roomIndex].owner.user_id === socket.id) {
        if (rooms[roomIndex].settings.topics.includes(topic)) { //check if the room even has the topic that the owner is trying to remove
          rooms[roomIndex].settings.topics = removeElementFromArray(rooms[roomIndex].settings.topics, topic); //use a helper function to remove the topic from the array of topics contained in the room settings object
          io.to(`room${roomId}`).emit("mathwars_updateTopicsDisplay", rooms[roomIndex].settings.topics); //display this change to everyone in the room
        } else {
          socket.emit("error", "Stop trying to hack!", "You shouldn't be getting this error unless you're trying to hack!");
        }
      } else {
        socket.emit("error", "Stop trying to hack!", "You shouldn't be getting this error unless you're trying to hack!");
      }
    }
  });

  socket.on("mathwars_lobbyChatMessageSend", (message) => {
    let room = [...socket.rooms][1];
    let username = getUsernameFromSocketId(socket.id);
    socket.to(room).emit("mathwars_lobbyChatNewMessage", username, message);
  });

  socket.on("mathwars_startGame", (roomId) => {
    let roomIndex = getRoomIndex(roomId);

    if (roomIndex !== null) {
      //check to make sure the person sending the request is actually the owner of the room and not injecting a script
      if (rooms[roomIndex].owner.user_id === socket.id) {
        rooms[roomIndex].inProgress = true;
        io.to("room" + roomId).emit("mathwars_gameStarted");
      } else {
        socket.emit("error", "Stop trying to hack!", "You shouldn't be getting this error unless you're trying to hack!");
      }
    } else {
      socket.emit("error", "Stop trying to hack!", "You shouldn't be getting this error unless you're trying to hack!");
    }
  });
               
  socket.on("mathwars_logRooms", () => {
    console.log(rooms);
  });

  //generate a random 6 digit room code and check if it's already being used
  function generateRoomId() {
    let id = Math.floor(100000 + Math.random() * 900000).toString();
    let alreadyTaken = false;
    for (let i = 0; i < rooms.length; i++) {
      if (rooms[i].roomId == id) {
        alreadyTaken = true;
        break;
      }
    }

    if (alreadyTaken) {
      return generateRoomId();
    } else {
      return id;
    }
  }

  //validate room ids entered by the user
  function validateRoomId(roomCode) {
    let valid = false;

    for (let i = 0; i < rooms.length; i++) {
      if (rooms[i].roomId == roomCode) {
        valid = true;
        break;
      }
    }

    return valid;
  }

  //get index of room in array of rooms
  function getRoomIndex(roomId) {
    for (let i = 0; i < rooms.length; i++) {
      if (rooms[i].roomId === roomId) {
        return i;
      }
    }

    return null;
  }

  //get username of user from socket.id
  function getUsernameFromSocketId(id) {
    for (let i = 0; i < rooms.length; i++) {
      for (let j = 0; j < rooms[i].members.length; j++) {
        if (rooms[i].members[j].user_id === id) {
          return rooms[i].members[j].username;
        }
      }
    }
  }

  //source: https://stackoverflow.com/a/21688894/
  function removeElementFromArray(arrOriginal, elementToRemove){
    return arrOriginal.filter(function(el){return el !== elementToRemove});
  }
}