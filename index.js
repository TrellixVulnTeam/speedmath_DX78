const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

app.use(express.static("public"));

app.get('/', (req, res) => {
  res.sendFile(__dirname + "/pages/honk.html");
});

app.get('/arithmetic', (req, res) => {
  res.sendFile(__dirname + "/pages/speedmath.html")
});

app.get('/topics', (req, res) => {
  res.sendFile(__dirname + "/pages/topics/topicsIndex.html")
});

app.get('/topics/:topic', (req, res) => {
  res.sendFile(__dirname + "/pages/topics/" + req.params.topic + ".html");
});

app.get('/contributors', (req, res) => {
  res.sendFile(__dirname + "/pages/contributors.html");
});

app.get('/account', (req, res) => {
  res.sendFile(__dirname + "/pages/account.html");
});

io.on('connection', (socket) => {
  socket.on("login", (username, password) => {
    console.log(`Someone is trying to login.\nUsername: ${username}\nPassword: ${password}`);
  });

  socket.on("signUp", (username, password, displayName, email) => {
    console.log(`Someone is trying to sign up!\nUsername: ${username}\nPassword: ${password}\nDisplay Name: ${displayName}\nEmail: ${email}`);
  });
});

server.listen(process.env['PORT'], () => {
  console.log("I AM WORKING!");
});