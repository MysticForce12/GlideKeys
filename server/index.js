const express = require('express');
const http = require('http');
const app = express();
const { Server } = require("socket.io");
const cors = require('cors');

app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173", 
        methods: ["GET", "POST"] 
    }
});

const PORT = process.env.PORT || 3000;

const targetQuotes = [
    // "back a in large nation on show under way both to only want call word move under just move have out just who back too stand",
    "even than mean place move high world person"
    // "hand do all want she nation large by say hold world govern this into to even make problem one house consider not place point not",
    // "never before seem then great nation back same in person not here might change as great leave without against right time play off no out between know into general house without only they it feel",
    // "now at for never other face what public where under the that many since these plan seem about end fact place child through time get consider high make no will school look follow over back how know"
];

let waitingPlayer = null;
const activeRooms = {};

io.on('connection', (socket)=>{
    console.log('A user connected',socket.id);

    socket.on('find_match',()=>{

      if(waitingPlayer){
  
        const roomId = `room_${waitingPlayer.id}_${socket.id}`;
        socket.join(roomId);
        socket.roomId = roomId;
        waitingPlayer.join(roomId);
        waitingPlayer.roomId = roomId;
        
        const randomQuote = targetQuotes[Math.floor(Math.random() * targetQuotes.length)];
        
        activeRooms[roomId] = {readyCount: 0, quote: randomQuote}
  
        io.to(roomId).emit('match_found', roomId);
        console.log(`Match found in room: ${roomId}. Waiting for players to ready up...`);
        waitingPlayer = null;
      }
      else{
        waitingPlayer = socket;
        socket.emit('waiting_for_opponent');
        console.log("Player is waiting for opponent in room: ", socket.id);
      }
    })
    
    socket.on('player_ready',(data)=>{

      activeRooms[data.roomId].readyCount += 1;
      io.to(data.roomId).emit('readyPlayers_count',activeRooms[data.roomId].readyCount);
      console.log(`Player ${socket.id} ready in room: ${data.roomId}. Ready count: ${activeRooms[data.roomId].readyCount}`);
      setTimeout(()=>{},1500);

      if(activeRooms[data.roomId] && activeRooms[data.roomId].readyCount === 2){
        const randomQuote = targetQuotes[Math.floor(Math.random() * targetQuotes.length)];
        io.to(data.roomId).emit('countdown_start');
        console.log(`Both players ready in room: ${data.roomId}. Starting countdown...`);
        
        setTimeout(()=>{
          const savedQuote = randomQuote;
          
          io.to(data.roomId).emit('game_started',{
            roomId: data.roomId, 
            quote: savedQuote
          });
          
          console.log(`Game started in room: ${data.roomId}`);
        },5000);
      
      }
    });

    socket.on('player_not_ready',({roomId})=>{
      if(activeRooms[roomId]){
        activeRooms[roomId].readyCount -= 1;
        io.to(roomId).emit('readyPlayers_count',activeRooms[roomId].readyCount);
      }
    })

    socket.on('typing_progress',(data)=>{
      console.log("Typing from:", socket.id, "Room:", data.roomId);
      socket.to(data.roomId).emit('opponent_progress',data.progress);
    })

    socket.on('live_updates',(data)=>{
      socket.to(data.roomId).emit('opponent_updates', data);
    });

    socket.on('race_finished',(data)=>{
      console.log(`Race finished in room: ${data.roomId}`);
      activeRooms[data.roomId].readyCount = 0;
      socket.to(data.roomId).emit('opponent_finished', data.liveWPM);
    })

    socket.on('leave_room', ({roomId})=>{
        if(activeRooms[roomId]){
          activeRooms[roomId].readyCount = (activeRooms[roomId].readyCount <= 0) ? 0 : activeRooms[roomId].readyCount - 1;
          io.to(roomId).emit('readyPlayers_count',activeRooms[roomId].readyCount);
          socket.leave(roomId);
          console.log(`Player ${socket.id} left room: ${roomId}. Ready count: ${activeRooms[roomId].readyCount}`);
          io.to(roomId).emit('opponent_left');
        }
    })

    socket.on('disconnect',()=>{
        console.log('user disconnected',socket.id);
        if(socket.roomId){
            io.to(socket.roomId).emit('opponent_left');
        }
        if (waitingPlayer === socket) {
            waitingPlayer = null; 
        }
    })
})

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});