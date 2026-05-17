import React from 'react';

const features = [
    {
        icon: '⚡',
        title: 'Real-Time Multiplayer',
        desc: 'Race against live opponents with WebSocket-powered instant synchronization. No lag, no excuses.',
        gradient: 'from-yellow-500 to-orange-500',
        glow: 'shadow-[0_0_25px_rgba(234,179,8,0.2)]',
    },
    {
        icon: '🏎️',
        title: 'Multiple Game Modes',
        desc: 'Solo practice, intense 1v1 duels, chaotic arena races, or private custom rooms with friends.',
        gradient: 'from-indigo-500 to-purple-500',
        glow: 'shadow-[0_0_25px_rgba(99,102,241,0.2)]',
    },
    {
        icon: '📊',
        title: 'Live Stats & Analytics',
        desc: 'Track your WPM, accuracy, wins, and total matches in a personal stats dashboard that updates after every race.',
        gradient: 'from-emerald-500 to-teal-500',
        glow: 'shadow-[0_0_25px_rgba(16,185,129,0.2)]',
    },
    {
        icon: '🎯',
        title: 'Dynamic Quotes',
        desc: 'Every race uses a randomly selected passage — from literature to code snippets — so no two races feel the same.',
        gradient: 'from-pink-500 to-rose-500',
        glow: 'shadow-[0_0_25px_rgba(236,72,153,0.2)]',
    },
    {
        icon: '🛡️',
        title: 'Secure Accounts',
        desc: 'JWT-authenticated user accounts keep your profile, stats, and progress safe and persistent across sessions.',
        gradient: 'from-sky-500 to-blue-600',
        glow: 'shadow-[0_0_25px_rgba(14,165,233,0.2)]',
    },
    {
        icon: '🏆',
        title: 'Competitive Rankings',
        desc: 'Climb the leaderboard and prove you\'re the fastest typist. Every race counts toward your ranking.',
        gradient: 'from-amber-500 to-yellow-500',
        glow: 'shadow-[0_0_25px_rgba(245,158,11,0.2)]',
    },
];

const techStack = [
    { name: 'React', icon: '⚛️' },
    { name: 'Node.js', icon: '🟢' },
    { name: 'Socket.IO', icon: '🔌' },
    { name: 'MongoDB', icon: '🍃' },
    { name: 'Express', icon: '🚀' },
    { name: 'Tailwind CSS', icon: '🎨' },
];

const About = ({ onBack }) => {
    return (
        <div className="flex flex-col items-center w-full max-w-5xl mx-auto px-6 animate-fade-in">

            <div className="text-center mt-10 mb-14 relative">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-72 h-72 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
                <h2 className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#38bdf8] via-[#818cf8] to-[#f472b6] mb-5 relative z-10 leading-tight">
                    About Glide Keys
                </h2>
                <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed relative z-10">
                    A real-time multiplayer typing arena where speed meets precision.
                    Challenge your friends, sharpen your skills, and climb the ranks — one keystroke at a time.
                </p>
            </div>

            <div className="w-full bg-gradient-to-br from-slate-800/60 to-slate-900/60 border border-slate-700/50 rounded-3xl p-8 md:p-10 mb-12 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-5">
                    <span className="text-3xl">🎮</span>
                    <h3 className="text-2xl font-bold text-white">What is Glide Keys?</h3>
                </div>
                <p className="text-gray-300 leading-relaxed text-base md:text-lg">
                    <strong className="text-white">Glide Keys</strong> is a competitive, real-time typing game built for anyone who loves the thrill of racing.
                    Whether you're a casual typist looking to improve or a speed demon hunting for your next personal best,
                    Glide Keys puts you head-to-head against real players in adrenaline-fueled typing races.
                </p>
                <p className="text-gray-400 leading-relaxed text-base md:text-lg mt-4">
                    Jump into a match, type the given passage as fast and accurately as you can, and watch the live progress
                    of your opponents. The first one to finish wins. It's that simple — and that addictive.
                </p>
            </div>


            <div className="w-full mb-14">
                <div className="text-center mb-8">
                    <h3 className="text-3xl font-bold text-white mb-2">What the Game Offers</h3>
                    <p className="text-gray-500 text-sm uppercase tracking-widest font-mono">Features & Highlights</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {features.map((f) => (
                        <div
                            key={f.title}
                            className={`group relative flex flex-col p-6 rounded-2xl bg-slate-800/40 border border-slate-700/50 hover:border-slate-500 hover:-translate-y-1 transition-all duration-300 overflow-hidden ${f.glow} hover:${f.glow.replace('0.2', '0.4')}`}
                        >
                            <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${f.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                            <span className="text-3xl mb-4">{f.icon}</span>
                            <h4 className="text-lg font-bold text-gray-100 mb-2 group-hover:text-white transition-colors">{f.title}</h4>
                            <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="w-full mb-14">
                <div className="text-center mb-8">
                    <h3 className="text-3xl font-bold text-white mb-2">How to Play</h3>
                    <p className="text-gray-500 text-sm uppercase tracking-widest font-mono">Get racing in 4 steps</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {[
                        { step: '01', title: 'Sign Up', desc: 'Create your account and customize your profile.', color: 'text-sky-400', border: 'border-sky-500/30' },
                        { step: '02', title: 'Choose Mode', desc: 'Pick solo practice, 1v1 duel, arena, or custom room.', color: 'text-violet-400', border: 'border-violet-500/30' },
                        { step: '03', title: 'Race!', desc: 'Type the passage as fast and accurately as you can.', color: 'text-amber-400', border: 'border-amber-500/30' },
                        { step: '04', title: 'Climb Ranks', desc: 'Win races, build stats, and dominate the leaderboard.', color: 'text-emerald-400', border: 'border-emerald-500/30' },
                    ].map((s) => (
                        <div key={s.step} className={`flex flex-col p-6 rounded-2xl bg-slate-800/30 border ${s.border} hover:bg-slate-800/50 transition-all duration-300`}>
                            <span className={`text-4xl font-black ${s.color} opacity-30 mb-3 font-mono`}>{s.step}</span>
                            <h4 className="text-lg font-bold text-white mb-2">{s.title}</h4>
                            <p className="text-gray-400 text-sm leading-relaxed">{s.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="w-full mb-14">
                <div className="text-center mb-8">
                    <h3 className="text-3xl font-bold text-white mb-2">Built With</h3>
                    <p className="text-gray-500 text-sm uppercase tracking-widest font-mono">Modern MERN Stack</p>
                </div>
                <div className="flex flex-wrap justify-center gap-4">
                    {techStack.map((t) => (
                        <div key={t.name} className="flex items-center gap-2 bg-slate-800/50 border border-slate-700/50 px-5 py-3 rounded-full hover:border-slate-500 hover:bg-slate-700/50 transition-all duration-300">
                            <span className="text-xl">{t.icon}</span>
                            <span className="text-sm font-semibold text-gray-300">{t.name}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="w-full text-center mb-16 py-10 rounded-3xl bg-gradient-to-br from-slate-800/40 to-slate-900/40 border border-slate-700/30">
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">Ready to Race?</h3>
                <p className="text-gray-400 mb-6 text-base">Jump back to the dashboard and start typing.</p>
                <button
                    onClick={onBack}
                    className="px-8 py-3 rounded-xl bg-gradient-to-r from-[#38bdf8] to-[#6366f1] text-white font-bold text-base hover:scale-105 hover:shadow-[0_0_30px_rgba(56,189,248,0.4)] transition-all duration-300"
                >
                    Start Playing
                </button>
            </div>

        </div>
    );
};

export default About;
