const express = require("express");
const socket = require("socket.io");
const { Chess } = require("chess.js");
const http = require("http");
const path = require("path");
const { title } = require("process");

const app = express();
const server = http.createServer(app);
const io = socket(server);

const chess = new Chess();
let player = {};
let currentPlayer = "w";

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.render("index", { title: "Custom Chess Game" });
});

io.on("connection", (socket) => {
  console.log(`${socket.id} is connected to backend`);

  if (!player.white) {
    player.white = socket.id;
    socket.emit("playerRole", "w");
  } else if (!player.black) {
    player.black = socket.id;
    socket.emit("playerRole", "b");
  } else {
    socket.emit("spectatorRole");
  }

  socket.on("disconnect", () => {
    if (player.white === socket.id) {
      delete player.white;
    } else if (player.black === socket.id) {
      delete player.black;
    }
  });

  socket.on('move',(moveInfo)=>{
    try {
        if(chess.turn() === 'w'  && socket.id !== player.white) return;
        if(chess.turn() === 'b' && socket.id !== player.black) return;

        const result = chess.move(moveInfo);
        if(result){
            currentPlayer = chess.turn();
            io.emit('move',moveInfo)
            io.emit('boardState',chess.fen())
        }
        else
        {
            console.log('invalid move',moveInfo)
            socket.emit('invalid move',moveInfo)
        }
    }
    catch(err){
        console.log(err)
        socket.emit('error',err)
    }
  })
});

server.listen(3000, () => {
  console.log("server is listening at http://localhost:3000");
});
