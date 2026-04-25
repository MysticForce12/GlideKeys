import { useEffect, useState } from 'react';
import { useSocket } from '../context/SocketContext';
import Header from '../components/layout/Header';
import Home from './Home'
import Lobby from './Lobby';
import Arena from './Arena';
import Results from './Results';

function GameDashboard(){

  const [gameState, setGameState] = useState("Home");
  const [countdown, setCountdown] = useState(5);
  const [startTime, setStartTime] = useState(null);
  const [livePlayers, setLivePlayers] = useState({});
  const [finalResults, setFinalResults] = useState(null);

  const [myWPM, setMyWPM] = useState(0);
  const [roomId, setroomId] = useState("");
  const [targetText, setTargetText] = useState("");

  const socket = useSocket();

  useEffect(()=>{

    socket.on('connect',()=>{
      console.log('connected');
    })

    socket.on('match_found',({roomId, playersInRoom})=>{
      setroomId(roomId);
      setLivePlayers(playersInRoom);
      setGameState("lobby");
      console.log('Match found in room: ', roomId);
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

  const handlePlay = () => {
    socket.emit('find_match',);
    setGameState("searching");
  }
  

  const handlePlayAgain = () => {
    setTargetText("");
    setGameState("lobby");
    if(socket){
      socket.emit('play_again', {roomId});
    }
  };

  const handleExit = () => {
    setroomId("");
    setMyWPM(0);
    setTargetText("");
    setGameState("Home");
    socket.emit('leave_room', {roomId});
  }

  return(

    <div className="min-h-screen bg-[#0d1117] text-white font-sans p-8">

      <Header gameState={gameState}/>

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
          finalPlayers={finalResults}
          handleExit={handleExit}
          handlePlayAgain={handlePlayAgain}
        />
      )}

    </div>
  );
}

export default GameDashboard;