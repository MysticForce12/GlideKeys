import { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';

const GRADIENTS = [
    { id: 'purple-blue', from: '#7c3aed', to: '#2563eb' },
    { id: 'pink-orange', from: '#ec4899', to: '#f97316' },
    { id: 'teal-green', from: '#14b8a6', to: '#22c55e' },
    { id: 'red-pink', from: '#ef4444', to: '#ec4899' },
    { id: 'yellow-orange', from: '#eab308', to: '#f97316' },
    { id: 'cyan-blue', from: '#06b6d4', to: '#3b82f6' },
];

const getGradientStyle = (gradientId) => {
    const grad = GRADIENTS.find(g => g.id === gradientId) || GRADIENTS[0];
    return {
        background: `linear-gradient(135deg, ${grad.from}, ${grad.to})`,
        boxShadow: `0 0 10px ${grad.from}44`
    };
};

const Lobby = ({ roomId, handleExit, livePlayers, gameMode }) => {
    const socket = useSocket();
    const [notifications, setNotifications] = useState([]);

    const maxPlayers = gameMode === 'solo' ? 1 : gameMode === '1v1' ? 2 : 5;

    useEffect(() => {
        
        if (!socket) return;

        const handlePlayerJoined = ({ playerId, playerData }) => {
            const id = Date.now();
            const playername = playerData?.name || 'A player';
            setNotifications(prev => [...prev, { id, text: `${playername} joined!` }]);
            setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 3000);
        };

        const handleOpponentLeft = ({ playerId }) => {
            const id = Date.now();
            const playerInLobby = livePlayers?.[playerId];
            const playername = playerInLobby?.name || 'A player';
            setNotifications(prev => [...prev, { id, text: `${playername} left.` }]);
            setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 3000);
        };

        socket.on('player_joined_room', handlePlayerJoined);
        socket.on('opponent_left', handleOpponentLeft);

        return () => {
            socket.off('player_joined_room', handlePlayerJoined);
            socket.off('opponent_left', handleOpponentLeft);
        };
    }, [socket]);

    const amIReady = livePlayers && livePlayers[socket.id] ? livePlayers[socket.id].isReady : false;

    const handleReadyToggle = () => {
        socket.emit(amIReady ? 'player_not_ready' : 'player_ready', roomId);
    };

    return (
        <div className="max-w-md mx-auto mt-20 bg-[#111620] border border-gray-700/50 rounded-2xl p-8 shadow-2xl flex flex-col items-center text-center relative overflow-hidden">
            <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-green-400 to-blue-500"></div>

            <div className="fixed bottom-10 right-10 flex flex-col gap-2 z-50">
                {notifications.map(note => (
                    <div key={note.id} className="bg-blue-600/90 backdrop-blur-md text-white px-6 py-3 rounded-lg shadow-xl border border-blue-400 animate-pulse">
                        {note.text}
                    </div>
                ))}
            </div>

            <h2 className="text-3xl font-bold text-white mb-2">Game Lobby</h2>
            <div className="text-gray-400 font-mono mb-8 bg-black/40 px-4 py-2 rounded-lg border border-gray-800">
                Room: {roomId}
            </div>

            <div className="w-full mb-8 flex flex-col gap-3">
                <div className="text-xs font-semibold text-gray-500 uppercase text-left px-1">
                    Players ({Object.keys(livePlayers || {}).length} / {maxPlayers})
                </div>
                
                {Object.entries(livePlayers || {}).map(([id, playerData]) => {
                    const initial = (playerData.name || '?').charAt(0).toUpperCase();
                    
                    return (
                        <div key={id} className={`flex items-center justify-between p-3 rounded-xl border ${id === socket.id ? 'border-blue-500 bg-blue-500/10' : 'border-gray-800 bg-black/20'}`}>
                            <div className="flex items-center gap-3">
                                <div className={`w-3 h-3 rounded-full ${playerData.isReady ? 'bg-green-400' : 'bg-gray-600'}`}></div>
                                <div 
                                    className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-white text-[10px] uppercase"
                                    style={getGradientStyle(playerData.avatarGradient)}
                                >
                                    {initial}
                                </div>
                                <span className="text-sm text-gray-300">
                                    {playerData.name ? `${playerData.name}${id === socket.id ? ' (you)' : ''}` : (id === socket.id ? 'You' : 'Guest')}
                                </span>
                            </div>
                        <span className={`text-[10px] font-bold ${playerData.isReady ? 'text-green-400' : 'text-gray-500'}`}>
                            {playerData.isReady ? "READY" : "WAITING"}
                        </span>
                    </div>
                )})}
            </div>

            <div className="flex gap-4 w-full">
                <button onClick={handleExit} className="flex-1 px-4 py-3 bg-gray-800 text-gray-300 font-bold rounded-xl">Leave</button>
                <button 
                    onClick={handleReadyToggle} 
                    className={`flex-[2] px-4 py-3 font-bold rounded-xl transition-all duration-200 ${amIReady ? 'bg-green-600/20 text-green-400 border border-green-500/50' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg'}`}
                >
                    {amIReady ? "Ready ✓" : "I'm Ready"}
                </button>
            </div>
        </div>
    );
};

export default Lobby;