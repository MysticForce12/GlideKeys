import { useEffect, useState } from 'react';
import { useSocket } from '../context/SocketContext';
import Header from '../components/layout/Header';
import Home from './Home'
import Lobby from './Lobby';
import Arena from './Arena';
import Results from './Results';
import About from './About';
import Leaderboard from './Leaderboard';
import History from './History';
import api from '../utils/api';

function GameDashboard(){

  const [gameState, setGameState] = useState("Home");
  const [username, setUsername] = useState(() => localStorage.getItem('gk_username') || '');
  const [name,     setName]     = useState(() => localStorage.getItem('gk_name') || '');
  const [countdown, setCountdown] = useState(5);
  const [startTime, setStartTime] = useState(null);
  const [livePlayers, setLivePlayers] = useState({});
  const [finalResults, setFinalResults] = useState(null);

  const [myWPM, setMyWPM] = useState(0);
  const [roomId, setroomId] = useState("");
  const [targetText, setTargetText] = useState("");
  const [gameMode, setGameMode] = useState('arena');

  const socket = useSocket();

  useEffect(() => {
    api.get('/users/profile')
      .then(res => {
        const uname = res.data.username || '';
        const dname = res.data.name || '';
        setUsername(uname);
        setName(dname);
        localStorage.setItem('gk_username', uname);
        localStorage.setItem('gk_name', dname);
        localStorage.setItem('gk_avatarGradient', res.data.avatarGradient || 'purple-blue');
        if (res.data._id) {
            localStorage.setItem('gk_userId', res.data._id);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(()=>{

    socket.on('connect',()=>{
      console.log('connected');
    })

    socket.on('match_found',({roomId, playersInRoom, mode})=>{
      setroomId(roomId);
      setLivePlayers(playersInRoom);
      if(mode) setGameMode(mode);
      if(mode === 'solo'){
        console.log('Solo match found, waiting for countdown...');
      } else {
        setGameState("lobby");
      }
      console.log('Match found in room: ', roomId, 'mode:', mode);
    });

    socket.on('player_joined_room', ({ playerId, playerData }) => {
        setLivePlayers(prev => ({
            ...prev,
            [playerId]: playerData
        }));
    });

    socket.on('player_ready_status', ({ playerId, isReady }) => {
        setLivePlayers(prev => ({
            ...prev,
            [playerId]: { ...prev[playerId], isReady: isReady }
        }));
    });

    socket.on('opponent_left', ({ playerId }) => {
        setLivePlayers(prev => {
            const updated = { ...prev };
            delete updated[playerId];
            return updated;
        });
    });

    socket.on('countdown_start',()=>{
      setGameState("countdown");
      let time = 5;
      setCountdown(time);
      const interval = setInterval(() => {
        time -= 1;
        setCountdown(time);
        if (time <= 0) clearInterval(interval);
      }, 1000);
    })

    socket.on('game_started',({quote})=>{
      setTargetText(quote);
      setGameState("playing");
      setStartTime(Date.now());
    });

    socket.on('opponent_finished',({playerId, wpm})=>{
      setLivePlayers(prevPlayers =>({
        ...prevPlayers,
        [playerId]:{
          ...prevPlayers[playerId],
          wpm: wpm
        }
      }))
    });

    socket.on('player_reset',({playerId, playerData})=>{
      setLivePlayers(prev => ({
        ...prev,
        [playerId]: playerData
      }));
    });

    socket.on('race_ended', ({finalPlayers}) => {
      setFinalResults(finalPlayers);
      setGameState("results");
    });


    return()=>{
      socket.off('connect');
      socket.off('match_found');
      socket.off('countdown_start');
      socket.off('game_started');
      socket.off('opponent_finished');
      socket.off('player_joined_room');
      socket.off('player_ready_status');
      socket.off('opponent_left');
      socket.off('race_ended');
    }
  },[]);

  const handlePlay = (mode) => {
    const dbUserId = localStorage.getItem('gk_userId'); 
    const token = localStorage.getItem('token');
    const clientName = localStorage.getItem('gk_name') || localStorage.getItem('gk_username') || '';
    const clientAvatar = localStorage.getItem('gk_avatarGradient') || 'purple-blue';
    setGameMode(mode);
    socket.emit('find_match', { userId: dbUserId, token, mode, clientName, clientAvatar });
    setGameState("searching");
  }
  

  const handlePlayAgain = () => {
    setTargetText("");
    if(socket){
      socket.emit('play_again', {roomId});
    }
    if(gameMode === 'solo'){
      setGameState("searching");
    } else {
      setGameState("lobby");
    }
  };

  const handleExit = () => {
    setroomId("");
    setMyWPM(0);
    setTargetText("");
    setGameMode('arena');
    setGameState("Home");
    socket.emit('leave_room', {roomId});
  }

  return(

    <div className="min-h-screen bg-[#0d1117] text-white font-sans p-8">

      <Header gameState={gameState} setGameState={setGameState} username={username} name={name}/>

      {gameState === "Home" && (
        <Home handlePlay={handlePlay}/>
      )}

      {gameState === "searching" && (
        <div className="flex flex-col items-center justify-center mt-32 space-y-6">
          <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
          <h2 className="text-2xl font-semibold text-blue-400 animate-pulse">Searching for opponent...</h2>
        </div>
      )}
      
 
      {gameState === "lobby" && (
        <Lobby 
          roomId={roomId} 
          handleExit={handleExit}
          livePlayers={livePlayers}
          setLivePlayers={setLivePlayers}
          gameMode={gameMode}
        />
      )}

      {gameState === "countdown" && (
        <div className="flex flex-col items-center justify-center mt-32">
          <h2 className="text-2xl text-gray-400 uppercase tracking-widest mb-4 font-semibold">Get Ready</h2>
          <div className="text-9xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-600 animate-pulse drop-shadow-2xl">
            {countdown}
          </div>
        </div>
      )}

      {gameState === "playing" && (
        <Arena 
          targetText={targetText}
          roomId={roomId}
          gameState={gameState}
          startTime={startTime}
          setMyWPM={setMyWPM}
          livePlayers={livePlayers}
        />
      )}

      {gameState === "results" && (
        <Results 
          myWPM={myWPM}
          myName={name}
          finalPlayers={finalResults}
          handleExit={handleExit}
          handlePlayAgain={handlePlayAgain}
        />
      )}

      {gameState === "about" && (
        <About onBack={() => setGameState("Home")} />
      )}

      {gameState === "leaderboard" && (
        <Leaderboard onBack={() => setGameState("Home")} />
      )}

      {gameState === "history" && (
        <History onBack={() => setGameState("Home")} />
      )}

    </div>
  );
}

export default GameDashboard;