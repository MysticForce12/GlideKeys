const express = require('express');
const http = require('http');
const app = express();
const { Server } = require("socket.io");
const cors = require('cors');
const server = http.createServer(app);
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');

require('dotenv').config();
const connectDB = require('./config/db');
connectDB();


const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

app.get('/ping', (req, res) => {
  res.status(200).send('Server is awake!');
});


const PORT = process.env.PORT || 3000;

const targetQuotes = [
    "even than mean place move high world person"
    // "back a in large nation on show under way both to only want call word move under just move have out just who back too stand",
    // "hand do all want she nation large by say hold world govern this into to even make problem one house consider not place point not",
    // "never before seem then great nation back same in person not here might change as great leave without against right time ",
    // "now at for never other face what public where under the that many since these plan seem about end fact place child through time get consider high make no will school look follow over back how know"
];

let waitingPlayer = null;
const activeRooms = {};
const roomCapacity = 5;

io.on('connection', (socket)=>{

    console.log('A user connected with id : ',socket.id);

    socket.on('find_match',()=>{
      
      let roomToJoin = null;
      
      for(const roomId in activeRooms){
        const room = activeRooms[roomId];
        const currPlayersCount = Object.keys(room.players).length;
        if (room.status === "waiting" && currPlayersCount < roomCapacity) {
            roomToJoin = roomId;
            break;
        }
      }

      if(roomToJoin){
        socket.join(roomToJoin);
        socket.roomId = roomToJoin;
        activeRooms[roomToJoin].players[socket.id] = {
          isReady : false,
          wpm : 0,
          progress : 0,
          accuracy : 0
        };
        socket.emit('match_found', roomToJoin);
        io.to(roomToJoin).emit('player_joined_room', { 
              playerCount: Object.keys(activeRooms[roomToJoin].players).length 
        });
  
        console.log(`Player ${socket.id} joined existing room: ${roomToJoin}`);
      }
      else{
        const newRoomId = `room_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        socket.join(newRoomId);
        socket.roomId = newRoomId;
        const randomQuote = targetQuotes[Math.floor(Math.random() * targetQuotes.length)];
        activeRooms[newRoomId] = {
          quote: randomQuote,
          status: "waiting", 
          players: {
            [socket.id]: { 
              isReady: false,
              wpm: 0,
              progress: 0,
              accuracy: 0
            }
          }
        };

        socket.emit('match_found', newRoomId);
        console.log(`Player ${socket.id} created new room: ${newRoomId}`);
      } 

    });
    
    socket.on('player_ready',(roomId)=>{

      if(activeRooms[roomId] && activeRooms[roomId].players && activeRooms[roomId].players[socket.id]){
        
        activeRooms[roomId].players[socket.id].isReady = true;
        const playersArr = Object.values(activeRooms[roomId].players);
        const allReady = playersArr.every(player => player.isReady);

        if(playersArr.length >=2 && allReady){

          const randomQuote = targetQuotes[Math.floor(Math.random() * targetQuotes.length)];
          io.to(roomId).emit('countdown_start');
          console.log(`All players ready in room: ${roomId}. Starting countdown...`)
          activeRooms[roomId].status = "playing";
          
          setTimeout(() => {
            io.to(roomId).emit('game_started', {
              roomId: roomId, 
              quote: randomQuote
            });
            console.log(`Game started in room: ${roomId}`);
          }, 5000);
        }
  
      }
    });


    socket.on('player_not_ready',(roomId)=>{
      if(activeRooms[roomId] && activeRooms[roomId].players && activeRooms[roomId].players[socket.id]){
        activeRooms[roomId].players[socket.id].isReady = false;
        let readyCount = 0;
        for(const playerId in activeRooms[roomId].players){
          if(activeRooms[roomId].players[playerId].isReady === true){
            readyCount++;
          }
        }
        io.to(roomId).emit('readyPlayers_count',readyCount);
      }
    })

    socket.on('typing_progress',(data)=>{
      console.log("Typing from:", socket.id, "Room:", data.roomId);
      socket.to(data.roomId).emit('opponent_progress', { 
        playerId: socket.id, 
        progress: data.progress 
      });
    })

    socket.on('live_updates',(data)=>{
      socket.to(data.roomId).emit('opponent_updates', { 
        playerId: socket.id, 
        currWPM: data.currWPM, 
        currAccuracy: data.currAccuracy 
      });
    });

    socket.on('race_finished',(data)=>{
      console.log(`Server says: Race finished in room: ${data.roomId}`);
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