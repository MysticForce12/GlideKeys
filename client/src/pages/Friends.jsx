import { useEffect, useState, useCallback } from 'react';
import api from '../utils/api';

const GRADIENT_MAP = {
    'purple-blue': ['#7c3aed', '#2563eb'],
    'pink-orange': ['#ec4899', '#f97316'],
    'teal-green': ['#14b8a6', '#22c55e'],
    'red-pink': ['#ef4444', '#ec4899'],
    'yellow-orange': ['#eab308', '#f97316'],
    'cyan-blue': ['#06b6d4', '#3b82f6'],
};

const avatarStyle = (gradientId) => {
    const [from, to] = GRADIENT_MAP[gradientId] || GRADIENT_MAP['purple-blue'];
    return {
        background: `linear-gradient(135deg, ${from}, ${to})`,
        boxShadow: `0 0 16px ${from}44`,
    };
};

const FriendCard = ({ user, onRemove, removing }) => {
    const initial = (user.name?.[0] || user.username?.[0] || 'U').toUpperCase();

    return (
        <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-slate-800/40 border border-slate-700/50 hover:border-slate-600/60 transition-colors">
            <div className="flex items-center gap-4 min-w-0">
                <div
                    className="w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold text-lg"
                    style={avatarStyle(user.avatarGradient)}
                >
                    {initial}
                </div>
                <div className="min-w-0">
                    <p className="m-0 font-bold text-white capitalize truncate">
                        {user.name || user.username}
                    </p>
                    <p className="m-0 text-slate-500 font-mono text-sm truncate">@{user.username}</p>
                    <p className="m-0 mt-1 text-xs text-slate-400">
                        {user.avgWPM ?? 0} avg WPM · {user.wins ?? 0} wins
                    </p>
                </div>
            </div>
            <button
                onClick={() => onRemove(user._id)}
                disabled={removing}
                className="shrink-0 px-3 py-1.5 text-xs font-semibold text-red-400 bg-red-500/10 border border-red-500/25 rounded-lg hover:bg-red-500/20 transition-colors disabled:opacity-50"
            >
                {removing ? '…' : 'Remove'}
            </button>
        </div>
    );
};

const RequestCard = ({ user, onAccept, onReject, acting }) => {
    const initial = (user.name?.[0] || user.username?.[0] || 'U').toUpperCase();

    return (
        <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/25">
            <div className="flex items-center gap-4 min-w-0">
                <div
                    className="w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold text-lg"
                    style={avatarStyle(user.avatarGradient)}
                >
                    {initial}
                </div>
                <div className="min-w-0">
                    <p className="m-0 font-bold text-white capitalize truncate">
                        {user.name || user.username}
                    </p>
                    <p className="m-0 text-slate-500 font-mono text-sm truncate">@{user.username}</p>
                </div>
            </div>
            <div className="flex gap-2 shrink-0">
                <button
                    onClick={() => onAccept(user._id)}
                    disabled={acting}
                    className="px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 transition-colors disabled:opacity-50"
                >
                    Accept
                </button>
                <button
                    onClick={() => onReject(user._id)}
                    disabled={acting}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-400 bg-slate-800 border border-slate-600 rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-50"
                >
                    Decline
                </button>
            </div>
        </div>
    );
};

