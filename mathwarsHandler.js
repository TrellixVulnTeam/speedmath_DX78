module.exports = function(io, socket, sqlite3, jwt, rooms) {
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
  });

  socket.on("mathwars_loadLobby", (roomCode, oldSocketId) => {
    if (validateRoomId(roomCode)) {
      let roomIndex = getRoomIndex(roomCode);

      let roomInfo = {
        roomCode: roomCode,
        members: []
      }

      if (oldSocketId === rooms[roomIndex].owner.user_id) {
        rooms[roomIndex].owner.user_id = socket.id;
        roomInfo.isOwner = true;
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

      console.log(roomInfo);

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
              members: []
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

  socket.on("mathwars_lobbyChatMessageSend", (message) => {
    let room = [...socket.rooms][1];
    let username = getUsernameFromSocketId(socket.id);
    socket.to(room).emit("mathwars_lobbyChatNewMessage", username, message);
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
}