import { useRef, useEffect, useState } from 'react';
import { useTypingEngine } from '../hooks/TypingEngine';
import { useSocket } from '../context/SocketContext';

const Arena = ({ targetText, roomId, gameState, startTime, setMyWPM, livePlayers }) => {

    const socket = useSocket();
    const inputRef = useRef(null);
    const activeCharRef = useRef(null); 
    const [scrollOffset, setScrollOffset] = useState(0);

    const { userInput, liveWPM, liveAccuracy, opponents, combo, isMistakeFlicker, progress, handleTyping, handleKeyDown} = useTypingEngine(targetText, roomId, startTime, setMyWPM);

    useEffect(() => {
        if(gameState === "playing" && inputRef.current) {
            inputRef.current.focus();
        }
    }, [gameState]);

    useEffect(() => {
        if (activeCharRef.current) {
            const currentOffset = activeCharRef.current.offsetTop;
            const targetScroll = Math.floor(currentOffset / 40) * 40;
            setScrollOffset(targetScroll);
        }
    }, [userInput]);

    {/*Lane logic */}
    const totalPlayers = livePlayers ? Object.keys(livePlayers).length : 1;
    const numLanes = Math.max(1, Math.min(totalPlayers, 5)); 
    const myLaneIndex = Math.floor((numLanes - 1) / 2);
    const oppIds = Object.keys(livePlayers || {}).filter(id => id !== socket?.id);

    //speedometer 
    const gaugeCircumference = 339.29;
    const gaugeFillPercent = Math.min((liveWPM / 150) * 100, 100); 
    const gaugeOffset = gaugeCircumference - (gaugeFillPercent / 100) * gaugeCircumference;

    //combo quake
    const shakeIntensity = combo > 2 ? Math.min((combo - 2) / 80, 1) : 0; 
    const shakeX = shakeIntensity > 0 ? (Math.random() - 0.5) * 8 * shakeIntensity : 0;
    const shakeY = shakeIntensity > 0 ? (Math.random() - 0.5) * 8 * shakeIntensity : 0;

    return(
        <div 
            className="relative w-full h-[calc(100vh-160px)] min-h-[600px] bg-[#0A0A0F] overflow-hidden flex flex-col items-center select-none font-sans"
            onClick={() => inputRef.current?.focus()}
        >
            {/* combo fire overlay*/}
            <div 
                className="absolute inset-0 pointer-events-none z-0 mix-blend-screen transition-opacity duration-500 ease-out"
                style={{
                    opacity: shakeIntensity * 0.4, 
                    background: 'radial-gradient(circle at center 70%, #ea580c 0%, #7c2d12 40%, transparent 80%)'
                }}
            />

            {/* wpm meter*/}
            <div className="absolute right-12 top-1/2 -translate-y-1/2 z-50 flex flex-col items-center">
                <div className="relative flex items-center justify-center w-32 h-32">
                    <svg className="w-full h-full transform -rotate-90 drop-shadow-[0_0_15px_rgba(56,189,248,0.4)]">
                        <circle
                            cx="64" cy="64" r="54"
                            stroke="rgba(255,255,255,0.05)" strokeWidth="8" fill="transparent"
                        />
                        <circle
                            cx="64" cy="64" r="54"
                            stroke="url(#wpmGradient)" strokeWidth="8" fill="transparent"
                            strokeDasharray={gaugeCircumference}
                            strokeDashoffset={gaugeOffset}
                            strokeLinecap="round"
                            className="transition-all duration-300 ease-out"
                        />
                        <defs>
                            <linearGradient id="wpmGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#38bdf8" />
                                <stop offset="100%" stopColor="#ec4899" />
                            </linearGradient>
                        </defs>
                    </svg>
                    <div className="absolute flex flex-col items-center justify-center mt-1">
                        <span className="text-4xl font-black text-white leading-none">{liveWPM}</span>
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest leading-none mt-2">WPM</span>
                    </div>
                </div>
            </div>

            {/* Mistake flicker and quake */}
            <div 
                className="absolute inset-0 transition-transform duration-75"
                style={{
                    transform: isMistakeFlicker 
                        ? 'translate(4px, 4px) scale(1.05)' 
                        : `translate(${shakeX}px, ${shakeY}px)`
                }}
            >
                {/* Top Bar */}
                <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 px-8 py-3 rounded-full bg-[#14141E]/60 backdrop-blur-md border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.2)] flex gap-8 items-center">
                    <span className="text-blue-400 font-bold tracking-widest text-sm">TYPING RACE</span>
                    <span className="text-gray-400 font-mono text-sm">ROOM #{roomId}</span>
                </div>

                {/* Main Arena */}
                <div className="absolute inset-0 flex justify-center items-end pb-[280px]" style={{ perspective: '1000px' }}>
                   
                    {/*Floor Plane */}
                    <div className="relative w-[800px] h-[1200px] flex justify-center gap-12"
                        style={{ 
                            transform: 'rotateX(60deg) translateY(100px)', 
                            transformOrigin: 'bottom center',
                            background: 'linear-gradient(to top, rgba(10,10,15,1), rgba(10,10,15,0))'
                        }}
                    >
                        {/*Lanes */}
                        {[...Array(numLanes)].map((_, laneIndex) => {
                            
                            const nativePlayer = laneIndex === myLaneIndex;
                            let laneProgress = 0;
                            let oppId = null;

                            if(nativePlayer){
                                laneProgress = progress;
                            } else {
                                const oppIndex = laneIndex < myLaneIndex ? laneIndex : laneIndex - 1;
                                oppId = oppIds[oppIndex];
                                laneProgress = opponents[oppId]?.progress || 0;
                            }

                            const isFinished = laneProgress >= 100;
                            
                            const laneColor = nativePlayer ? (isMistakeFlicker ? 'rgba(239,68,68,0.5)' : 'rgba(56,189,248,0.2)') : 'rgba(236,72,153,0.1)';
                            const borderColor = nativePlayer ? (isMistakeFlicker ? '#ef4444' : '#38bdf8') : '#ec4899';
                            const glowShadow = `0 0 20px ${borderColor}, 0 0 40px ${borderColor}`;
                            const isHighCombo = nativePlayer && combo >= 10 && !isFinished;

                            return(
                                <div 
                                    key={laneIndex} 
                                    className="relative w-[120px] h-full border-x transition-colors duration-500 overflow-hidden"
                                    style={{ 
                                        borderColor: borderColor,
                                        backgroundColor: laneColor,
                                        boxShadow: isHighCombo ? `0 0 30px ${borderColor} inset` : 'none'
                                    }}
                                >
                                    {/* Checkered Finish line for race finished*/}
                                    {isFinished && (
                                        <div 
                                            className="absolute top-0 left-0 w-full h-16 z-20"
                                            style={{
                                                background: 'repeating-conic-gradient(#ffffff 0% 25%, #111620 0% 50%) 50% / 30px 30px',
                                                borderBottom: `2px solid ${borderColor}`,
                                                boxShadow: `0 10px 20px rgba(0,0,0,0.8)`
                                            }}
                                        />
                                    )}

                                    <div className={`absolute inset-0 bg-[linear-gradient(to_bottom,transparent_49%,rgba(255,255,255,0.1)_50%)] bg-[length:100%_40px] ${isFinished ? '' : 'animate-[scrollDown_1s_linear_infinite]'}`} />
                                    
                                    <div 
                                        className="absolute w-full flex justify-center transition-all duration-300 ease-out"
                                        style={{ bottom: `${laneProgress}%` }}
                                    >
                                        <div 
                                            className="w-8 h-8 rounded-full z-10 flex items-center justify-center font-bold text-white text-xs transition-colors duration-500"
                                            style={{
                                                backgroundColor: borderColor,
                                                boxShadow: glowShadow,
                                                transform: 'rotateX(-60deg)' 
                                            }}
                                        >
                                            {isFinished ? '✓' : (nativePlayer ? 'Y' : 'O')}
                                            {!isFinished && (
                                                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-4 h-32 opacity-50 blur-sm rounded-full" 
                                                     style={{ background: `linear-gradient(to bottom, ${borderColor}, transparent)` }}
                                                />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* InputPanel */}
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-50 w-[800px] flex flex-col gap-4">
                    
                    {/*Stats Row */}
                    <div className="relative flex justify-between items-end px-4 mb-2">
                        
                        {/*Combo */}
                        <div className="absolute left-1/2 -translate-x-1/2 flex justify-center items-center">
                            <div className={`text-2xl font-bold italic transition-all duration-300 ${combo >= 5 ? 'opacity-100 text-orange-400 drop-shadow-[0_0_15px_#ea580c] scale-110' : 'opacity-0 scale-90'}`}>
                                {combo}x COMBO 🔥
                            </div>
                        </div>
                    </div>

                    <div className={`relative w-full bg-[#111620]/90 backdrop-blur-xl border ${ isMistakeFlicker? 'border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.4)]' : 'border-gray-700/50'} rounded-2xl px-8 overflow-hidden`}
                        style={{ height: '80px' }} 
                    >
                        <div className="flex flex-col justify-center h-full">
                            
                            <div className="relative z-20 pointer-events-none break-words text-2xl transition-transform duration-300 ease-out"
                                style={{ 
                                    lineHeight: '40px', 
                                    transform: `translateY(-${scrollOffset}px)` 
                                }}
                            >
                                {targetText.split('').map((char, index) => {
                                    let colorClass = 'text-gray-600';
                                    let bgClass = 'bg-transparent';
                                    let isCurrentChar = false;
                                    
                                    if (index < userInput.length) {
                                        colorClass = 'text-gray-400 opacity-50';
                                    } else if (index === userInput.length) {
                                        colorClass = 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]';
                                        bgClass = 'border-b-2 border-teal-400';
                                        isCurrentChar = true; 
                                    }

                                    return(
                                        <span 
                                            key={index} 
                                            ref={isCurrentChar ? activeCharRef : null} 
                                            className={`${colorClass} ${bgClass} transition-colors duration-100`}
                                        >
                                            {char}
                                        </span>
                                    );
                                })}
                            </div>
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