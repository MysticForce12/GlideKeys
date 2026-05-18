const express = require('express');
const http = require('http');
const jwt = require('jsonwebtoken');
const { Server } = require("socket.io");
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();
const server = http.createServer(app);

require('dotenv').config();
const connectDB = require('./config/db');
connectDB();

const User = require('./models/User');

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

const PORT = process.env.PORT || 3000;

const targetQuotes = [
  "even than mean place move high world person",
  "back a in large nation on show under way both to only want call word move under just move have out just who back too stand",
  "hand do all want she nation large by say hold world govern this into to even make problem one house consider not place point not",
  "never before seem then great nation back same in person not here might change as great leave without against right time ",
  "now at for never other face what public where under the that many since these plan seem about end fact place child through time get consider high make no will school look follow over back how know"
];

let waitingPlayer = null;
const activeRooms = {};
const roomCapacity = 5;

const checkRaceCompletion = async (roomId) => {

  const room = activeRooms[roomId];
  console.log(`[checkRaceCompletion] roomId=${roomId}, status=${room?.status}`);
  if (!room || room.status !== "playing") {
    console.log(`[checkRaceCompletion] EARLY RETURN — room missing or not playing`);
    return;
  }

  const currentPlayers = Object.values(room.players);
  console.log(`[checkRaceCompletion] Players:`, currentPlayers.map(p => ({
    dbUserId: p.dbUserId,
    isFinished: p.isFinished,
    wpm: p.wpm
  })));

  const allFinished = currentPlayers.length && currentPlayers.every(player => player.isFinished);
  console.log(`[checkRaceCompletion] allFinished=${allFinished}, count=${currentPlayers.length}`);

  // if everyone finished
  if (allFinished) {
    room.status = "finished";

    try {
      let maxWpmInRoom = 0;
      for (const p of currentPlayers) {
        if (p.wpm > maxWpmInRoom) maxWpmInRoom = p.wpm;
      }
      //update the stats of each player
      for (let playerId in room.players) {
        const playerStats = room.players[playerId];
        room.players[playerId].isReady = false;
        console.log(`[DB Update] playerId=${playerId}, dbUserId=${playerStats.dbUserId}, wpm=${playerStats.wpm}`);

        if (playerStats.dbUserId) {
          const isWinner = (playerStats.wpm === maxWpmInRoom) && (currentPlayers.length > 1);
          const user = await User.findById(playerStats.dbUserId);
          console.log(`[DB Update] found user=${user?.username}, isWinner=${isWinner}`);

          if (user) {
            // Populate the user's name and avatar
            room.players[playerId].name = user.name || user.username || null;
            room.players[playerId].avatarGradient = user.avatarGradient || 'purple-blue';

            const oldTotal = user.totalMatches || 0;
            const oldAvg = user.avgWPM || 0;
            const newTotal = oldTotal + 1;

            const newAvgWPM = Math.round(((oldAvg * oldTotal) + playerStats.wpm) / newTotal);
            const newMaxWPM = Math.max(user.maxWPM || 0, playerStats.wpm);

            const newWins = isWinner ? (user.wins || 0) + 1 : (user.wins || 0);

            let updateFields = {
              avgWPM: newAvgWPM,
              maxWPM: newMaxWPM,
              totalMatches: newTotal,
              wins: newWins
            };

            if (room.mode !== 'solo' && playerStats.wpm > (user.bestRaceWPM || 0)) {
              updateFields.bestRaceWPM = playerStats.wpm;
              updateFields.bestRaceMode = room.mode;
              updateFields.bestRaceDate = new Date();
            }

            await User.findByIdAndUpdate(playerStats.dbUserId, updateFields);

            console.log(`Db update Saved user: ${user.username}, totalMatches: ${newTotal}, avgWPM: ${newAvgWPM}, wins: ${newWins}`);
          }
        } else {
          console.log(`Db update Skipped ... no dbUserId for playerId=${playerId}`);
        }
      }
    } catch (error) {
      console.error("Db error updating player stats:", error);
    }
    io.to(roomId).emit('race_ended', {
      finalPlayers: room.players
    });
  }
};

