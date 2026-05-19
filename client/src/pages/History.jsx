import React, { useEffect, useState } from 'react';
import api from '../utils/api';

const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    let interval = seconds/31536000;
    if(interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds/2592000;
    if(interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds/86400;
    if(interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds/3600;
    if(interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds/60;
    if(interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
};

const History = ({ onBack }) => {
    
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const currentUserId = localStorage.getItem('gk_userId');

    useEffect(() =>{
        const fetchLogs = async () => {
            try{
                const res = await api.get('/users/logs');
                setLogs(res.data);
            } 
            catch(err){
                console.error("Failed to fetch the match logs:", err);
            } 
            finally{
                setLoading(false);
            }
        };

        fetchLogs();

    }, []);

    return (
        <div className="flex flex-col items-center justify-start mt-8 space-y-8 animate-fade-in w-full max-w-4xl mx-auto px-4 pb-20">
            <div className="text-center">
                <h2 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 mb-4 tracking-tight drop-shadow-lg">Match History</h2>
                <p className="text-gray-400 text-lg font-medium">Your last 10 races.</p>
            </div>

            {loading ? (
                <div className="p-12 text-center w-full">
                    <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
                </div>
            ) : logs.length === 0 ? (
                <div className="w-full bg-[#111620]/80 backdrop-blur-xl rounded-3xl border border-gray-700/50 shadow-2xl p-12 text-center text-gray-400 font-medium">
                    No match history found
                </div>
            ) : (
                <div className="w-full flex flex-col gap-6">
                    {logs.map((match) => (
                        <div key={match._id} className="bg-[#111620]/80 backdrop-blur-xl rounded-3xl border border-gray-700/50 shadow-2xl overflow-hidden flex flex-col">
                            <div className="bg-slate-800/60 px-6 py-4 flex justify-between items-center border-b border-gray-700/50">
                                <div className="flex items-center gap-3">
                                    <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full text-xs font-semibold tracking-wider uppercase">
                                        {match.mode}
                                    </span>
                                </div>
                                <span className="text-sm text-gray-400 font-medium">
                                    {timeAgo(match.createdAt)}
                                </span>
                            </div>
                            
                            <div className="p-2">
                                {match.players.map((player) =>{
                                    const isMe = player.userId === currentUserId;
                                    let rankBadge = "bg-slate-700 text-gray-400 font-semibold";
                                    let nameStyle = "text-gray-300";
                                    let rowBg = isMe ? "bg-blue-500/10 border-blue-500/30" : "bg-transparent border-transparent hover:bg-slate-800/40";
                                    
                                    if(player.placement === 1){
                                        rankBadge = "bg-gradient-to-br from-yellow-300 to-amber-600 shadow-[0_0_10px_rgba(251,191,36,0.5)] text-white";
                                        if (!isMe) rowBg = "bg-amber-500/5 border-transparent hover:bg-amber-500/10";
                                    }
                                    else if(player.placement === 2){
                                        rankBadge = "bg-gradient-to-br from-gray-300 to-gray-500 shadow-[0_0_10px_rgba(156,163,175,0.4)] text-white";
                                    } 
                                    else if(player.placement === 3){
                                        rankBadge = "bg-gradient-to-br from-orange-400 to-orange-700 shadow-[0_0_10px_rgba(234,88,12,0.4)] text-white";
                                    }

                                    if(isMe){
                                        nameStyle = "text-blue-400 font-bold drop-shadow-md";
                                    }

                                    const gradColors = player.avatarGradient?.split('-') || ['purple', 'blue'];
                                    const fromColor = gradColors[0];
                                    const toColor = gradColors[1] || 'blue';

                                    return (
                                        <div key={player._id || player.userId || Math.random()} className={`flex items-center justify-between p-3 rounded-2xl border transition-colors ${rowBg}`}>
                                            <div className="flex items-center gap-4">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${rankBadge}`}>
                                                    {player.placement}
                                                </div>
                                                <div className={`w-10 h-10 rounded-full flex shrink-0 items-center justify-center text-white font-bold shadow-inner bg-gradient-to-br from-${fromColor}-500 to-${toColor}-500`}>
                                                    {(player.name?.[0] || 'U').toUpperCase()}
                                                </div>
                                                <span className={`text-base tracking-wide ${nameStyle}`}>
                                                    {player.name || 'Unknown'} {isMe && "(You)"}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 px-4">
                                                <div className="inline-flex items-center justify-center bg-gray-800 border border-gray-600 px-3 py-1 rounded-lg">
                                                    <span className="text-xl font-black text-white drop-shadow-sm">{player.wpm}</span>
                                                    <span className="text-[10px] text-gray-400 ml-1 mt-1 font-mono uppercase">wpm</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <button
                onClick={onBack}
                className="mt-6 px-8 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white font-semibold rounded-full shadow-lg hover:-translate-y-0.5 transition-all"
            >
                Back to Home
            </button>
        </div>
    );
};

export default History;
