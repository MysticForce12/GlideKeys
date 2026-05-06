import React from 'react';

const Home = ({ handlePlay, handleCustomRoom }) => {

    const gameModes = [
        {
            id: 'solo',
            title: 'Solo Practice',
            desc: 'Warm up your fingers with no pressure.',
            icon: '🎯', 
            glowColor: 'group-hover:shadow-[0_0_20px_rgba(16,185,129,0.3)]',
            accent: 'bg-emerald-500'
        },
        {
            id: '1v1',
            title: '1v1 Duel',
            desc: 'Fast-paced, head-to-head typing battle.',
            icon: '⚔️',
            glowColor: 'group-hover:shadow-[0_0_20px_rgba(249,115,22,0.3)]',
            accent: 'bg-orange-500'
        },
        {
            id: 'arena',
            title: 'Arena',
            desc: 'The classic chaotic multiplayer race with up to 5 players.',
            icon: '🏎️',
            glowColor: 'group-hover:shadow-[0_0_20px_rgba(79,70,229,0.3)]',
            accent: 'bg-indigo-500'
        },
        {
            id: 'custom',
            title: 'Custom Room',
            desc: 'Create or join a private room with friends.',
            icon: '👑',
            glowColor: 'group-hover:shadow-[0_0_20px_rgba(168,85,247,0.3)]',
            accent: 'bg-purple-500'
        }
    ];

    return (
        <div className="flex flex-col items-center justify-center mt-16 space-y-10 animate-fade-in w-full max-w-4xl mx-auto px-6">
            <div className="text-center">
                <h2 className="text-4xl font-extrabold text-white mb-3 tracking-wide">Choose Your Game Mode</h2>
                <p className="text-gray-400 text-lg">Select a game mode to start typing.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                {gameModes.map((mode) => (
                    <button
                        key={mode.id}
                        onClick={() => mode.id === 'custom' ? handleCustomRoom() : handlePlay(mode.id)}
                        className={`group relative flex flex-col items-start p-6 rounded-2xl bg-slate-800/40 border border-slate-700 hover:border-slate-500 hover:-translate-y-1 transition-all duration-300 text-left overflow-hidden ${mode.glowColor}`}
                    >
                        <div className="flex items-center justify-between w-full mb-4">
                            <span className="text-3xl">{mode.icon}</span>
                            <div className={`h-2 w-2 rounded-full ${mode.accent} opacity-50 group-hover:opacity-100 shadow-[0_0_8px_currentColor] transition-opacity`}></div>
                        </div>
                        
                        <h3 className="text-2xl font-bold text-gray-200 mb-2 group-hover:text-white transition-colors">
                            {mode.title}
                        </h3>
                        <p className="text-gray-400 text-sm">
                            {mode.desc}
                        </p>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default Home;