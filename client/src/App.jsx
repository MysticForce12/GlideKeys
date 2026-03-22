
import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

function App(){
  
  //game states
  const [gameState, setGameState] = useState("Home");
  const [countdown, setCountdown] = useState(5);
  const [startTime, setStartTime] = useState(null);

  //data states
  const [roomId, setroomId] = useState("");
  const [userInput,setuserInput] = useState("");
  const [targetText, setTargetText] = useState("");
  const [opponentProgress, setOpponentProgress] = useState(0);
  const [readyPlayers, setReadyPlayers] = useState(0);
  const [isReadyClicked, setIsReadyClicked] = useState(false);

  const [liveWPM, setLiveWPM] = useState(0);
  const [liveAccuracy, setLiveAccuracy] = useState(0);
  const [myWPM, setMyWPM] = useState(0);
  const [opponentLiveAccuracy, setOpponentLiveAccuracy] = useState(0);
  const [opponentLiveWPM, setOpponentLiveWPM] = useState(0);
  const [opponentWPM, setOpponentWPM] = useState(0);
  const [opponentLeft, setOpponentLeft] = useState(false);
  
  const socketRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(()=>{
    if(gameState === "playing" && inputRef.current){
      inputRef.current.focus();
    }
  },[gameState]);

  useEffect(()=>{
    socketRef.current = io('http://localhost:3000');

    socketRef.current.on('match_found',(roomId)=>{
      setroomId(roomId);
      setGameState("lobby");
      console.log('Match found in room: ', roomId);
    })
    
    socketRef.current.on('readyPlayers_count',(count)=>{
      setReadyPlayers(count);
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
      setReadyPlayers(0);
      setIsReadyClicked(false);
      setStartTime(Date.now());
      setuserInput("");
    });

    socketRef.current.on('opponent_progress',(progress)=>{
      setOpponentProgress(progress);
    });

    socketRef.current.on('opponent_updates',(data)=>{
      setOpponentLiveWPM(data.liveWPM);
      setOpponentLiveAccuracy(data.liveAccuracy);
    })

    socketRef.current.on('opponent_finished',(wpm)=>{
      setOpponentWPM(wpm);
    })

    socketRef.current.on('opponent_left',()=>{
      setOpponentLeft(true);
    })

    //cleanup function 
    return()=>{
      socketRef.current.disconnect();
      console.log('disconnected');
    }
  },[]);

  const handlePlay = () => {
    setOpponentLeft(false);
    socketRef.current.emit('find_match');
    setGameState("searching");
  }

  const handleReady = () => {
    if(isReadyClicked === false){
      setIsReadyClicked(true);
      socketRef.current.emit('player_ready', { roomId });
    }
    else{
      setIsReadyClicked(false);
      socketRef.current.emit('player_not_ready', { roomId });
    }
  }
  
  const handleTyping = (e) => {
    
    const newText = e.target.value;
    setuserInput(newText);
    
    const correctChars = newText.split('').filter((char, index) => char === targetText[index]);
    if(correctChars.length > 0){
      const accuracy = (correctChars.length / newText.length) * 100;
      setLiveAccuracy(accuracy);
      const endTime = Date.now();
      const elapsedTime = (endTime-startTime)/60000;
      if(elapsedTime > 0.03){
        const wpm = Math.round((correctChars.length/5)/elapsedTime);
        setLiveWPM(wpm);
      }
    }

    socketRef.current.emit('live_updates',{roomId, liveWPM, liveAccuracy});

    if (targetText.startsWith(newText)) {
      const progress = (newText.length/targetText.length)*100;
      const roundedProgress = Math.floor(progress);
      socketRef.current.emit("typing_progress", { roomId, progress: roundedProgress });
      
      if(roundedProgress === 100){
        setMyWPM(liveWPM);
        setGameState("results");
        console.log("in handle typing rounded progress liveWPM : ",liveWPM);
        socketRef.current.emit("race_finished",{roomId, liveWPM});
      }
    } 
  };
  
  const handleKeyDown =(e) =>{
    if(e.key.startsWith('Arrow')){
      e.preventDefault();
      return;
    }
    if(e.key === 'Backspace'){
      const isPerfectText = targetText.startsWith(userInput);
      if(isPerfectText){
        e.preventDefault();
      }
    }
  }

  const handlePlayAgain = () => {
    setMyWPM(0);
    setOpponentWPM(0);
    setLiveAccuracy(0);
    setLiveWPM(0);
    setOpponentLiveAccuracy(0);
    setOpponentLiveWPM(0);
    setuserInput("");
    setTargetText("");
    setOpponentProgress(0);
    setOpponentLeft(false);
    setGameState("lobby");
  };

  const handleExit = () =>{
    setroomId("");
    setMyWPM(0);
    setLiveAccuracy(0);
    setLiveWPM(0);
    setOpponentLiveAccuracy(0);
    setOpponentLiveWPM(0);
    setOpponentWPM(0);
    setuserInput("");
    setTargetText("");
    setOpponentProgress(0);
    setGameState("Home");
    socketRef.current.emit('leave_room', {roomId});
  }

  return(
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Custom Typing Game</h1>

      {gameState === "Home" && (
        <div>
          <div>Welcome to the typing game!</div>
          <button onClick={handlePlay}>Play</button>
        </div>
      )}

      {gameState === "searching" && (
        <h2 style={{backgroundColor: 'grey', textAlign: 'center'}}>Waiting for an opponent to join...</h2>
      )}
      
      {gameState === "lobby" && (
        <div>
          <h2 style={{backgroundColor: 'green', textAlign: 'center'}}>Lobby!</h2>
          <div>Room ID: {roomId}</div>
          <div>Ready : {readyPlayers}</div>
          {opponentLeft === true && (
            <div>
              {`Opponent left the room :<`}
            </div>
          )}
          <button onClick={handleReady} style={{ padding: '10px 20px', fontSize: '18px' }}>
            I am Ready!
          </button>
          <button style={{ padding: '10px 20px', fontSize: '18px' }} onClick={handleExit}>Exit Room</button>
        </div>
      )}

      {gameState === "countdown" && (
        <h2>Game starts in... {countdown}</h2>
      )}

      {gameState === "playing" && (
        <div>
          <div style={{ marginBottom: '20px', fontSize: '24px', backgroundColor: '#1e1e1e', padding: '20px', borderRadius: '10px', lineHeight: '1.5', userSelect: 'none' }} onClick={() => inputRef.current && inputRef.current.focus()}>
            {targetText.split('').map((char, index)=>{  
              let textColor = '#bbbbbb'; 
              let bgColor = 'transparent';
              if(index < userInput.length){
                if(userInput[index] === char){
                  textColor = 'lightgreen';
                }
                else{
                  textColor = 'red';
                  bgColor = '#4a0000';
                }
              }
              if (index === userInput.length) {
                bgColor = '#444444'; 
              }
              return (
                <span key={index} style={{ color: textColor, backgroundColor: bgColor, borderRadius: '3px' }}>
                  {char}
                </span>
              );
            })}
          </div>
          
          <textarea 
            ref={inputRef}
            name="userInput" 
            value={userInput} 
            id="inputBox" 
            onChange={handleTyping}
            onKeyDown={handleKeyDown}
            style={{ position: 'absolute', opacity: 0, height: 0, width: 0 }}
          ></textarea>
          
          <div>
            <h3 style={{ color: 'lightgreen' }}>Your Progress: {Math.floor((userInput.length / targetText.length) * 100 || 0)}%</h3>
            <div>Your WPM: {liveWPM}</div>
            <div>Accuracy: {liveAccuracy.toFixed(2)}%</div>
          </div>
          <div>
            <h3 style={{ color: 'red' }}>Opponent Progress: {opponentProgress}%</h3>
            <div>Opponent WPM: {opponentLiveWPM}</div>
            <div>Opponent Accuracy: {opponentLiveAccuracy.toFixed(2)}%</div>
          </div>
          
        </div>
      )}

      {gameState === "results" && (
        <div>
          <div>Results : </div>
          <div>Your WPM: {myWPM}</div>
          {opponentLeft === false && (<div>Opponent's WPM: {opponentWPM > 0 ? `${opponentWPM}` : "Typing..."}</div>)}
          {opponentLeft === true && (
            <div>
              {`Opponent left the room :<`}
            </div>
          )}
          <button style={{ color: 'grey' }} onClick={handlePlayAgain}>Play Again</button>
          <button style={{ color: 'grey' }} onClick={handleExit}>Exit</button>
        </div>
      )}

    </div>
  );
}

export default App;