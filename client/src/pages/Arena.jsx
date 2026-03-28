import { useState, useEffect, useRef } from 'react';
import { useSocket } from '../context/SocketContext';
import { calculateAccuracy, calculateWPM, calculateProgress } from '../utils/gameMath';

const Arena = ({targetText, roomId, gameState, startTime, setMyWPM, setGameState})=>{
    
    const socket = useSocket();
    
    const [userInput,setuserInput] = useState("");
    const [liveWPM, setLiveWPM] = useState(0);
    const [liveAccuracy, setLiveAccuracy] = useState(0);
    const [opponentLiveAccuracy, setOpponentLiveAccuracy] = useState(0);
    const [opponentLiveWPM, setOpponentLiveWPM] = useState(0);
    const [opponentProgress, setOpponentProgress] = useState(0);

    const inputRef = useRef(null);
    const currWPMRef = useRef(0);
    const currAccuracyRef = useRef(0);

    useEffect(()=>{

        socket.on('opponent_progress',(progress)=>{
            setOpponentProgress(progress);
        });

        socket.on('opponent_updates',(data)=>{
            setOpponentLiveWPM(data.currWPM);
            setOpponentLiveAccuracy(data.currAccuracy);
        });

        return ()=>{
            socket.off('opponent_progress');
            socket.off('opponent_updates');
        }

    },[socket]);

    useEffect(()=>{
        if(gameState === "playing" && inputRef.current){
            inputRef.current.focus();
        }
    },[gameState]);

    
    const handleTyping = (e) => {
        
        const newText = e.target.value.replace(/\u00A0/g, " ").replace(/\s+/g, " ");
        setuserInput(newText);
        const correctChars = newText.split('').filter((char, index) => char === targetText[index]);
        
        if(correctChars.length > 0){
            const accuracy = calculateAccuracy(correctChars.length, newText.length);
            const wpm = calculateWPM(correctChars.length, startTime, Date.now());
            currAccuracyRef.current = accuracy;
            currWPMRef.current = wpm;
            setLiveAccuracy(accuracy);
            
            if (wpm > 0) setLiveWPM(wpm);
            socket.emit('live_updates',{
                roomId: roomId, 
                currWPM: wpm, 
                currAccuracy: accuracy
            });
        }

        const isValidText = newText.split('').every((char, i) => char === targetText[i]);

        if(isValidText) {
            const roundedProgress = calculateProgress(newText.length, targetText.length);
            socket.emit("typing_progress", { roomId, progress: roundedProgress });
            
            if(roundedProgress === 100){
                setMyWPM(liveWPM);
                setGameState("results");
                socket.emit("race_finished",{roomId, liveWPM});
                console.log("race finished event emitted with WPM:", liveWPM);
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

    return(
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
                        <div className="bg-[#38bdf8] h-full rounded-full shadow-[0_0_12px_rgba(56,189,248,0.8)] transition-all duration-150 ease-out relative" style={{ width: `${targetText ? Math.min(Math.floor((userInput.length / targetText.length) * 100), 100) : 0}%` }}>
                            <div className="absolute -right-3 -top-2 text-xl">
                                🚀
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <span className="text-pink-400 font-bold text-sm w-20">Opponent</span>
                    <div className="flex-1 bg-gray-800 rounded-full h-3">

                        <div className="bg-[#f472b6] h-full rounded-full shadow-[0_0_12px_rgba(244,114,182,0.8)] transition-all duration-150 ease-out relative" style={{ width: `${opponentProgress}%` }}>
                            <div className="absolute -right-3 -top-2 text-xl">
                                🛸
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            <div className="w-full bg-[#111620] border border-gray-700/50 rounded-2xl p-10 text-3xl leading-[1.7] font-mono shadow-lg cursor-text select-none relative overflow-hidden" 
            onClick={() => inputRef.current && inputRef.current.focus()}>
                
                {targetText.split('').map((char, index) => {  
                    let colorClass = 'text-slate-600'; 
                    let bgClass = 'bg-transparent';
                    
                    if(index < userInput.length){
                        if(userInput[index] === char){
                            colorClass = 'text-teal-400'; 
                        } 
                        else{
                            colorClass = 'text-red-400'; 
                            bgClass = 'bg-red-900/40 rounded-md'; 
                        }
                    }

                    if(index === userInput.length){
                        bgClass = 'bg-slate-600 rounded animate-pulse'; 
                        colorClass = 'text-white';
                    }
                    return(
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
    );
}

export default Arena;