import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const GRADIENTS = [
    { id: 'purple-blue', from: '#7c3aed', to: '#2563eb', label: 'Nebula' },
    { id: 'pink-orange', from: '#ec4899', to: '#f97316', label: 'Sunset' },
    { id: 'teal-green', from: '#14b8a6', to: '#22c55e', label: 'Aurora' },
    { id: 'red-pink', from: '#ef4444', to: '#ec4899', label: 'Nova' },
    { id: 'yellow-orange', from: '#eab308', to: '#f97316', label: 'Solar' },
    { id: 'cyan-blue', from: '#06b6d4', to: '#3b82f6', label: 'Ocean' },
];

const StatCard = ({ icon, label, value }) => (
    <div className="flex flex-col gap-2.5 p-5 rounded-2xl bg-slate-800/50 border border-slate-700/60 flex-1 min-w-[120px]">
        <span className="text-2xl">{icon}</span>
        <p className="m-0 text-[10px] font-bold tracking-[2px] uppercase text-slate-500">{label}</p>
        <p className="m-0 text-3xl font-black text-white">{value ?? '—'}</p>
    </div>
);

const Profile = () => {

    const navigate = useNavigate();
    const nameRef = useRef(null);

    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);
    const [saveMsg, setSaveMsg] = useState('');
    const [editName, setEditName] = useState('');
    const [editingName, setEditingName] = useState(false);
    const [selectedGrad, setSelectedGrad] = useState(GRADIENTS[0].id);
    const [showGradPicker, setShowGradPicker] = useState(false);
    const [isDirty, setIsDirty] = useState(false);

    useEffect(() => {
        api.get('/users/profile')
            .then(res => {
                setUserData(res.data);
                setEditName(res.data.name || res.data.username);
                setSelectedGrad(res.data.avatarGradient || GRADIENTS[0].id);
            })
            .catch(() => setError('Failed to load profile. Please try again.'))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (!userData) return;
        const nameChanged = editName.trim() !== (userData.name || userData.username);
        const gradChanged = selectedGrad !== (userData.avatarGradient || GRADIENTS[0].id);
        setIsDirty(nameChanged || gradChanged);
    }, [editName, selectedGrad, userData]);

    const handleSave = async () => {
        setSaving(true);
        setSaveMsg('');
        try {
            const res = await api.patch('/users/profile', {
                name: editName.trim(),
                avatarGradient: selectedGrad,
            });
            setUserData(res.data);
            setEditingName(false);
            setShowGradPicker(false);
            setIsDirty(false);
            setSaveMsg('✓ Profile updated!');
            setTimeout(() => setSaveMsg(''), 3000);
        } catch (err) {
            setSaveMsg('✗ ' + (err.response?.data?.message || 'Save failed.'));
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setEditName(userData.name || userData.username);
        setSelectedGrad(userData.avatarGradient || GRADIENTS[0].id);
        setEditingName(false);
        setShowGradPicker(false);
        setIsDirty(false);
        setSaveMsg('');
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('gk_username');
        localStorage.removeItem('gk_name');
        navigate('/login', { replace: true });
    };

    const grad = GRADIENTS.find(g => g.id === selectedGrad) || GRADIENTS[0];
    const initial = (userData?.username?.[0] || 'U').toUpperCase();
    const winRate = userData?.totalMatches ? Math.round((userData.wins / userData.totalMatches) * 100) : 0;

    if (loading) return (
        <div className="min-h-screen bg-[#0d1117] flex flex-col items-center justify-center gap-6 font-sans">
            <div className="w-11 h-11 border-4 border-sky-400/15 border-t-sky-400 rounded-full animate-spin" />
            <p className="m-0 text-slate-500 text-sm font-mono tracking-wide">Loading profile…</p>
        </div>
    );

    if (error) return (
        <div className="min-h-screen bg-[#0d1117] flex items-center justify-center font-sans">
            <p className="text-red-400">{error}</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#0d1117] text-white font-sans box-border">

            <header className="max-w-2xl mx-auto flex justify-between items-center px-6 pt-6">
                <button
                    onClick={() => navigate('/play')}
                    className="flex items-center gap-1.5 bg-transparent border-none text-slate-400 hover:text-white cursor-pointer text-sm font-semibold transition-colors p-0"
                >
                    ← Back to Home
                </button>
                <div className="flex items-center gap-2.5">
                    <div className="bg-gradient-to-br from-sky-400 to-indigo-500 p-1.5 rounded-xl shadow-[0_0_16px_rgba(56,189,248,0.3)]">
                        <img src="/GlideKeyslogo.png" alt="Logo" width={34} height={28} className="rounded-lg block" />
                    </div>
                    <span className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-indigo-400 to-pink-400">
                        Glide Keys
                    </span>
                </div>
            </header>

            <main className="max-w-2xl mx-auto px-6 pt-7 pb-16 flex flex-col gap-6">

                <div className="rounded-3xl bg-slate-900/60 border border-slate-700/70 overflow-hidden relative">
                    <div className="h-[3px] bg-gradient-to-r from-sky-400 via-indigo-400 to-pink-400" />
                    
                    <div className="p-7 pb-6">
                        <div className="flex items-start gap-6 flex-wrap">
                            
                            <div className="relative shrink-0">
                                <div
                                    className="w-[88px] h-[88px] rounded-full flex items-center justify-center text-4xl font-black text-white cursor-pointer select-none transition-transform duration-200 hover:scale-105"
                                    style={{
                                        background: `linear-gradient(135deg, ${grad.from}, ${grad.to})`,
                                        boxShadow: `0 0 28px ${grad.from}55`,
                                    }}
                                    onClick={() => setShowGradPicker(p => !p)}
                                    title="Change avatar style"
                                >
                                    {initial}
                                </div>
                                <button
                                    onClick={() => setShowGradPicker(p => !p)}
                                    className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-slate-800 border-2 border-slate-600 cursor-pointer flex items-center justify-center text-[12px] leading-none hover:bg-slate-700 transition-colors"
                                    title="Edit avatar"
                                >
                                    🎨
                                </button>
                            </div>

                            {/* user information*/}
                            <div className="flex-1 min-w-0 flex flex-col gap-1.5 pt-1">
                                {editingName ? (
                                    <input
                                        ref={nameRef}
                                        autoFocus
                                        value={editName}
                                        onChange={e => setEditName(e.target.value)}
                                        maxLength={20}
                                        onKeyDown={e => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') handleCancel(); }}
                                        className="text-2xl font-extrabold bg-slate-800/80 border-2 border-blue-500 rounded-lg px-3 py-1.5 text-white outline-none w-full max-w-[280px]"
                                    />
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <h1 className="m-0 text-2xl font-black capitalize">
                                            {userData.name || userData.username}
                                        </h1>
                                        <button
                                            onClick={() => { setEditingName(true); setTimeout(() => nameRef.current?.focus(), 50); }}
                                            className="bg-transparent border-none cursor-pointer text-base p-1 text-slate-500 hover:text-slate-300 transition-colors rounded-md leading-none"
                                            title="Edit name"
                                        >
                                            ✏️
                                        </button>
                                    </div>
                                )}

                                <p className="m-0 text-slate-500 font-mono text-sm">
                                    @{userData.username}
                                </p>
                                <p className="m-0 mt-1 text-slate-400 text-xs font-bold tracking-[0.2em] uppercase">
                                    Member since {new Date(userData.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                </p>
                            </div>
                        </div>

                        {/* Gradient picker*/}
                        {showGradPicker && (
                            <div className="mt-5 p-4 bg-slate-900/80 border border-slate-700/80 rounded-2xl">
                                <p className="m-0 mb-3 text-[10px] font-bold tracking-[0.3em] uppercase text-slate-500">
                                    Choose Avatar Style
                                </p>
                                <div className="flex flex-wrap gap-3">
                                    {GRADIENTS.map(g => (
                                        <button
                                            key={g.id}
                                            onClick={() => setSelectedGrad(g.id)}
                                            className={`flex flex-col items-center gap-1.5 rounded-xl px-3 py-2 cursor-pointer transition-all duration-150 ${selectedGrad === g.id ? 'bg-blue-500/15 border-blue-500/60 border-2' : 'bg-transparent border-transparent border-2 hover:bg-slate-800/50'}`}
                                        >
                                            <div 
                                                className="w-11 h-11 rounded-full flex items-center justify-center text-white font-black text-base"
                                                style={{
                                                    background: `linear-gradient(135deg, ${g.from}, ${g.to})`,
                                                    boxShadow: selectedGrad === g.id ? `0 0 14px ${g.from}88` : 'none',
                                                }}
                                            >
                                                {initial}
                                            </div>
                                            <span className="text-slate-400 text-[11px] font-semibold">{g.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Save or cancel buttons*/}
                        {isDirty && (
                            <div className="flex gap-2.5 mt-5">
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className={`px-5 py-2.5 rounded-xl font-bold text-sm text-white border-none transition-colors duration-200 ${saving ? 'bg-slate-700 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 cursor-pointer'}`}
                                >
                                    {saving ? 'Saving…' : 'Save Changes'}
                                </button>
                                <button
                                    onClick={handleCancel}
                                    className="px-5 py-2.5 bg-slate-800/80 text-slate-400 border border-slate-700 rounded-xl font-bold text-sm cursor-pointer hover:bg-slate-700 hover:text-slate-300 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        )}

                        {saveMsg && (
                            <p className={`m-0 mt-3 text-sm font-bold ${saveMsg.startsWith('✓') ? 'text-green-400' : 'text-red-400'}`}>
                                {saveMsg}
                            </p>
                        )}
                    </div>
                </div>

                {/* Stats-grid*/}
                <div>
                    <p className="m-0 mb-3 text-[10px] font-bold tracking-[0.3em] uppercase text-slate-500">
                        Your Stats
                    </p>
                    <div className="flex gap-3 flex-wrap">
                        <StatCard icon="⚡" label="Avg WPM" value={userData.avgWPM} />
                        <StatCard icon="🏆" label="Best WPM" value={userData.maxWPM} />
                        <StatCard icon="🥇" label="Total Wins" value={userData.wins} />
                        <StatCard icon="🎮" label="Races Played" value={userData.totalMatches} />
                    </div>
                </div>

                {/* Wins data */}
                <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/60 border border-slate-700/70">
                    <div className="flex justify-between items-center mb-3">
                        <span className="font-bold text-slate-300 text-sm">Win Rate</span>
                        <span className="font-black text-2xl text-white">{winRate}%</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-slate-800 overflow-hidden">
                        <div 
                            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-violet-500 transition-all duration-700 ease-out"
                            style={{ width: `${winRate}%` }} 
                        />
                    </div>
                    <p className="m-0 mt-2.5 text-xs text-slate-500">
                        {userData.wins} wins · {userData.totalMatches} total races
                    </p>
                </div>

                {/* Action Buttons*/}
                <button
                    onClick={() => navigate('/play')}
                    className="w-full flex items-center justify-between px-6 py-4 rounded-2xl bg-blue-600/10 border border-blue-600/30 text-white cursor-pointer font-semibold text-base transition-all duration-200 hover:bg-blue-600/20 hover:border-blue-600/50"
                >
                    <div className="flex items-center gap-3">
                        <span className="text-xl">🏎️</span>
                        Find a race
                    </div>
                    <span className="text-slate-400">→</span>
                </button>

                <button
                    onClick={handleLogout}
                    className="w-full px-6 py-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 cursor-pointer font-bold text-sm flex items-center justify-center gap-2.5 transition-all duration-200 hover:bg-red-500/20 hover:border-red-500/40"
                >
                    Log Out
                </button>

            </main>
        </div>
    );
};

export default Profile;