import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

function App(){
  //game states
  const [gameState, setGameState] = useState("searching");
  const [countdown, setCountdown] = useState(5);
  const [startTime, setStartTime] = useState(null);
  //data states
  const [userInput,setuserInput] = useState("");
  const [roomId, setroomId] = useState("");
  const [targetText, setTargetText] = useState("");
  const [opponentProgress, setOpponentProgress] = useState(0);
  
  const socketRef = useRef(null);

  useEffect(()=>{
    socketRef.current = io('http://localhost:3000');

    socketRef.current.on('match_found',(roomId)=>{
      setroomId(roomId);
      setGameState("lobby");
      console.log('Match found in room: ', roomId);
    })

    socketRef.current.on('countdown_start',()=>{
      setGameState("countdown");
      let time = 5;
      setCountdown(time);
      const interval = setInterval(() => {
        time -= 1;
        setCountdown(time);
        if (time <= 0) clearInterval(interval);
      }, 1000);
    })

    socketRef.current.on('game_started',(gameData)=>{
      setTargetText(gameData.quote);
      setGameState("playing");
      setStartTime(Date.now());
      setuserInput("");
    });

    socketRef.current.on('opponent_progress',(progress)=>{
      setOpponentProgress(progress);
    });
    //cleanup function 
    return()=>{
      socketRef.current.disconnect();
      console.log('disconnected');
    }
  },[]);

  const handleReady = () => {
    socketRef.current.emit('player_ready', { roomId });
  }

  const handleTyping = (e) => {
    const newText = e.target.value;
    setuserInput(newText);
    if (targetText.startsWith(newText)) {
      const progress = (newText.length/targetText.length)*100;
      const roundedProgress = Math.floor(progress);
      socketRef.current.emit("typing_progress", { roomId, progress: roundedProgress });
      if(roundedProgress === 100){
        const endTime = Date.now();
        const elapsedTime = (endTime-startTime)/60000;
        const wpm = Math.round((targetText.length / 5) / elapsedTime);
        alert("Race Finished! Your WPM: " + wpm);
      }
    } 
  };

  return(
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Custom Typing Game</h1>

      {gameState === "searching" && (
        <h2 style={{backgroundColor: 'grey', textAlign: 'center'}}>Waiting for an opponent to join...</h2>
      )}
      
      {gameState === "lobby" && (
        <div>
          <h2 style={{backgroundColor: 'green', textAlign: 'center'}}>Match Found!</h2>
          <button onClick={handleReady} style={{ padding: '10px 20px', fontSize: '18px' }}>
            I am Ready!
          </button>
        </div>
      )}

      {gameState === "countdown" && (
        <h2>Game starts in... {countdown}</h2>
      )}

      {gameState === "playing" && (
        <div>
          <div style={{ marginBottom: '20px', fontSize: '20px', backgroundColor: '#0c0606', padding: '10px' }}>
            {targetText}
          </div>
          
          <textarea 
            name="userInput" 
            value={userInput} 
            id="inputBox" 
            onChange={handleTyping}
            style={{ width: '100%', height: '100px', fontSize: '18px' }}
          ></textarea>
          
          <h3 style={{ color: 'red' }}>Opponent Progress: {opponentProgress}%</h3>
          
          <h3 style={{ color: 'lightgreen' }}>Your Progress: {Math.floor((userInput.length / targetText.length) * 100 || 0)}%</h3>
        </div>
      )}

    </div>
  );
}

export default App;