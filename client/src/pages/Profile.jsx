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
    <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        padding: '20px',
        borderRadius: '16px',
        background: 'rgba(30,41,59,0.5)',
        border: '1px solid rgba(51,65,85,0.6)',
        flex: '1 1 0',
        minWidth: '0',
    }}>
        <span style={{ fontSize: '22px' }}>{icon}</span>
        <p style={{ margin: 0, fontSize: '10px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: '#64748b' }}>{label}</p>
        <p style={{ margin: 0, fontSize: '2rem', fontWeight: 900, color: '#fff' }}>{value ?? '—'}</p>
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
    const winRate = userData?.totalMatches
        ? Math.round((userData.wins / userData.totalMatches) * 100)
        : 0;


    if (loading) return (
        <div style={{ minHeight: '100vh', background: '#0d1117', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', fontFamily: 'sans-serif' }}>
            <div style={{ width: 44, height: 44, border: '4px solid rgba(56,189,248,0.15)', borderTopColor: '#38bdf8', borderRadius: '50%', animation: 'spin 0.9s linear infinite' }} />
            <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem', fontFamily: 'monospace', letterSpacing: '1px' }}>Loading profile…</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );

    if (error) return (
        <div style={{ minHeight: '100vh', background: '#0d1117', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p style={{ color: '#f87171', fontFamily: 'sans-serif' }}>{error}</p>
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', background: '#0d1117', color: '#fff', fontFamily: 'sans-serif', boxSizing: 'border-box' }}>

            <header style={{ maxWidth: 720, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 24px 0' }}>
                <button
                    onClick={() => navigate('/play')}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600, padding: 0 }}
                    onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                    onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
                >
                    ← Back to Home
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ background: 'linear-gradient(135deg,#38bdf8,#6366f1)', padding: 6, borderRadius: 12, boxShadow: '0 0 16px rgba(56,189,248,0.3)' }}>
                        <img src="/GlideKeyslogo.png" alt="Logo" width={34} height={28} style={{ borderRadius: 8, display: 'block' }} />
                    </div>
                    <span style={{ fontSize: '1.1rem', fontWeight: 900, background: 'linear-gradient(90deg,#38bdf8,#818cf8,#f472b6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Glide Keys
                    </span>
                </div>
            </header>

            <main style={{ maxWidth: 720, margin: '0 auto', padding: '28px 24px 60px', display: 'flex', flexDirection: 'column', gap: 24 }}>

                <div style={{ borderRadius: 24, background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(51,65,85,0.7)', overflow: 'hidden', position: 'relative' }}>

                    <div style={{ height: 3, background: 'linear-gradient(90deg,#38bdf8,#818cf8,#f472b6)' }} />

                    <div style={{ padding: '28px 28px 24px' }}>

                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 24, flexWrap: 'wrap' }}>

                            <div style={{ position: 'relative', flexShrink: 0 }}>
                                <div
                                    style={{
                                        width: 88,
                                        height: 88,
                                        borderRadius: '50%',
                                        background: `linear-gradient(135deg, ${grad.from}, ${grad.to})`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '2.5rem',
                                        fontWeight: 900,
                                        color: '#fff',
                                        boxShadow: `0 0 28px ${grad.from}55`,
                                        cursor: 'pointer',
                                        userSelect: 'none',
                                        transition: 'transform 0.2s',
                                    }}
                                    onClick={() => setShowGradPicker(p => !p)}
                                    title="Change avatar style"
                                >
                                    {initial}
                                </div>
                                <button
                                    onClick={() => setShowGradPicker(p => !p)}
                                    style={{
                                        position: 'absolute',
                                        bottom: 0,
                                        right: 0,
                                        width: 26,
                                        height: 26,
                                        borderRadius: '50%',
                                        background: '#1e293b',
                                        border: '2px solid #475569',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '12px',
                                        lineHeight: 1,
                                    }}
                                    title="Edit avatar"
                                >
                                    🎨
                                </button>
                            </div>

                            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6, paddingTop: 4 }}>

                                {editingName ? (
                                    <input
                                        ref={nameRef}
                                        autoFocus
                                        value={editName}
                                        onChange={e => setEditName(e.target.value)}
                                        maxLength={20}
                                        onKeyDown={e => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') handleCancel(); }}
                                        style={{
                                            fontSize: '1.6rem',
                                            fontWeight: 800,
                                            background: 'rgba(30,41,59,0.8)',
                                            border: '2px solid #3b82f6',
                                            borderRadius: 10,
                                            padding: '6px 12px',
                                            color: '#fff',
                                            outline: 'none',
                                            width: '100%',
                                            boxSizing: 'border-box',
                                            maxWidth: 280,
                                        }}
                                    />
                                ) : (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 900, textTransform: 'capitalize' }}>
                                            {userData.name || userData.username}
                                        </h1>
                                        <button
                                            onClick={() => { setEditingName(true); setTimeout(() => nameRef.current?.focus(), 50); }}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', padding: 4, lineHeight: 1, color: '#64748b', borderRadius: 6 }}
                                            title="Edit name"
                                        >
                                            ✏️
                                        </button>
                                    </div>
                                )}

                                <p style={{ margin: 0, color: '#64748b', fontFamily: 'monospace', fontSize: '0.85rem' }}>
                                    @{userData.username}
                                </p>
                                <p style={{ margin: 0, color: '#334155', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase' }}>
                                    Member since {new Date(userData.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                </p>
                            </div>
                        </div>

                        {showGradPicker && (
                            <div style={{
                                marginTop: 20,
                                padding: '16px',
                                background: 'rgba(15,23,42,0.8)',
                                border: '1px solid rgba(51,65,85,0.8)',
                                borderRadius: 16,
                            }}>
                                <p style={{ margin: '0 0 12px', fontSize: '10px', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', color: '#475569' }}>
                                    Choose Avatar Style
                                </p>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                                    {GRADIENTS.map(g => (
                                        <button
                                            key={g.id}
                                            onClick={() => { setSelectedGrad(g.id); }}
                                            style={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                gap: 6,
                                                background: selectedGrad === g.id ? 'rgba(59,130,246,0.15)' : 'transparent',
                                                border: selectedGrad === g.id ? '2px solid rgba(59,130,246,0.6)' : '2px solid transparent',
                                                borderRadius: 12,
                                                padding: '8px 12px',
                                                cursor: 'pointer',
                                                transition: 'all 0.15s',
                                            }}
                                        >
                                            <div style={{
                                                width: 44,
                                                height: 44,
                                                borderRadius: '50%',
                                                background: `linear-gradient(135deg, ${g.from}, ${g.to})`,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: '#fff',
                                                fontWeight: 900,
                                                fontSize: '1rem',
                                                boxShadow: selectedGrad === g.id ? `0 0 14px ${g.from}88` : 'none',
                                            }}>
                                                {initial}
                                            </div>
                                            <span style={{ color: '#94a3b8', fontSize: '11px', fontWeight: 600 }}>{g.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {isDirty && (
                            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    style={{
                                        padding: '10px 22px',
                                        background: saving ? '#334155' : '#2563eb',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: 12,
                                        fontWeight: 700,
                                        fontSize: '0.875rem',
                                        cursor: saving ? 'not-allowed' : 'pointer',
                                        transition: 'background 0.2s',
                                    }}
                                >
                                    {saving ? 'Saving…' : 'Save Changes'}
                                </button>
                                <button
                                    onClick={handleCancel}
                                    style={{
                                        padding: '10px 22px',
                                        background: 'rgba(30,41,59,0.8)',
                                        color: '#94a3b8',
                                        border: '1px solid #334155',
                                        borderRadius: 12,
                                        fontWeight: 700,
                                        fontSize: '0.875rem',
                                        cursor: 'pointer',
                                    }}
                                >
                                    Cancel
                                </button>
                            </div>
                        )}

                        {saveMsg && (
                            <p style={{ margin: '12px 0 0', fontSize: '0.85rem', fontWeight: 700, color: saveMsg.startsWith('✓') ? '#4ade80' : '#f87171' }}>
                                {saveMsg}
                            </p>
                        )}
                    </div>
                </div>

                <div>
                    <p style={{ margin: '0 0 12px', fontSize: '10px', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', color: '#475569' }}>
                        Your Stats
                    </p>
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                        <StatCard icon="⚡" label="Avg WPM" value={userData.avgWPM} />
                        <StatCard icon="🏆" label="Best WPM" value={userData.maxWPM} />
                        <StatCard icon="🥇" label="Total Wins" value={userData.wins} />
                        <StatCard icon="🎮" label="Races Played" value={userData.totalMatches} />
                    </div>
                </div>


                <div style={{ padding: '22px 24px', borderRadius: 20, background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(51,65,85,0.7)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <span style={{ fontWeight: 700, color: '#cbd5e1', fontSize: '0.9rem' }}>Win Rate</span>
                        <span style={{ fontWeight: 900, fontSize: '1.6rem', color: '#fff' }}>{winRate}%</span>
                    </div>
                    <div style={{ height: 10, borderRadius: 99, background: '#1e293b', overflow: 'hidden' }}>
                        <div style={{
                            height: '100%',
                            width: `${winRate}%`,
                            borderRadius: 99,
                            background: 'linear-gradient(90deg,#3b82f6,#8b5cf6)',
                            transition: 'width 0.8s ease',
                        }} />
                    </div>
                    <p style={{ margin: '10px 0 0', fontSize: '0.75rem', color: '#475569' }}>
                        {userData.wins} wins · {userData.totalMatches} total races
                    </p>
                </div>

                <button
                    onClick={() => navigate('/play')}
                    style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '18px 22px',
                        borderRadius: 18,
                        background: 'rgba(37,99,235,0.08)',
                        border: '1px solid rgba(37,99,235,0.25)',
                        color: '#fff',
                        cursor: 'pointer',
                        fontWeight: 600,
                        fontSize: '0.95rem',
                        transition: 'background 0.2s, border-color 0.2s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(37,99,235,0.18)'; e.currentTarget.style.borderColor = 'rgba(37,99,235,0.5)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(37,99,235,0.08)'; e.currentTarget.style.borderColor = 'rgba(37,99,235,0.25)'; }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ fontSize: '1.3rem' }}>🏎️</span>
                        Play a Race
                    </div>
                    <span style={{ color: '#475569' }}>→</span>
                </button>


                <button
                    onClick={handleLogout}
                    style={{
                        width: '100%',
                        padding: '16px 22px',
                        borderRadius: 18,
                        background: 'rgba(239,68,68,0.07)',
                        border: '1px solid rgba(239,68,68,0.2)',
                        color: '#f87171',
                        cursor: 'pointer',
                        fontWeight: 700,
                        fontSize: '0.9rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 10,
                        transition: 'background 0.2s, border-color 0.2s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.15)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.4)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.07)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.2)'; }}
                >
                    🚪 Log Out
                </button>

            </main>
        </div>
    );
};

export default Profile;