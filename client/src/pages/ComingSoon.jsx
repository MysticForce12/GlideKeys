import React from 'react';

const icons = {
    leaderboard: '🏆',
    history: '📜',
};

const accents = {
    leaderboard: {
        gradient: 'from-amber-400 to-yellow-500',
        glow: 'rgba(245,158,11,0.25)',
        border: 'border-amber-500/30',
        text: 'text-amber-400',
    },
    history: {
        gradient: 'from-teal-400 to-emerald-500',
        glow: 'rgba(20,184,166,0.25)',
        border: 'border-teal-500/30',
        text: 'text-teal-400',
    },
};

const ComingSoon = ({ page, onBack }) => {
    const icon = icons[page] || '🚧';
    const accent = accents[page] || accents.leaderboard;
    const title = page.charAt(0).toUpperCase() + page.slice(1);

    return (
        <div className="flex flex-col items-center justify-center w-full max-w-3xl mx-auto px-6 animate-fade-in mt-16 md:mt-24">

            {/* Glow backdrop */}
            <div
                className="absolute w-80 h-80 rounded-full blur-3xl opacity-20 pointer-events-none"
                style={{ background: `radial-gradient(circle, ${accent.glow}, transparent 70%)` }}
            ></div>

            {/* Icon */}
            <div className={`relative text-7xl mb-8 animate-bounce`} style={{ animationDuration: '2s' }}>
                {icon}
            </div>

            {/* Title */}
            <h2 className={`text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r ${accent.gradient} mb-4 text-center`}>
                {title}
            </h2>

            {/* Coming Soon badge */}
            <div className={`flex items-center gap-2 px-5 py-2 rounded-full border ${accent.border} bg-slate-800/50 mb-6`}>
                <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${accent.gradient} animate-pulse`}></div>
                <span className={`text-sm font-bold uppercase tracking-widest ${accent.text}`}>
                    Coming Soon
                </span>
            </div>

            {/* Description */}
            <p className="text-gray-400 text-center text-lg max-w-md leading-relaxed mb-10">
                {page === 'leaderboard'
                    ? "We're building a global leaderboard so you can see how you stack up against the fastest typists. Stay tuned!"
                    : "Your race history and detailed match stats will be available here soon. Every keystroke will count!"}
            </p>

            {/* Decorative divider */}
            <div className="flex items-center gap-3 mb-10 w-full max-w-xs">
                <div className={`flex-1 h-px bg-gradient-to-r from-transparent ${accent.border.replace('border-', 'to-')}`}></div>
                <span className="text-gray-600 text-xs font-mono">⌨️</span>
                <div className={`flex-1 h-px bg-gradient-to-l from-transparent ${accent.border.replace('border-', 'to-')}`}></div>
            </div>

            {/* Back button */}
            <button
                onClick={onBack}
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-slate-700 to-slate-800 border border-slate-600 text-white font-bold text-base hover:scale-105 hover:border-slate-400 hover:shadow-lg transition-all duration-300"
            >
                ← Back to Dashboard
            </button>
        </div>
    );
};

export default ComingSoon;
