const Header = ({ gameState }) => {
    return (
        <div className="w-full max-w-5xl mx-auto flex justify-between items-center mb-12">
            <div className="flex items-center gap-3 cursor-default group">
                <div className="bg-gradient-to-br from-[#38bdf8] to-[#6366f1] p-1.5 rounded-xl shadow-[0_0_20px_rgba(56,189,248,0.4)] group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 ease-out">
                    <img src="/GlideKeyslogo.png" alt="Logo" width="60" height="50" className="rounded-xl" />
                </div>

                <div className="flex flex-col">
                    <h1 className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#38bdf8] via-[#818cf8] to-[#f472b6] drop-shadow-lg">
                        Glide Keys
                    </h1>
                    <span className="text-xs font-mono text-gray-500 tracking-widest uppercase mt-0.5">
                        Multiplayer Typing Arena
                    </span>
                </div>

            </div>

            <div className="hidden sm:flex items-center gap-2 bg-[#111620] border border-gray-700/50 px-4 py-2 rounded-full shadow-md">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-sm font-semibold text-gray-300 font-mono">
                    {gameState === "playing" ? "Race in Progress" : "Server Online"}
                </span>
            </div>

        </div>
    );
}

export default Header;