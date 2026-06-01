import React from 'react';
import { useNavigate } from 'react-router-dom';

const NAV_ACTIVE ="text-white relative after:content-[''] after:absolute after:-bottom-1.5 after:left-0 after:w-full after:h-0.5 after:bg-gradient-to-r after:from-[#38bdf8] after:to-[#f472b6] after:rounded-full";

const Header = ({ gameState, setGameState, username, name }) => {
    
    const navigate = useNavigate();
    const initial = (name?.[0] || username?.[0] || 'U').toUpperCase();

    const goHome = () => {
        setGameState('Home');
        navigate('/play');
    };

    const isPlayFlow = gameState === 'Home' || gameState === 'searching' || gameState === 'lobby' || gameState === 'countdown' || gameState === 'playing' || gameState === 'results';

    return (
        <header className="sticky top-0 z-50 w-full flex justify-between items-center mb-8 px-8 py-4 bg-[#0d1117]/80 backdrop-blur-xl border-b border-slate-800/80 shadow-2xl">

            <div className="flex items-center gap-3 cursor-pointer group" onClick={goHome}>
                <div className="bg-gradient-to-br from-[#38bdf8] to-[#6366f1] p-1.5 rounded-xl shadow-[0_0_20px_rgba(56,189,248,0.4)] group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 ease-out">
                    <img src="/GlideKeyslogo.png" alt="Logo" width="60" height="50" className="rounded-xl" />
                </div>
                <div className="flex flex-col hidden sm:flex">
                    <h1 className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#38bdf8] via-[#818cf8] to-[#f472b6] drop-shadow-lg">
                        Glide Keys
                    </h1>
                    <span className="text-[10px] font-mono text-gray-500 tracking-widest uppercase mt-0.5">
                        Multiplayer Typing
                    </span>
                </div>
            </div>

            <nav className="hidden md:flex items-center gap-8 font-medium text-base text-gray-400" aria-label="Primary">
                <button
                    type="button"
                    onClick={goHome}
                    className={`transition-colors hover:text-[#38bdf8] ${isPlayFlow ? NAV_ACTIVE : ''}`}
                >
                    Home
                </button>
                <button
                    type="button"
                    onClick={() => setGameState('leaderboard')}
                    className={`transition-all hover:text-[#38bdf8] ${gameState === 'leaderboard' ? NAV_ACTIVE : 'hover:-translate-y-0.5'}`}
                >
                    Leaderboard
                </button>
                <button
                    type="button"
                    onClick={() => setGameState('history')}
                    className={`transition-all hover:text-[#38bdf8] ${gameState === 'history' ? NAV_ACTIVE : 'hover:-translate-y-0.5'}`}
                >
                    History
                </button>
                <button
                    type="button"
                    onClick={() => setGameState('friends')}
                    className={`transition-all hover:text-[#38bdf8] ${gameState === 'friends' ? NAV_ACTIVE : 'hover:-translate-y-0.5'}`}
                >
                    Friends
                </button>
                <button
                    type="button"
                    onClick={() => setGameState('about')}
                    className={`transition-all hover:text-[#38bdf8] ${gameState === 'about' ? NAV_ACTIVE : 'hover:-translate-y-0.5'}`}
                >
                    About
                </button>
            </nav>


            <div className="flex items-center gap-4">

                <button
                    onClick={() => navigate('/profile')}
                    className="relative group cursor-pointer flex items-center gap-2 bg-slate-800/50 p-1.5 pr-4 rounded-full border border-slate-700 hover:border-slate-500 transition-all"
                >
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-600 to-blue-500 flex items-center justify-center text-white font-bold text-sm shadow-inner">
                        {initial}
                    </div>
                    <span className="text-sm font-bold text-gray-200 hidden sm:block tracking-wide">
                        {name || username || 'User'}
                    </span>
                    <div className="absolute inset-0 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.0)] group-hover:shadow-[0_0_15px_rgba(99,102,241,0.4)] transition-shadow pointer-events-none"></div>
                </button>
            </div>

        </header>
    );
}

export default Header;