io.on('connection', async (socket) => {

  try {
    const token = socket.handshake.auth?.token;
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.dbUserId = decoded.id;
      try {
        const user = await User.findById(decoded.id).select('name username avatarGradient');
        socket.playerName = user?.name || user?.username || null;
        socket.avatarGradient = user?.avatarGradient || 'purple-blue';
      } catch (err) {
        socket.playerName = null;
      }
      console.log(`A user connected: socket=${socket.id} dbUserId=${socket.dbUserId} name=${socket.playerName}`);
    } else {
      console.log(`A user connected (no token): socket=${socket.id}`);
    }
  } catch (e) {
    console.log(`A user connected (invalid token): socket=${socket.id}`);
  }

  socket.on('find_match', async (data) => {

    let userId = socket.dbUserId || null;
    let decodedUsername = null;

    if (!userId && data && data.token) {
      try {
        const decoded = jwt.verify(data.token, process.env.JWT_SECRET);
        userId = decoded.id;
        socket.dbUserId = decoded.id;
        decodedUsername = decoded.username;
        console.log(`[find_match] Decoded token: userId=${userId}, username=${decodedUsername}`);
      } catch (e) {
        console.error("[find_match] Invalid token provided by client");
      }
    }

    if (!userId && data && data.userId && data.userId !== "undefined" && data.userId !== "null") {
      userId = data.userId;
    }

    if (userId) {
      try {
        const user = await User.findById(userId).select('name username avatarGradient');
        if (user) {
          socket.playerName = user.name || user.username || decodedUsername || data.clientName || null;
          socket.avatarGradient = user.avatarGradient || data.clientAvatar || 'purple-blue';
          console.log(`[find_match] DB Lookup success: name=${socket.playerName}, gradient=${socket.avatarGradient}`);
        } else {
          console.log(`[find_match] DB Lookup returned null for userId=${userId}`);
          socket.playerName = decodedUsername || data.clientName || null;
          socket.avatarGradient = data.clientAvatar || 'purple-blue';
        }
      } catch (err) {
        console.error(`[find_match] Error fetching user ${userId}:`, err.message);
        socket.playerName = decodedUsername || data.clientName || null;
        socket.avatarGradient = data.clientAvatar || 'purple-blue';
      }
    } else {
      console.log(`[find_match] CRITICAL WARNING: userId is completely null for socket ${socket.id}`);
      socket.playerName = decodedUsername || data?.clientName || null;
      socket.avatarGradient = data?.clientAvatar || 'purple-blue';
    }

    const mode = (data && data.mode) ? data.mode : 'arena';
    console.log(`[find_match] socket=${socket.id} userId=${userId} mode=${mode}`);

    //determine desired capacity based on the mode
    let desiredCapacity = roomCapacity;
    if (mode === '1v1') desiredCapacity = 2;
    if (mode === 'solo') desiredCapacity = 1;

    let roomToJoin = null;

    for (const roomId in activeRooms) {
      const room = activeRooms[roomId];
      const currPlayersCount = Object.keys(room.players).length;
      if (room.mode === mode && (room.status === "waiting" || room.status === "finished") && currPlayersCount < desiredCapacity) {
        roomToJoin = roomId;
        break;
      }
    }

    if (roomToJoin) {
      socket.join(roomToJoin);
      socket.roomId = roomToJoin;

      activeRooms[roomToJoin].players[socket.id] = {
        dbUserId: userId,
        name: socket.playerName || null,
        avatarGradient: socket.avatarGradient || 'purple-blue',
        isReady: false,
        isFinished: false,
        wpm: 0,
        progress: 0,
        accuracy: 0
      };

      socket.emit('match_found', {
        roomId: roomToJoin,
        playersInRoom: activeRooms[roomToJoin].players,
        mode: mode
      });

      io.to(roomToJoin).emit('player_joined_room', {
        playerId: socket.id,
        playerData: activeRooms[roomToJoin].players[socket.id]
      });

      console.log(`Player ${socket.id} joined existing ${mode} room: ${roomToJoin}`);

      if (mode === 'solo') {
        const randomQuote = activeRooms[roomToJoin].quote;
        io.to(roomToJoin).emit('countdown_start');
        activeRooms[roomToJoin].status = "playing";
        setTimeout(() => {
          io.to(roomToJoin).emit('game_started', { quote: randomQuote });
          console.log(`Solo game started in room: ${roomToJoin}`);
        }, 5000);
      }
    }
    else {

      const newRoomId = `room_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

      socket.join(newRoomId);
      socket.roomId = newRoomId;

      const randomQuote = targetQuotes[Math.floor(Math.random() * targetQuotes.length)];
      const roomStatus = mode === 'solo' ? 'playing' : 'waiting';
      activeRooms[newRoomId] = {
        quote: randomQuote,
        status: roomStatus,
        mode: mode,
        players: {
          [socket.id]: {
            dbUserId: userId,
            name: socket.playerName || null,
            avatarGradient: socket.avatarGradient || 'purple-blue',
            isFinished: false,
            isReady: false,
            wpm: 0,
            progress: 0,
            accuracy: 0
          }
        }
      };

      socket.emit('match_found', {
        roomId: newRoomId,
        playersInRoom: activeRooms[newRoomId].players,
        mode: mode
      });
      console.log(`Player ${socket.id} created new ${mode} room: ${newRoomId}`);

      if (mode === 'solo') {
        io.to(newRoomId).emit('countdown_start');
        setTimeout(() => {
          io.to(newRoomId).emit('game_started', { quote: randomQuote });
          console.log(`Solo game started in room: ${newRoomId}`);
        }, 5000);
      }
    }

  });

  socket.on('player_ready', (roomId) => {

    if (activeRooms[roomId] && activeRooms[roomId].players && activeRooms[roomId].players[socket.id]) {

      activeRooms[roomId].players[socket.id].isReady = true;

      io.to(roomId).emit('player_ready_status', {
        playerId: socket.id,
        isReady: true
      });

      const playersArr = Object.values(activeRooms[roomId].players);
      const allReady = playersArr.every(player => player.isReady);

      if (playersArr.length >= 2 && allReady) {

        for (let pId in activeRooms[roomId].players) {
          activeRooms[roomId].players[pId].wpm = 0;
          activeRooms[roomId].players[pId].progress = 0;
          activeRooms[roomId].players[pId].accuracy = 0;
          activeRooms[roomId].players[pId].isFinished = false;
        }

        const randomQuote = targetQuotes[Math.floor(Math.random() * targetQuotes.length)];
        io.to(roomId).emit('countdown_start');
        console.log(`All players ready in room: ${roomId}. Starting countdown...`)
        activeRooms[roomId].status = "playing";

        setTimeout(() => {
          io.to(roomId).emit('game_started', {
            quote: randomQuote
          });
          console.log(`Game started in room: ${roomId}`);
        }, 5000);
      }

    }
  });

  socket.on('player_not_ready', (roomId) => {
    if (activeRooms[roomId] && activeRooms[roomId].players && activeRooms[roomId].players[socket.id]) {
      activeRooms[roomId].players[socket.id].isReady = false;

      io.to(roomId).emit('player_ready_status', {
        playerId: socket.id,
        isReady: false
      });
    }
  })

  socket.on('typing_progress', (data) => {
    console.log("Typing from:", socket.id, "Room:", data.roomId);
    socket.to(data.roomId).emit('opponent_progress', {
      playerId: socket.id,
      progress: data.progress
    });
  })

  socket.on('live_updates', (data) => {
    socket.to(data.roomId).emit('opponent_updates', {
      playerId: socket.id,
      currWPM: data.currWPM,
      currAccuracy: data.currAccuracy
    });
  });

  socket.on('player_finished', ({ roomId, currWPM }) => {
    console.log(`Server says: Race finished in room: ${roomId}`);

    if (activeRooms[roomId] && activeRooms[roomId].players && activeRooms[roomId].players[socket.id]) {
      activeRooms[roomId].players[socket.id].wpm = currWPM;
      activeRooms[roomId].players[socket.id].isFinished = true;
      socket.to(roomId).emit('opponent_finished', {
        playerId: socket.id,
        wpm: currWPM
      });
    }

    checkRaceCompletion(roomId);

  });

  socket.on('play_again', ({ roomId }) => {

    if (activeRooms[roomId] && activeRooms[roomId].players) {
      const roomMode = activeRooms[roomId].mode;

      activeRooms[roomId].players[socket.id].isReady = false;
      activeRooms[roomId].players[socket.id].isFinished = false;
      activeRooms[roomId].players[socket.id].wpm = 0;
      activeRooms[roomId].players[socket.id].progress = 0;
      activeRooms[roomId].players[socket.id].accuracy = 0;

      if (roomMode === 'solo') {
        const randomQuote = targetQuotes[Math.floor(Math.random() * targetQuotes.length)];
        activeRooms[roomId].quote = randomQuote;
        activeRooms[roomId].status = "playing";

        io.to(roomId).emit('player_reset', {
          playerId: socket.id,
          playerData: activeRooms[roomId].players[socket.id]
        });

        io.to(roomId).emit('countdown_start');
        setTimeout(() => {
          io.to(roomId).emit('game_started', { quote: randomQuote });
          console.log(`Solo game restarted in room: ${roomId}`);
        }, 5000);
      } else {
        activeRooms[roomId].status = "waiting";

        io.to(roomId).emit('player_reset', {
          playerId: socket.id,
          playerData: activeRooms[roomId].players[socket.id]
        });
      }
    }
  });

  socket.on('leave_room', ({ roomId }) => {

    if (activeRooms[roomId] && activeRooms[roomId].players && activeRooms[roomId].players[socket.id]) {

      socket.leave(roomId);
      delete activeRooms[roomId].players[socket.id];
      socket.roomId = null;

      io.to(roomId).emit('opponent_left', {
        playerId: socket.id
      });
      console.log(`Player ${socket.id} left room: ${roomId}`);

      if (Object.keys(activeRooms[roomId].players).length === 0) {
        delete activeRooms[roomId];
        console.log(`Room ${roomId} is empty and was deleted.`);
      }
      else if (activeRooms[roomId].status === "playing") {
        checkRaceCompletion(roomId);
      }

    }
  })

  socket.on('disconnect', () => {

    console.log('user disconnected', socket.id);
    const roomId = socket.roomId;

    if (roomId && activeRooms[roomId] && activeRooms[roomId].players[socket.id]) {
      delete activeRooms[roomId].players[socket.id];
      io.to(roomId).emit('opponent_left', { playerId: socket.id });

      if (Object.keys(activeRooms[roomId].players).length === 0) {
        delete activeRooms[roomId];
        console.log(`Room ${roomId} deleted after disconnect.`);
      }
      else if (activeRooms[roomId].status === "playing") {
        checkRaceCompletion(roomId);
      }
      if (waitingPlayer === socket) {
        waitingPlayer = null;
      }
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});