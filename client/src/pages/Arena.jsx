import { useRef, useEffect } from 'react';
import { useTypingEngine } from '../hooks/TypingEngine';

const Arena = ({ targetText, roomId, gameState, startTime, setMyWPM, setGameState }) => {

    const inputRef = useRef(null);
    const { userInput, liveWPM, liveAccuracy, opponents, combo, isMistakeFlicker, progress, handleTyping, handleKeyDown} = useTypingEngine(targetText, roomId, startTime, setMyWPM, setGameState);

    useEffect(() => {
        if(gameState === "playing" && inputRef.current) {
            inputRef.current.focus();
        }
    }, [gameState]);

    const opponentIds = Object.keys(opponents || {});

    return(
        <div className={`relative w-full h-[800px] bg-[#0A0A0F] overflow-hidden flex flex-col items-center select-none font-sans transition-transform duration-75 ${isMistakeFlicker ? 'translate-x-1 translate-y-1 scale-105' : ''}`}
            onClick={() => inputRef.current?.focus()}
        >
            {/* 🔝 TOP BAR (Floating Glass Panel) */}
            <div className="absolute top-6 z-50 px-8 py-3 rounded-full bg-[#14141E]/60 backdrop-blur-md border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.2)] flex gap-8 items-center">
                <span className="text-blue-400 font-bold tracking-widest text-sm">⚡ TYPING RACE</span>
                <span className="text-gray-400 font-mono text-sm">ROOM #{roomId}</span>
                <span className="text-pink-400 font-mono font-bold text-sm">⏱ {liveWPM} WPM</span>
            </div>

            {/* 🧱 MAIN ARENA (2.5D Perspective) */}
            <div className="absolute inset-0 flex justify-center items-end pb-32" style={{ perspective: '1000px' }}>
                {/* The 3D Floor Plane */}
                <div className="relative w-[800px] h-[1200px] flex justify-between"
                    style={{ 
                        transform: 'rotateX(60deg) translateY(100px)', 
                        transformOrigin: 'bottom center',
                        
                        background: 'linear-gradient(to top, rgba(10,10,15,1), rgba(10,10,15,0))'
                    }}
                >
                    {/* Render 5 OpponentLanes */}
                    {[0, 1, 2, 3, 4].map((laneIndex) => {
                        
                        const nativePlayer = laneIndex === 2;
                       
                        let laneProgress = 0;
                        let stats = {wpm : 0, acc: 0};

                        if(nativePlayer){
                            laneProgress = progress;
                            stats = {wpm: liveWPM, acc: liveAccuracy};
                        } else{
                            const oppIdx = laneIndex < 2 ? laneIndex : laneIndex - 1;
                            const oppId = opponentIds[oppIdx];
                            laneProgress = opponents[oppId]?.progress || 0;
                        }

                        // Styling logic based on player vs opponent and combo
                        const laneColor = nativePlayer ? (isMistakeFlicker ? 'rgba(239,68,68,0.5)' : 'rgba(56,189,248,0.2)') : 'rgba(236,72,153,0.1)';
                        const borderColor = nativePlayer ? (isMistakeFlicker ? '#ef4444' : '#38bdf8') : '#ec4899';
                        const isHighCombo = nativePlayer && combo >= 10;

                        return(
                            <div 
                                key={laneIndex} 
                                className="relative w-[120px] h-full border-x transition-colors duration-300"
                                style={{ 
                                    borderColor: borderColor,
                                    backgroundColor: laneColor,
                                    boxShadow: isHighCombo ? `0 0 30px ${borderColor} inset` : 'none'
                                }}
                            >
                                {/* Moving Grid Lines Illusion */}
                                <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_49%,rgba(255,255,255,0.1)_50%)] bg-[length:100%_40px] animate-[scrollDown_1s_linear_infinite]" />

                                {/* 🏃 Avatar Tracker */}
                                <div 
                                    className="absolute w-full flex justify-center transition-all duration-300 ease-out"
                                    style={{ bottom: `${laneProgress}%` }}
                                >
                                    {/* The Orb */}
                                    <div 
                                        className="w-8 h-8 rounded-full z-10"
                                        style={{
                                            backgroundColor: borderColor,
                                            boxShadow: `0 0 20px ${borderColor}, 0 0 40px ${borderColor}`,
                                            transform: 'rotateX(-60deg)' // Counter-rotate to face camera
                                        }}
                                    >
                                        {/* Speed Trail */}
                                        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-4 h-32 opacity-50 blur-sm rounded-full" 
                                             style={{ background: `linear-gradient(to bottom, ${borderColor}, transparent)` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* 🔽 BOTTOM INPUT PANEL (Glassmorphism) */}
            <div className="absolute bottom-10 z-50 w-[800px] flex flex-col gap-4">
                
                {/* Stats Row */}
                <div className="flex justify-between items-center px-4">
                    <div className="text-gray-400 font-mono text-lg">
                        WPM: <span className="text-white font-bold">{liveWPM}</span>
                    </div>
                    <div className={`text-2xl font-bold italic transition-opacity ${combo >= 5 ? 'opacity-100 text-orange-400 drop-shadow-[0_0_10px_orange]' : 'opacity-0'}`}>
                        {combo}x COMBO 🔥
                    </div>
                    <div className="text-gray-400 font-mono text-lg">
                        ACC: <span className="text-white font-bold">{Math.round(liveAccuracy)}%</span>
                    </div>
                </div>

                {/* Text Display Area */}
                <div 
                    className={`relative w-full bg-[#111620]/80 backdrop-blur-xl border ${isMistakeFlicker ? 'border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.4)]' : 'border-gray-700/50'} rounded-2xl p-8 text-2xl leading-[1.7] font-mono shadow-2xl transition-all duration-200`}
                >
                    <div className="relative z-20 pointer-events-none break-words">
                        {targetText.split('').map((char, index) => {
                            let colorClass = 'text-gray-600';
                            let bgClass = 'bg-transparent';
                            
                            if (index < userInput.length) {
                                colorClass = 'text-gray-400 opacity-50'; // Typed text fades
                            } else if (index === userInput.length) {
                                colorClass = 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]'; // Current char glow
                                bgClass = 'border-b-2 border-teal-400';
                            }

                            return (
                                <span key={index} className={`${colorClass} ${bgClass} transition-colors duration-100`}>
                                    {char}
                                </span>
                            );
                        })}
                    </div>

                    <input 
                        type="text"
                        ref={inputRef}
                        value={userInput} 
                        onChange={handleTyping}
                        onKeyDown={handleKeyDown}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-text z-30"
                        autoComplete="off"
                        spellCheck={false}
                    />
                </div>
            </div>
            
            <style jsx>{`
                @keyframes scrollDown {
                    from { background-position: 0 0; }
                    to { background-position: 0 40px; }
                }
            `}</style>
        </div>
    );
};

export default Arena;






























// import { useState, useEffect, useRef } from 'react';
// import { useSocket } from '../context/SocketContext';
// import { calculateAccuracy, calculateWPM, calculateProgress } from '../utils/gameMath';

// const Arena = ({targetText, roomId, gameState, startTime, setMyWPM, setGameState})=>{
    
//     const socket = useSocket();
    
//     const [userInput,setuserInput] = useState("");
//     const [liveWPM, setLiveWPM] = useState(0);
//     const [liveAccuracy, setLiveAccuracy] = useState(0);
//     const [opponents, setOpponents] = useState({});

//     const inputRef = useRef(null);
//     const currWPMRef = useRef(0);
//     const currAccuracyRef = useRef(0);

//     useEffect(()=>{

//         socket.on('opponent_progress',({playerId, progress})=>{
//             setOpponents(prev => ({
//                 ...prev,
//                 [playerId]: {
//                     ...prev[playerId],
//                     progress : progress
//                 }
//             }));
//         });

//         socket.on('opponent_updates',({playerId, currWPM, currAccuracy})=>{
//             setOpponents(prev => ({
//                 ...prev,
//                 [playerId]: {
//                     ...prev[playerId],
//                     currWPM : currWPM,
//                     currAccuracy: currAccuracy
//                 }
//             }));
//         });

//         return ()=>{
//             socket.off('opponent_progress');
//             socket.off('opponent_updates');
//         }

//     },[socket]);

//     useEffect(()=>{
//         if(gameState === "playing" && inputRef.current){
//             inputRef.current.focus();
//         }
//     },[gameState]);

    
//     const handleTyping = (e) => {
        
//         const newText = e.target.value.replace(/\u00A0/g, " ").replace(/\s+/g, " ");
//         setuserInput(newText);
//         const correctChars = newText.split('').filter((char, index) => char === targetText[index]);
        
//         if(correctChars.length > 0){
//             const accuracy = calculateAccuracy(correctChars.length, newText.length);
//             const wpm = calculateWPM(correctChars.length, startTime, Date.now());
//             currAccuracyRef.current = accuracy;
//             currWPMRef.current = wpm;
//             setLiveAccuracy(accuracy);
            
//             if (wpm > 0) setLiveWPM(wpm);
//             socket.emit('live_updates',{
//                 roomId: roomId, 
//                 currWPM: wpm, 
//                 currAccuracy: accuracy
//             });
//         }

//         const isValidText = newText.split('').every((char, i) => char === targetText[i]);

//         if(isValidText) {
//             const roundedProgress = calculateProgress(newText.length, targetText.length);
//             socket.emit("typing_progress", { roomId, progress: roundedProgress });
            
//             if(roundedProgress === 100){
//                 setMyWPM(liveWPM);
//                 setGameState("results");
//                 socket.emit("race_finished",{roomId, liveWPM});
//                 console.log("race finished event emitted with WPM:", liveWPM);
//             }
//         } 
//     };
  
//     const handleKeyDown =(e) =>{
//         if(e.key.startsWith('Arrow')){
//             e.preventDefault();
//             return;
//         }
//         if(e.key === 'Backspace'){
//             const isPerfectText = targetText.startsWith(userInput);
//             if(isPerfectText){
//                 e.preventDefault();
//             }
//         }
//     }

//     return(
//         <div className="max-w-5xl mx-auto flex flex-col gap-8">

//             <div className="h-44 w-full flex flex-row items-center justify-between">
                
//                 <div className="w-[42%] h-full bg-[#0b1728] border border-blue-500/30 rounded-2xl p-5 flex flex-col justify-between shadow-[0_0_15px_rgba(59,130,246,0.15)]">
//                     <div className="flex items-center gap-3">
//                         <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">Y</div>
//                         <span className="text-xl font-bold tracking-wide">You</span>
//                         <span className="text-xs bg-slate-700 px-2 py-1 rounded text-gray-300 ml-2">YOU</span>
//                     </div>
//                     <div className="flex gap-8 mt-4">
//                         <div>
//                             <div className="text-gray-500 text-sm font-semibold mb-1">WPM</div>
//                             <div className="text-3xl font-extrabold text-blue-400">{liveWPM}</div>
//                         </div>
//                         <div>
//                             <div className="text-gray-500 text-sm font-semibold mb-1">Accuracy</div>
//                             <div className="text-3xl font-extrabold text-blue-400">{liveAccuracy.toFixed(1)}%</div>
//                         </div>
//                     </div>
//                 </div>

//                 <div className="text-5xl font-extrabold text-orange-500 italic drop-shadow-[0_0_10px_rgba(249,115,22,0.5)]">
//                 VS
//                 </div>

//                 <div className="w-[42%] h-full bg-[#1e0a1f] border border-pink-500/30 rounded-2xl p-5 flex flex-col justify-between shadow-[0_0_15px_rgba(236,72,153,0.15)]">
//                     <div className="flex items-center gap-3">
//                         <div className="w-10 h-10 rounded-full bg-pink-500 text-white flex items-center justify-center font-bold">O</div>
//                         <span className="text-xl font-bold tracking-wide">Opponent</span>
//                     </div>
//                     <div className="flex gap-8 mt-4">
//                         <div>
//                             <div className="text-gray-500 text-sm font-semibold mb-1">WPM</div>
//                             <div className="text-3xl font-extrabold text-pink-400">{opponentLiveWPM}</div>
//                         </div>
//                         <div>
//                             <div className="text-gray-500 text-sm font-semibold mb-1">Accuracy</div>
//                             <div className="text-3xl font-extrabold text-pink-400">{opponentLiveAccuracy.toFixed(1)}%</div>
//                         </div>
//                     </div>
//                 </div>

//             </div>


//             <div className="w-full bg-[#111620] border border-gray-700/50 rounded-2xl p-6 flex flex-col gap-6 shadow-lg">
//                 <div className="text-center text-gray-400 font-semibold tracking-widest text-sm uppercase mb-2">
//                     Race Progress
//                 </div>

//                 <div className="flex items-center gap-4">
//                     <span className="text-blue-400 font-bold text-sm w-20">You</span>
//                     <div className="flex-1 bg-gray-800 rounded-full h-3">
//                         <div className="bg-[#38bdf8] h-full rounded-full shadow-[0_0_12px_rgba(56,189,248,0.8)] transition-all duration-150 ease-out relative" style={{ width: `${targetText ? Math.min(Math.floor((userInput.length / targetText.length) * 100), 100) : 0}%` }}>
//                             <div className="absolute -right-3 -top-2 text-xl">
//                                 🚀
//                             </div>
//                         </div>
//                     </div>
//                 </div>

//                 <div className="flex items-center gap-4">
//                     <span className="text-pink-400 font-bold text-sm w-20">Opponent</span>
//                     <div className="flex-1 bg-gray-800 rounded-full h-3">

//                         <div className="bg-[#f472b6] h-full rounded-full shadow-[0_0_12px_rgba(244,114,182,0.8)] transition-all duration-150 ease-out relative" style={{ width: `${opponentProgress}%` }}>
//                             <div className="absolute -right-3 -top-2 text-xl">
//                                 🛸
//                             </div>
//                         </div>
//                     </div>
//                 </div>

//             </div>

//             <div className="w-full bg-[#111620] border border-gray-700/50 rounded-2xl p-10 text-3xl leading-[1.7] font-mono shadow-lg cursor-text select-none relative overflow-hidden" 
//             onClick={() => inputRef.current && inputRef.current.focus()}>
                
//                 {targetText.split('').map((char, index) => {  
//                     let colorClass = 'text-slate-600'; 
//                     let bgClass = 'bg-transparent';
                    
//                     if(index < userInput.length){
//                         if(userInput[index] === char){
//                             colorClass = 'text-teal-400'; 
//                         } 
//                         else{
//                             colorClass = 'text-red-400'; 
//                             bgClass = 'bg-red-900/40 rounded-md'; 
//                         }
//                     }

//                     if(index === userInput.length){
//                         bgClass = 'bg-slate-600 rounded animate-pulse'; 
//                         colorClass = 'text-white';
//                     }
//                     return(
//                         <span key={index} className={`${colorClass} ${bgClass} transition-colors duration-100 px-[1px]`}>
//                             {char}
//                         </span>
//                     );
//                 })}

//                 <input 
//                     type="text"
//                     ref={inputRef}
//                     name="userInput" 
//                     value={userInput} 
//                     id="inputBox" 
//                     onChange={handleTyping}
//                     onKeyDown={handleKeyDown}
//                     className="absolute inset-0 w-full h-full opacity-0 cursor-text z-10 text-transparent bg-transparent"
//                     autoComplete="off"
//                     autoCorrect="off"
//                     autoCapitalize="none"
//                     spellCheck={false}
//                     data-gramm="false"
//                     data-gramm_editor="false"
//                     data-enable-grammarly="false"
//                 />
                
//             </div>   
//         </div>
//     );
// }

// export default Arena;