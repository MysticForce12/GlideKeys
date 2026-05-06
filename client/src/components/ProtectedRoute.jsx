import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import api from "../utils/api";
import { jwtDecode } from "jwt-decode";

/* ── Themed full-screen loading screen ── */
const LoadingScreen = () => (
    <div
        style={{
            minHeight: '100vh',
            background: '#0d1117',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '2rem',
            fontFamily: 'sans-serif',
        }}
    >
        {/* Logo + title */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <div
                style={{
                    background: 'linear-gradient(135deg, #38bdf8, #6366f1)',
                    padding: '12px',
                    borderRadius: '18px',
                    boxShadow: '0 0 40px rgba(56,189,248,0.35)',
                    animation: 'glide-pulse 2s ease-in-out infinite',
                }}
            >
                <img src="/GlideKeyslogo.png" alt="Glide Keys" width="64" height="54" style={{ borderRadius: '12px', display: 'block' }} />
            </div>

            <div style={{ textAlign: 'center' }}>
                <h1
                    style={{
                        margin: 0,
                        fontSize: '2.2rem',
                        fontWeight: 900,
                        letterSpacing: '-0.5px',
                        background: 'linear-gradient(90deg, #38bdf8, #818cf8, #f472b6)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                    }}
                >
                    Glide Keys
                </h1>
                <p style={{ margin: '4px 0 0', fontSize: '10px', color: '#4b5563', letterSpacing: '4px', textTransform: 'uppercase', fontFamily: 'monospace' }}>
                    Multiplayer Arena
                </p>
            </div>
        </div>

        {/* Spinner */}
        <div
            style={{
                width: '48px',
                height: '48px',
                border: '4px solid rgba(56,189,248,0.15)',
                borderTopColor: '#38bdf8',
                borderRadius: '50%',
                animation: 'glide-spin 0.9s linear infinite',
            }}
        />

        {/* Status text */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
            <p
                style={{
                    margin: 0,
                    color: '#94a3b8',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    letterSpacing: '1px',
                    animation: 'glide-fade 1.8s ease-in-out infinite',
                }}
            >
                Verifying security clearance
            </p>
            <div style={{ display: 'flex', gap: '5px' }}>
                {[0, 1, 2].map(i => (
                    <div
                        key={i}
                        style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            background: '#38bdf8',
                            animation: `glide-dot 1.2s ease-in-out ${i * 0.2}s infinite`,
                        }}
                    />
                ))}
            </div>
        </div>

        {/* Keyframe styles injected inline */}
        <style>{`
            @keyframes glide-spin {
                to { transform: rotate(360deg); }
            }
            @keyframes glide-pulse {
                0%, 100% { box-shadow: 0 0 30px rgba(56,189,248,0.3); }
                50%       { box-shadow: 0 0 55px rgba(99,102,241,0.55); }
            }
            @keyframes glide-fade {
                0%, 100% { opacity: 0.5; }
                50%       { opacity: 1; }
            }
            @keyframes glide-dot {
                0%, 80%, 100% { transform: scale(0.6); opacity: 0.3; }
                40%           { transform: scale(1.2); opacity: 1; }
            }
        `}</style>
    </div>
);

const ProtectedRoute = ({ children }) => {
    
    const [isValid, setIsValid] = useState(null);

    useEffect(() => {

        const verifyToken = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                return setIsValid(false);
            }
            try {
                const decodedtoken = jwtDecode(token);
                const currentTime = Date.now() / 1000;
                if (decodedtoken.exp < currentTime) {
                    localStorage.removeItem("token");
                    return setIsValid(false);
                }

                await api.get('/users/profile');
                setIsValid(true);

            } catch(err) {
                localStorage.removeItem('token'); 
                setIsValid(false);
            }
        };
        verifyToken();

    }, []);

    if (isValid === null) return <LoadingScreen />;
    if (isValid === false) return <Navigate to="/login" replace />;
    return children;
};

export default ProtectedRoute;