import React, { useEffect, useState } from 'react';
import api from '../utils/api';

const StatCard = ({ icon, label, value }) => (
    <div className="flex flex-col gap-1.5 p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 flex-1 min-w-[100px] text-center">
        <span className="text-xl">{icon}</span>
        <p className="m-0 text-[10px] font-bold tracking-[1px] uppercase text-slate-500">{label}</p>
        <p className="m-0 text-2xl font-black text-white">{value ?? '—'}</p>
    </div>
);

const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    
    let interval = seconds / 31536000;
    if(interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if(interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if(interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if(interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if(interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
};

const Leaderboard = ({ onBack }) => {

    const [leaders, setLeaders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState(null);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try{
                const res = await api.get('/users/leaderboard');
                setLeaders(res.data);
            } catch(err){
                console.error("Failed to fetch leaderboard:", err);
            } finally{
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
                                        No records found.
                                    </td>
                                </tr>
                            ) : (
                                leaders.map((player, index) => {
                                    // Calculate gradients and styles based on rank
                                    let rankBadge = "";
                                    let rowStyle = "hover:bg-slate-800/40 transition-colors";
                                    let nameStyle = "text-gray-200";
                                    
                                    if(index === 0){
                                        rankBadge = "bg-gradient-to-br from-yellow-300 to-amber-600 shadow-[0_0_15px_rgba(251,191,36,0.5)] text-white";
                                        rowStyle = "bg-amber-500/5 hover:bg-amber-500/10 transition-colors";
                                        nameStyle = "text-amber-400 font-bold drop-shadow-md";
                                    } else if(index === 1){
                                        rankBadge = "bg-gradient-to-br from-gray-300 to-gray-500 shadow-[0_0_10px_rgba(156,163,175,0.4)] text-white";
                                        rowStyle = "bg-gray-400/5 hover:bg-gray-400/10 transition-colors";
                                        nameStyle = "text-gray-300 font-bold";
                                    } else if(index === 2){
                                        rankBadge = "bg-gradient-to-br from-orange-400 to-orange-700 shadow-[0_0_10px_rgba(234,88,12,0.4)] text-white";
                                        rowStyle = "bg-orange-500/5 hover:bg-orange-500/10 transition-colors";
                                        nameStyle = "text-orange-300 font-bold";
                                    } else{
                                        rankBadge = "bg-slate-700 text-gray-400 font-semibold";
                                    }

                                    return (
                                        <tr key={player._id} className={`${rowStyle} cursor-pointer`} onClick={() => setSelectedUser(player)}>
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

            {selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setSelectedUser(null)}>
                    <div className="bg-[#0d1117] border border-slate-700/70 rounded-3xl w-full max-w-md overflow-hidden relative shadow-2xl transform transition-all scale-100" onClick={e => e.stopPropagation()}>
                        <div className="h-[4px] bg-gradient-to-r from-amber-400 via-orange-500 to-red-500" />
                        <div className="p-7">
                            <button onClick={() => setSelectedUser(null)} className="absolute top-5 right-5 text-slate-400 hover:text-white transition-colors bg-slate-800/50 hover:bg-slate-700 rounded-full p-1">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                            <div className="flex items-center gap-5 mb-6">
                                <div className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl font-black text-white shadow-[0_0_20px_rgba(0,0,0,0.3)] bg-gradient-to-br from-${selectedUser.avatarGradient?.split('-')[0] || 'purple'}-500 to-${selectedUser.avatarGradient?.split('-')[1] || 'blue'}-500`}>
                                    {(selectedUser.name?.[0] || selectedUser.username?.[0] || 'U').toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-2xl font-black text-white capitalize m-0 truncate">{selectedUser.name || selectedUser.username}</h3>
                                    <p className="text-slate-400 font-mono text-sm m-0 mt-1 truncate">@{selectedUser.username}</p>
                                    {selectedUser.createdAt && (
                                        <p className="text-[10px] text-slate-500 mt-2 font-bold uppercase tracking-[0.1em]">
                                            Joined {new Date(selectedUser.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3 mb-5">
                                <StatCard icon="⚡" label="Avg WPM" value={Math.round(selectedUser.avgWPM || 0)} />
                                <StatCard icon="🏆" label="Best WPM" value={selectedUser.maxWPM || selectedUser.bestRaceWPM || 0} />
                                <StatCard icon="🥇" label="Total Wins" value={selectedUser.wins || 0} />
                                <StatCard icon="🎮" label="Races Played" value={selectedUser.totalMatches || 0} />
                            </div>
                            {selectedUser.totalMatches > 0 && (
                                <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-700/70">
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="font-bold text-slate-400 text-xs uppercase tracking-wider">Win Rate</span>
                                        <span className="font-black text-xl text-white">{Math.round(((selectedUser.wins || 0) / selectedUser.totalMatches) * 100)}%</span>
                                    </div>
                                    <div className="h-2.5 rounded-full bg-slate-800 overflow-hidden">
                                        <div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-red-500 transition-all duration-700 ease-out" style={{ width: `${Math.round(((selectedUser.wins || 0) / selectedUser.totalMatches) * 100)}%` }} />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Leaderboard;
