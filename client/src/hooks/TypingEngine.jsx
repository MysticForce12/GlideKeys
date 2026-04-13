import { useState, useEffect, useRef } from 'react';
import { useSocket } from '../context/SocketContext';
import { calculateAccuracy, calculateWPM, calculateProgress } from '../utils/gameMath';

export const useTypingEngine = (targetText, roomId, startTime, setMyWPM) =>{
    
    const socket = useSocket();
    
    const [userInput, setUserInput] = useState("");
    const [liveWPM, setLiveWPM] = useState(0); 
    const [liveAccuracy, setLiveAccuracy] = useState(100);
    const [opponents, setOpponents] = useState({}); 
  
    const [combo, setCombo] = useState(0);
    const [isMistakeFlicker, setIsMistakeFlicker] = useState(false);

    const currWPMRef = useRef(0);      
    const currAccuracyRef = useRef(100);

    useEffect(() =>{
        
        if(!socket) return;

        socket.on('opponent_progress', ({ playerId, progress }) => {
            setOpponents(prev =>({
                ...prev,
                [playerId]: { ...prev[playerId], progress }
            }));
        });

        socket.on('opponent_updates', ({ playerId, currWPM, currAccuracy }) => {
            setOpponents(prev =>({
                ...prev,
                [playerId]: { ...prev[playerId], currWPM, currAccuracy }
            }));
        });

        return () => {
            socket.off('opponent_progress');
            socket.off('opponent_updates');
        };
    }, [socket]);

    const handleTyping = (e) =>{
        const newText = e.target.value.replace(/\u00A0/g, " ").replace(/\s+/g, " ");
        // Checking mistakes to trigger flicker effects
        const isTypingCorrectly = targetText.startsWith(newText);
        if(!isTypingCorrectly && newText.length > userInput.length){
            setCombo(0);
            setIsMistakeFlicker(true);
            setTimeout(() => setIsMistakeFlicker(false), 200);
            return;
        }
        setUserInput(newText);
        
        const typedChar = newText[newText.length - 1];
        const targetChar = targetText[newText.length - 1];
        if (typedChar === targetChar) {
            if (typedChar === " ") {
                setCombo(prev => prev + 1);
            }
        }

        const correctChars = newText.split('').filter((char, index) => char === targetText[index]);
        if(correctChars.length > 0){
            const accuracy = calculateAccuracy(correctChars.length, newText.length);
            const wpm = calculateWPM(correctChars.length, startTime, Date.now());
            currAccuracyRef.current = accuracy;
            currWPMRef.current = wpm;
            setLiveAccuracy(accuracy);
            if(wpm > 0){
                setLiveWPM(currWPMRef.current);
            }
            if(socket){
                socket.emit('live_updates', { 
                    roomId, 
                    currWPM: currWPMRef.current, 
                    currAccuracy: currAccuracyRef.current 
                });
            }
        }

        const isValidText = newText.split('').every((char, i) => char === targetText[i]);
        if(isValidText){
            const roundedProgress = calculateProgress(newText.length, targetText.length);
            console.log(`Progress of ${socket.id}: ${roundedProgress}%`);
            if(socket){
                socket.emit("typing_progress", { 
                    roomId, 
                    progress: roundedProgress 
                });
            }
            if(roundedProgress === 100){
                setMyWPM(currWPMRef.current);
                if(socket){
                    socket.emit("player_finished", { 
                        roomId: roomId, 
                        currWPM: currWPMRef.current 
                    });
                    console.log("player finished emitted with WPM: ", currWPMRef.current);
                }
            }
        }
    };

    const handleKeyDown = (e) =>{
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
    };

    const progress = targetText ? Math.min((userInput.length / targetText.length) * 100, 100) : 0;

    return{
        userInput,
        liveWPM,
        liveAccuracy,
        opponents,
        combo,
        isMistakeFlicker,
        progress,
        handleTyping,
        handleKeyDown
    };
};