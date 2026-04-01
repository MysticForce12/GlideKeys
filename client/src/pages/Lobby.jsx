import { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';

const Lobby =({roomId,handleExit,opponentLeft})=>{
    
    const socket = useSocket();
    
    const [readyPlayers, setReadyPlayers] = useState(0);
    const [isReadyClicked, setIsReadyClicked] = useState(false);

    useEffect(()=>{
        
        socket.on('readyPlayers_count',(count)=>{
            setReadyPlayers(count);
        });
        
        return () => {
            socket.off('readyPlayers_count');
        };

    },[socket]);

    const handleReady = () => {
        if(isReadyClicked === false){
            setIsReadyClicked(true);
            socket.emit('player_ready', roomId);
        }
        else{
            setIsReadyClicked(false);
            socket.emit('player_not_ready', roomId);
        }
    }

    return(
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
                <button onClick={handleReady} className={`flex-[2] px-4 py-3 font-bold rounded-xl transition-all duration-200 ${isReadyClicked ? 'bg-green-600/20 text-green-400 border border-green-500/50' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)] hover:scale-105'}`}>
                    {isReadyClicked ? "Ready ✓" : "Click to Ready"}
                </button>
            </div>
        </div>
    );
}

export default Lobby;