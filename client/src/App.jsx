import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import Confetti from 'react-confetti';

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
  const currWPMRef = useRef(0);
  const currAccuracyRef = useRef(0);


  useEffect(()=>{
    if(gameState === "playing" && inputRef.current){
      inputRef.current.focus();
    }
  },[gameState]);

  useEffect(()=>{

    const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';
    socketRef.current = io(SERVER_URL);

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
      setOpponentLiveWPM(data.currWPM);
      setOpponentLiveAccuracy(data.currAccuracy);
    })

    socketRef.current.on('opponent_finished',(wpm)=>{
      setOpponentWPM(wpm);
    })

    socketRef.current.on('opponent_left',()=>{
      setOpponentLeft(true);
    })

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
    
    const newText = e.target.value.replace(/\u00A0/g, " ").replace(/\s+/g, " ");
    setuserInput(newText);

    const correctChars = newText.split('').filter((char, index) => char === targetText[index]);
    if(correctChars.length > 0){
      currAccuracyRef.current = (correctChars.length / newText.length) * 100;
      setLiveAccuracy(currAccuracyRef.current);
      const endTime = Date.now();
      const elapsedTime = (endTime-startTime)/60000;
      if(elapsedTime > 0.03){
        currWPMRef.current = Math.round((correctChars.length/5)/elapsedTime);
        setLiveWPM(currWPMRef.current);
      }
      socketRef.current.emit('live_updates',{roomId, currWPM:currWPMRef.current, currAccuracy:currAccuracyRef.current});
    }

    const isValidText = newText.split('').every((char, i) => char === targetText[i]);

    if (isValidText) {
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
    //outermost container
    <div className="min-h-screen bg-[#0d1117] text-white font-sans p-8">
      {/**/}
      <div className="w-full max-w-5xl mx-auto flex justify-between items-center mb-12">
    
        <div className="flex items-center gap-3 cursor-default group">
          
          <div className="bg-gradient-to-br from-[#38bdf8] to-[#6366f1] p-2.5 rounded-xl shadow-[0_0_20px_rgba(56,189,248,0.4)] group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 ease-out">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white">
              <path d="M4 7h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2z"></path>
              <path d="M6 11h.01"></path><path d="M10 11h.01"></path><path d="M14 11h.01"></path><path d="M18 11h.01"></path>
              <path d="M8 15h8"></path>
            </svg>
          </div>

          {/*Game name & icon*/}
          <div className="flex flex-col">
            <h1 className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#38bdf8] via-[#818cf8] to-[#f472b6] drop-shadow-lg">
              Glide Keys
            </h1>
            <span className="text-xs font-mono text-gray-500 tracking-widest uppercase mt-0.5">
              Multiplayer Typing Arena
            </span>
          </div>

        </div>

        {/*status bar*/}
        <div className="hidden sm:flex items-center gap-2 bg-[#111620] border border-gray-700/50 px-4 py-2 rounded-full shadow-md">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-sm font-semibold text-gray-300 font-mono">
            {gameState === "playing" ? "Race in Progress" : "Server Online"}
          </span>
        </div>

      </div>

      {gameState === "Home" && (
        <div className="flex flex-col items-center justify-center mt-32 space-y-8 animate-fade-in">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-200 mb-3">Ready to Race?</h2>
            <p className="text-gray-400 text-lg">Compete against others in real-time typing battles.</p>
          </div>
          <button 
            onClick={handlePlay} 
            className="px-12 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xl font-bold rounded-full shadow-[0_0_20px_rgba(79,70,229,0.4)] hover:shadow-[0_0_30px_rgba(79,70,229,0.6)] hover:scale-105 transition-all duration-200">
            Find Match
          </button>
        </div>
      )}

      {gameState === "searching" && (
        <div className="flex flex-col items-center justify-center mt-32 space-y-6">
          <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
          <h2 className="text-2xl font-semibold text-blue-400 animate-pulse">Searching for opponent...</h2>
        </div>
      )}
      
 
      {gameState === "lobby" && (
        <div className="max-w-md mx-auto mt-20 bg-[#111620] border border-gray-700/50 rounded-2xl p-8 shadow-2xl flex flex-col items-center text-center relative overflow-hidden">
          <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-green-400 to-blue-500"></div>
          
          <div className="w-16 h-16 bg-green-500/10 text-green-400 rounded-full flex items-center justify-center text-3xl mb-4 border border-green-500/20">
            ✓
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Match Found!</h2>
          <div className="text-gray-400 font-mono mb-8 bg-black/40 px-4 py-2 rounded-lg border border-gray-800">
            Room: <span className="text-gray-300">{roomId}</span>
          </div>

          {opponentLeft ? (
            <div className="text-red-400 bg-red-900/20 px-4 py-3 rounded-lg mb-6 w-full border border-red-500/30">
              Opponent left the room.
            </div>
          ) : (
            <div className="mb-8 w-full">
              <div className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Players Ready</div>
              <div className="flex justify-center gap-3">
                <div className={`w-4 h-4 rounded-full transition-all duration-300 ${readyPlayers >= 1 ? 'bg-blue-400 shadow-[0_0_12px_rgba(96,165,250,0.8)]' : 'bg-gray-700'}`}></div>
                <div className={`w-4 h-4 rounded-full transition-all duration-300 ${readyPlayers === 2 ? 'bg-pink-400 shadow-[0_0_12px_rgba(244,114,182,0.8)]' : 'bg-gray-700'}`}></div>
              </div>
            </div>
          )}

          <div className="flex gap-4 w-full">
            <button onClick={handleExit} className="flex-1 px-4 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold rounded-xl transition-colors">
              Leave
            </button>
            <button 
              onClick={handleReady} 
              className={`flex-[2] px-4 py-3 font-bold rounded-xl transition-all duration-200 ${isReadyClicked ? 'bg-green-600/20 text-green-400 border border-green-500/50' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)] hover:scale-105'}`}
            >
              {isReadyClicked ? "Ready ✓" : "Click to Ready"}
            </button>
          </div>
        </div>
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
        <div className="max-w-5xl mx-auto flex flex-col gap-8">

          <div className="h-44 w-full flex flex-row items-center justify-between">
            
            <div className="w-[42%] h-full bg-[#0b1728] border border-blue-500/30 rounded-2xl p-5 flex flex-col justify-between shadow-[0_0_15px_rgba(59,130,246,0.15)]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">Y</div>
                <span className="text-xl font-bold tracking-wide">You</span>
                <span className="text-xs bg-slate-700 px-2 py-1 rounded text-gray-300 ml-2">YOU</span>
              </div>
              <div className="flex gap-8 mt-4">
                <div>
                  <div className="text-gray-500 text-sm font-semibold mb-1">WPM</div>
                  <div className="text-3xl font-extrabold text-blue-400">{liveWPM}</div>
                </div>
                <div>
                  <div className="text-gray-500 text-sm font-semibold mb-1">Accuracy</div>
                  <div className="text-3xl font-extrabold text-blue-400">{liveAccuracy.toFixed(1)}%</div>
                </div>
              </div>
            </div>

            <div className="text-5xl font-extrabold text-orange-500 italic drop-shadow-[0_0_10px_rgba(249,115,22,0.5)]">
              VS
            </div>

            <div className="w-[42%] h-full bg-[#1e0a1f] border border-pink-500/30 rounded-2xl p-5 flex flex-col justify-between shadow-[0_0_15px_rgba(236,72,153,0.15)]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-pink-500 text-white flex items-center justify-center font-bold">O</div>
                <span className="text-xl font-bold tracking-wide">Opponent</span>
              </div>
              <div className="flex gap-8 mt-4">
                <div>
                  <div className="text-gray-500 text-sm font-semibold mb-1">WPM</div>
                  <div className="text-3xl font-extrabold text-pink-400">{opponentLiveWPM}</div>
                </div>
                <div>
                  <div className="text-gray-500 text-sm font-semibold mb-1">Accuracy</div>
                  <div className="text-3xl font-extrabold text-pink-400">{opponentLiveAccuracy.toFixed(1)}%</div>
                </div>
              </div>
            </div>

          </div>


          <div className="w-full bg-[#111620] border border-gray-700/50 rounded-2xl p-6 flex flex-col gap-6 shadow-lg">
            <div className="text-center text-gray-400 font-semibold tracking-widest text-sm uppercase mb-2">
              Race Progress
            </div>

            <div className="flex items-center gap-4">
              <span className="text-blue-400 font-bold text-sm w-20">You</span>
              <div className="flex-1 bg-gray-800 rounded-full h-3">
                <div className="bg-[#38bdf8] h-full rounded-full shadow-[0_0_12px_rgba(56,189,248,0.8)] transition-all duration-150 ease-out relative"
                  style={{ width: `${targetText ? Math.min(Math.floor((userInput.length / targetText.length) * 100), 100) : 0}%` }}
                >
                  <div className="absolute -right-3 -top-2 text-xl">
                    🚀
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-pink-400 font-bold text-sm w-20">Opponent</span>
              <div className="flex-1 bg-gray-800 rounded-full h-3">

                <div className="bg-[#f472b6] h-full rounded-full shadow-[0_0_12px_rgba(244,114,182,0.8)] transition-all duration-150 ease-out relative"
                  style={{ width: `${opponentProgress}%` }}>
                  <div className="absolute -right-3 -top-2 text-xl">
                     🛸
                  </div>
                </div>
              </div>
            </div>

          </div>

          <div className="w-full bg-[#111620] border border-gray-700/50 rounded-2xl p-10 text-3xl leading-[1.7] font-mono shadow-lg cursor-text select-none relative overflow-hidden" onClick={() => inputRef.current && inputRef.current.focus()}>
            {targetText.split('').map((char, index) => {  
              let colorClass = 'text-slate-600'; 
              let bgClass = 'bg-transparent';
              
              if (index < userInput.length) {
                if (userInput[index] === char) {
                  colorClass = 'text-teal-400'; 
                } else {
                  colorClass = 'text-red-400'; 
                  bgClass = 'bg-red-900/40 rounded-md'; 
                }
              }

              if (index === userInput.length) {
                bgClass = 'bg-slate-600 rounded animate-pulse'; 
                colorClass = 'text-white';
              }
              return (
                <span key={index} className={`${colorClass} ${bgClass} transition-colors duration-100 px-[1px]`}>
                  {char}
                </span>
              );
            })}

            <input 
              type="text"
              ref={inputRef}
              name="userInput" 
              value={userInput} 
              id="inputBox" 
              onChange={handleTyping}
              onKeyDown={handleKeyDown}
              className="absolute inset-0 w-full h-full opacity-0 cursor-text z-10 text-transparent bg-transparent"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="none"
              spellCheck={false}
              data-gramm="false"
              data-gramm_editor="false"
              data-enable-grammarly="false"
            />
          </div>
          
        </div>
      )}

      {gameState === "results" && (
        <div className="max-w-2xl mx-auto mt-20 flex flex-col gap-8 animate-fade-in">

          {myWPM > opponentWPM && opponentWPM > 0 &&(
            <Confetti 
              width={window.innerWidth} 
              height={window.innerHeight} 
              recycle={false} 
              numberOfPieces={500}
              gravity={0.10}
            />
          )}

          <div className="text-center">
            <h2 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500 mb-3 drop-shadow-lg">
              Race Complete!
            </h2>
            {(opponentWPM > 0)?(<p className="text-gray-400 text-lg">Here are the final standings.</p>):("")}
            
          </div>

          <div className="flex gap-6 justify-center">
            <div className="bg-[#0b1728] border border-blue-500/30 rounded-2xl p-8 text-center w-64 shadow-[0_0_20px_rgba(59,130,246,0.15)] relative overflow-hidden">
               {myWPM > opponentWPM && opponentWPM > 0 && <div className="absolute top-0 left-0 w-full bg-yellow-500/20 text-yellow-500 text-xs font-bold py-1.5 uppercase tracking-widest">Winner</div>}
               <div className="text-gray-500 uppercase tracking-wider text-sm font-bold mb-4 mt-2">Your Speed</div>
               <div className="text-7xl font-black text-blue-400 mb-2">{myWPM}</div>
               <div className="text-gray-400 font-mono text-sm">WPM</div>
            </div>

            <div className="bg-[#1e0a1f] border border-pink-500/30 rounded-2xl p-8 text-center w-64 shadow-[0_0_20px_rgba(236,72,153,0.15)] relative overflow-hidden">
               {opponentWPM > myWPM && <div className="absolute top-0 left-0 w-full bg-yellow-500/20 text-yellow-500 text-xs font-bold py-1.5 uppercase tracking-widest">Winner</div>}
               <div className="text-gray-500 uppercase tracking-wider text-sm font-bold mb-4 mt-2">Opponent</div>
               {opponentLeft ? (
                  <div className="text-xl font-bold text-red-400 mt-8">Left</div>
               ) : (
                  <>
                    <div className="text-7xl font-black text-pink-400 mb-2">{opponentWPM > 0 ? opponentWPM : "..."}</div>
                    <div className="text-gray-400 font-mono text-sm">{opponentWPM > 0 ? "WPM" : "Typing..."}</div>
                  </>
               )}
            </div>
          </div>

          <div className="flex justify-center gap-4 mt-6 w-full max-w-sm mx-auto">
            <button onClick={handleExit} className="flex-1 py-4 bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold rounded-xl transition-colors">
              Main Menu
            </button>
            <button onClick={handlePlayAgain} className="flex-1 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg transition-transform hover:scale-105">
              Play Again
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;