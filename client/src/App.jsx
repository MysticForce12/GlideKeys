import { useEffect, useRef, useState } from 'react';
import { useSocket } from './context/SocketContext';
import Header from './components/layout/Header';
import Home from './pages/Home';
import Lobby from './pages/Lobby';
import Arena from './pages/Arena';
import Results from './pages/Results';

function App(){
  
  //game states
  const [gameState, setGameState] = useState("Home");
  const [countdown, setCountdown] = useState(5);
  const [startTime, setStartTime] = useState(null);

  //data states
  const [myWPM, setMyWPM] = useState(0);
  const [opponentWPM, setOpponentWPM] = useState(0);
  const [roomId, setroomId] = useState("");
  const [targetText, setTargetText] = useState("");
  const [opponentLeft, setOpponentLeft] = useState(false);

  const socket = useSocket();

  useEffect(()=>{

    socket.on('connect',()=>{
      console.log('connected');
    })

    socket.on('match_found',(roomId)=>{
      setroomId(roomId);
      setGameState("lobby");
      console.log('Match found in room: ', roomId);
    })

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

    socket.on('game_started',(gameData)=>{
      setTargetText(gameData.quote);
      setGameState("playing");
      setStartTime(Date.now());
    });

    socket.on('opponent_finished',(wpm)=>{
      setOpponentWPM(wpm);
    })

    socket.on('opponent_left',()=>{
      setOpponentLeft(true);
    });

    return()=>{
      socket.off('connect');
      socket.off('match_found');
      socket.off('countdown_start');
      socket.off('game_started');
      socket.off('opponent_finished');
      socket.off('opponent_left');
    }
  },[]);

  const handlePlay = () => {
    socket.emit('find_match');
    setGameState("searching");
  }
  

  const handlePlayAgain = () => {
    setMyWPM(0);
    setOpponentWPM(0);
    setTargetText("");
    setOpponentLeft(false);
    setGameState("lobby");
  };

  const handleExit = () =>{
    setroomId("");
    setMyWPM(0);
    setOpponentWPM(0);
    setTargetText("");
    setGameState("Home");
    socket.emit('leave_room', {roomId});
  }

  return(
    //outermost container
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
          opponentLeft={opponentLeft}
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
          setGameState={setGameState}
        />
      )}

      {gameState === "results" && (
        <Results 
          myWPM={myWPM}
          opponentWPM={opponentWPM}
          handleExit={handleExit}
          handlePlayAgain={handlePlayAgain}
          opponentLeft={opponentLeft}
        />
      )}

    </div>
  );
}

export default App;