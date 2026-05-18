import React, { useEffect, useState } from 'react';
import api from '../utils/api';

const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
};

const Leaderboard = ({ onBack }) => {
    const [leaders, setLeaders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const res = await api.get('/users/leaderboard');
                setLeaders(res.data);
            } catch (err) {
                console.error("Failed to fetch leaderboard:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboard();
    }, []);

    return (
        <div className="flex flex-col items-center justify-start mt-8 space-y-8 animate-fade-in w-full max-w-5xl mx-auto px-4 pb-20">
            <div className="text-center">
                <h2 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 mb-4 tracking-tight drop-shadow-lg">Hall of Fame</h2>
                <p className="text-gray-400 text-lg font-medium">Top players across all competitive modes.</p>
            </div>

            <div className="w-full bg-[#111620]/80 backdrop-blur-xl rounded-3xl border border-gray-700/50 shadow-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-800/50 border-b border-gray-700/50">
                                <th className="p-5 font-semibold text-gray-400 w-24 text-center">Rank</th>
                                <th className="p-5 font-semibold text-gray-400">Player</th>
                                <th className="p-5 font-semibold text-gray-400 text-center">WPM</th>
                                <th className="p-5 font-semibold text-gray-400 text-center">Mode</th>
                                <th className="p-5 font-semibold text-gray-400 text-right pr-8">Achieved</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700/30">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="p-12 text-center">
                                        <div className="w-10 h-10 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mx-auto"></div>
                                    </td>
                                </tr>
                            ) : leaders.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="p-12 text-center text-gray-500 font-medium">
                                        No records found yet. Be the first to set a high score!
                                    </td>
                                </tr>
                            ) : (
                                leaders.map((player, index) => {
                                    // Calculate gradients and styles based on rank
                                    let rankBadge = "";
                                    let rowStyle = "hover:bg-slate-800/40 transition-colors";
                                    let nameStyle = "text-gray-200";
                                    
                                    if (index === 0) {
                                        rankBadge = "bg-gradient-to-br from-yellow-300 to-amber-600 shadow-[0_0_15px_rgba(251,191,36,0.5)] text-white";
                                        rowStyle = "bg-amber-500/5 hover:bg-amber-500/10 transition-colors";
                                        nameStyle = "text-amber-400 font-bold drop-shadow-md";
                                    } else if (index === 1) {
                                        rankBadge = "bg-gradient-to-br from-gray-300 to-gray-500 shadow-[0_0_10px_rgba(156,163,175,0.4)] text-white";
                                        rowStyle = "bg-gray-400/5 hover:bg-gray-400/10 transition-colors";
                                        nameStyle = "text-gray-300 font-bold";
                                    } else if (index === 2) {
                                        rankBadge = "bg-gradient-to-br from-orange-400 to-orange-700 shadow-[0_0_10px_rgba(234,88,12,0.4)] text-white";
                                        rowStyle = "bg-orange-500/5 hover:bg-orange-500/10 transition-colors";
                                        nameStyle = "text-orange-300 font-bold";
                                    } else {
                                        rankBadge = "bg-slate-700 text-gray-400 font-semibold";
                                    }

                                    return (
                                        <tr key={player._id} className={rowStyle}>
                                            <td className="p-4 text-center">
                                                <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center text-sm font-bold ${rankBadge}`}>
                                                    {index + 1}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-10 h-10 rounded-full flex flex-shrink-0 items-center justify-center text-white font-bold shadow-inner bg-gradient-to-br from-${player.avatarGradient?.split('-')[0] || 'purple'}-500 to-${player.avatarGradient?.split('-')[1] || 'blue'}-500`}>
                                                        {(player.name?.[0] || player.username?.[0] || 'U').toUpperCase()}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className={`text-base tracking-wide ${nameStyle}`}>
                                                            {player.name || player.username || 'Unknown'}
                                                        </span>
                                                        <span className="text-xs text-gray-500 font-mono">@{player.username}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4 text-center">
                                                <div className="inline-flex items-center justify-center bg-gray-800 border border-gray-600 px-3 py-1 rounded-lg">
                                                    <span className="text-xl font-black text-white drop-shadow-sm">{player.bestRaceWPM}</span>
                                                    <span className="text-[10px] text-gray-400 ml-1 mt-1 font-mono uppercase">wpm</span>
                                                </div>
                                            </td>
                                            <td className="p-4 text-center">
                                                <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full text-xs font-semibold tracking-wider uppercase">
                                                    {player.bestRaceMode || 'arena'}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right pr-8 text-sm text-gray-400 font-medium">
                                                {player.bestRaceDate ? timeAgo(player.bestRaceDate) : '-'}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <button
                onClick={onBack}
                className="mt-6 px-8 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white font-semibold rounded-full shadow-lg hover:-translate-y-0.5 transition-all"
            >
                Back to Home
            </button>
        </div>
    );
};

export default Leaderboard;