const Friends = ({ onBack }) => {
    const [friends, setFriends] = useState([]);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState('friends');
    const [addUsername, setAddUsername] = useState('');
    const [addLoading, setAddLoading] = useState(false);
    const [addMsg, setAddMsg] = useState('');
    const [actingId, setActingId] = useState(null);
    const [removingId, setRemovingId] = useState(null);

    const loadData = useCallback(async () => {
        try {
            const [friendsRes, requestsRes] = await Promise.all([
                api.get('/users/friends'),
                api.get('/users/friends/requests'),
            ]);
            setFriends(friendsRes.data);
            setRequests(requestsRes.data);
        } catch (err) {
            console.error('Failed to load friends:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleAddFriend = async (e) => {
        e.preventDefault();
        const trimmed = addUsername.trim().toLowerCase();
        if (!trimmed) return;

        setAddLoading(true);
        setAddMsg('');
        try {
            const res = await api.post('/users/friends/request', { username: trimmed });
            setAddMsg('✓ ' + (res.data.message || 'Request sent!'));
            setAddUsername('');
        } catch (err) {
            setAddMsg('✗ ' + (err.response?.data?.message || 'Could not send request.'));
        } finally {
            setAddLoading(false);
            setTimeout(() => setAddMsg(''), 4000);
        }
    };

    const handleAccept = async (userId) => {
        setActingId(userId);
        try {
            await api.post(`/users/friends/accept/${userId}`);
            await loadData();
            setTab('friends');
        } catch (err) {
            console.error(err);
        } finally {
            setActingId(null);
        }
    };

    const handleReject = async (userId) => {
        setActingId(userId);
        try {
            await api.delete(`/users/friends/requests/${userId}`);
            setRequests(prev => prev.filter(r => r._id !== userId));
        } catch (err) {
            console.error(err);
        } finally {
            setActingId(null);
        }
    };

    const handleRemove = async (userId) => {
        setRemovingId(userId);
        try {
            await api.delete(`/users/friends/${userId}`);
            setFriends(prev => prev.filter(f => f._id !== userId));
        } catch (err) {
            console.error(err);
        } finally {
            setRemovingId(null);
        }
    };

    return (
        <div className="flex flex-col items-center justify-start mt-8 space-y-8 animate-fade-in w-full max-w-2xl mx-auto px-4 pb-20">
            <div className="text-center">
                <h2 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 mb-4 tracking-tight drop-shadow-lg">
                    Friends
                </h2>
                <p className="text-gray-400 text-lg font-medium">
                    Add pilots by username and manage your squad.
                </p>
            </div>

            <form
                onSubmit={handleAddFriend}
                className="w-full flex gap-2 p-2 rounded-2xl bg-[#111620]/80 border border-gray-700/50 shadow-xl"
            >
                <input
                    type="text"
                    value={addUsername}
                    onChange={e => setAddUsername(e.target.value)}
                    placeholder="Enter username to add…"
                    maxLength={20}
                    className="flex-1 bg-slate-900/80 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 outline-none focus:border-teal-500/60 font-mono text-sm"
                />
                <button
                    type="submit"
                    disabled={addLoading || !addUsername.trim()}
                    className="px-6 py-3 rounded-xl font-bold text-sm text-white bg-teal-600 hover:bg-teal-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                >
                    {addLoading ? 'Sending…' : 'Add Friend'}
                </button>
            </form>
            {addMsg && (
                <p className={`m-0 -mt-4 text-sm font-bold w-full text-left ${addMsg.startsWith('✓') ? 'text-green-400' : 'text-red-400'}`}>
                    {addMsg}
                </p>
            )}

            <div className="w-full flex gap-2 p-1 rounded-xl bg-slate-900/60 border border-slate-700/50">
                <button
                    type="button"
                    onClick={() => setTab('friends')}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-colors ${tab === 'friends' ? 'bg-teal-600/20 text-teal-300 border border-teal-500/40' : 'text-slate-400 hover:text-white'}`}
                >
                    Friends ({friends.length})
                </button>
                <button
                    type="button"
                    onClick={() => setTab('requests')}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-colors relative ${tab === 'requests' ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40' : 'text-slate-400 hover:text-white'}`}
                >
                    Requests
                    {requests.length > 0 && (
                        <span className="ml-1.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-black bg-indigo-500 text-white rounded-full">
                            {requests.length}
                        </span>
                    )}
                </button>
            </div>

            <div className="w-full bg-[#111620]/80 backdrop-blur-xl rounded-3xl border border-gray-700/50 shadow-2xl p-6 min-h-[200px]">
                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="w-10 h-10 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin" />
                    </div>
                ) : tab === 'friends' ? (
                    friends.length === 0 ? (
                        <p className="text-center text-slate-500 py-10 font-medium">
                            No friends yet. Send a request using someone's @username.
                        </p>
                    ) : (
                        <div className="flex flex-col gap-3">
                            {friends.map(user => (
                                <FriendCard
                                    key={user._id}
                                    user={user}
                                    onRemove={handleRemove}
                                    removing={removingId === user._id}
                                />
                            ))}
                        </div>
                    )
                ) : requests.length === 0 ? (
                    <p className="text-center text-slate-500 py-10 font-medium">
                        No pending friend requests.
                    </p>
                ) : (
                    <div className="flex flex-col gap-3">
                        {requests.map(user => (
                            <RequestCard
                                key={user._id}
                                user={user}
                                onAccept={handleAccept}
                                onReject={handleReject}
                                acting={actingId === user._id}
                            />
                        ))}
                    </div>
                )}
            </div>

            <button
                onClick={onBack}
                className="px-8 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white font-semibold rounded-full shadow-lg hover:-translate-y-0.5 transition-all"
            >
                Back to Home
            </button>
        </div>
    );
};

export default Friends;
