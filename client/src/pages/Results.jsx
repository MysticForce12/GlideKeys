import Confetti from 'react-confetti';
import { useSocket } from '../context/SocketContext';

const Results = ({ myWPM, finalPlayers, handleExit, handlePlayAgain }) => {
    
    const socket = useSocket();

    const leaderboard = Object.entries(finalPlayers || {}).map(([id, data]) => {
        const finalWPM = id === socket.id && myWPM > 0 ? myWPM : data.wpm;
        
        return {
            id,
            isMe: id === socket.id,
            wpm: finalWPM || 0,
            progress: data.progress || 0,
            isFinished: finalWPM > 0
        };
    }).sort((a, b) => {
        if (b.wpm !== a.wpm) return b.wpm - a.wpm;
        return b.progress - a.progress;
    });

    const iAmWinner = leaderboard.length > 0 && leaderboard[0].isMe && leaderboard[0].isFinished;

    return (
        <div className="max-w-3xl mx-auto mt-10 flex flex-col gap-8 animate-fade-in pb-10">

            {iAmWinner && (
                <Confetti 
                    width={window.innerWidth} 
                    height={window.innerHeight} 
                    recycle={false} 
                    numberOfPieces={500}
                    gravity={0.135}
                />
            )}
            
            <div className="text-center mt-8">
                <h2 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500 mb-3 drop-shadow-lg">
                    Race Complete!
                </h2>
                <p className="text-gray-400 text-lg">Final Standings</p>
            </div>

            {/* leaderboard */}
            <div className="flex flex-col gap-4 bg-[#111620] border border-gray-800 rounded-2xl p-6 shadow-2xl">
                
                {/* headers */}
                <div className="grid grid-cols-12 text-xs font-bold text-gray-500 uppercase tracking-widest px-4 pb-2 border-b border-gray-800">
                    <div className="col-span-2 text-center">Rank</div>
                    <div className="col-span-6">Racer</div>
                    <div className="col-span-4 text-right">Speed / Status</div>
                </div>

                {leaderboard.map((player, index) => {
                    const isWinner = index === 0 && player.isFinished;
                    
                    return (
                        <div 
                            key={player.id} 
                            className={`grid grid-cols-12 items-center p-4 rounded-xl transition-all duration-300 ${player.isMe ? 'bg-blue-600/10 border border-blue-500/30' : 'bg-black/20 border border-transparent'}`}
                        >
                            {/* rank col */}
                            <div className="col-span-2 text-center">
                                {isWinner ? (
                                    <span className="text-2xl" title="Winner">👑</span>
                                ) : (
                                    <span className="text-xl font-black text-gray-600">#{index + 1}</span>
                                )}
                            </div>

                            {/* name col */}
                            <div className="col-span-6 flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${player.isMe ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300'}`}>
                                    {player.isMe ? 'Y' : 'O'}
                                </div>
                                <span className={`font-bold text-lg ${player.isMe ? 'text-blue-400' : 'text-gray-300'}`}>
                                    {player.isMe ? `${player.id.substring(0, 4)} (You)` : `Player_${player.id.substring(0, 4)}`}
                                </span>
                            </div>

                            {/* progress col */}
                            <div className="col-span-4 text-right">
                                {player.isFinished ? (
                                    <div className="flex flex-col">
                                        <span className={`text-2xl font-black ${player.isMe ? 'text-blue-400' : 'text-gray-300'}`}>
                                            {player.wpm}
                                        </span>
                                        <span className="text-gray-500 text-xs font-mono uppercase">WPM</span>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-end">
                                        <span className="text-gray-400 font-mono text-sm">
                                            {Math.round(player.progress)}%
                                        </span>
                                        <span className="text-gray-600 text-xs uppercase animate-pulse">Typing...</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* buttons */}
            <div className="flex justify-center gap-4 mt-2 w-full max-w-md mx-auto">
                <button onClick={handleExit} className="flex-1 py-4 bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold rounded-xl transition-colors">
                    Exit Room
                </button>
                <button onClick={handlePlayAgain} className="flex-1 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-[0_0_15px_rgba(37,99,235,0.4)] transition-transform hover:scale-105">
                    Play Again
                </button>
            </div>

        </div>
    );
}

export default Results;