import React from 'react';
import arenaIcon from '../assets/icons/arena2-icon.png';
import customIcon from '../assets/icons/custom-icon.png';
import duelIcon from '../assets/icons/duel-icon.png';
import practiseIcon from '../assets/icons/practise-icon.png';

const Home = ({ handlePlay, handleCustomRoom }) => {

    const gameModes = [
        {
            id: 'arena',
            title: 'Arena',
            desc: 'The classic chaotic multiplayer race with up to 5 players.',
            icon: <img src={arenaIcon} alt="Arena Icon" className="w-20 h-20 md:w-24 md:h-24 object-contain relative z-10" />,
            glowColor: 'group-hover:shadow-[0_0_28px_rgba(56,189,248,0.2)]',
        },
        {
            id: 'solo',
            title: 'Practice',
            desc: 'Warm up your fingers with no pressure.',
            icon: <img src={practiseIcon} alt="Arena Icon" className="w-20 h-20 md:w-24 md:h-24 object-contain relative z-10" />,
            glowColor: 'group-hover:shadow-[0_0_16px_rgba(56,189,248,0.08)]',
        },
        {
            id: 'duel',
            title: 'Duel',
            desc: 'Fast-paced, head-to-head typing battle.',
            icon: <img src={duelIcon} alt="Arena Icon" className="w-20 h-20 md:w-24 md:h-24 object-contain relative z-10" />,
            glowColor: 'group-hover:shadow-[0_0_16px_rgba(244,114,182,0.1)]',
        },
        {
            id: 'custom',
            title: 'Custom',
            desc: 'Create or join a private room with friends.',
            icon: <img src={customIcon} alt="Arena Icon" className="w-20 h-20 md:w-24 md:h-24 object-contain relative z-10" />,
            glowColor: 'group-hover:shadow-[0_0_16px_rgba(129,140,248,0.1)]',
        },
    ];

    return (
        <main className="flex flex-col items-center justify-center mt-16 space-y-10 animate-fade-in w-full max-w-4xl mx-auto px-6">
            <div className="text-center">
                <h2 className="text-4xl font-extrabold text-white mb-3 tracking-wide">Choose Your Game Mode</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                {gameModes.map((mode) => (
                    <button
                        key={mode.id}
                        type="button"
                        onClick={() => mode.id === 'custom' ? handleCustomRoom() : handlePlay(mode.id)}
                        className={`group relative flex flex-col items-start rounded-2xl text-left overflow-hidden transition-all duration-300 p-6 bg-slate-800/40 border border-slate-700/80 hover:border-[#38bdf8]/30 hover:-translate-y-1 ${mode.glowColor}`}
                    >
                        <div className="flex w-full gap-5 md:gap-6 items-start">
                            <span className="text-4xl md:text-5xl flex-shrink-0 mt-1" aria-hidden>
                                {mode.icon}
                            </span>
                            <div className="flex-grow flex flex-col items-start w-full">
                                <div className="flex items-start justify-between w-full mb-1 gap-2">
                                    <h3 className="font-bold text-gray-200 group-hover:text-white transition-colors text-left text-2xl">
                                        {mode.title}
                                    </h3>
                                </div>
                                <p className="text-gray-400 text-left text-sm">
                                    {mode.desc}
                                </p>
                            </div>
                        </div>
                    </button>
                ))}
            </div>
        </main>
    );
};

export default Home;
