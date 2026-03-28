import Confetti from 'react-confetti';

const Results = ({myWPM, opponentWPM, handleExit, handlePlayAgain, opponentLeft})=>{
    
    return(
        <div className="max-w-2xl mx-auto mt-20 flex flex-col gap-8 animate-fade-in">

            {(myWPM > opponentWPM && opponentWPM > 0) || (opponentLeft) ? (
                <Confetti 
                width={window.innerWidth} 
                height={window.innerHeight} 
                recycle={false} 
                numberOfPieces={500}
                gravity={0.135}
                />
            ): null}
            
            <div className="text-center">
                <h2 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500 mb-3 drop-shadow-lg">
                    Race Complete!
                </h2>
                {(opponentWPM > 0)?(<p className="text-gray-400 text-lg">Here are the final standings.</p>):("")}
            </div>

            <div className="flex gap-6 justify-center">
                <div className="bg-[#0b1728] border border-blue-500/30 rounded-2xl p-8 text-center w-64 shadow-[0_0_20px_rgba(59,130,246,0.15)] relative overflow-hidden">
                    {((myWPM > opponentWPM && opponentWPM > 0) || opponentLeft)  && <div className="absolute top-0 left-0 w-full bg-yellow-500/20 text-yellow-500 text-xs font-bold py-1.5 uppercase tracking-widest">Winner</div>}
                    <div className="text-gray-500 uppercase tracking-wider text-sm font-bold mb-4 mt-2">Your Speed</div>
                    <div className="text-7xl font-black text-blue-400 mb-2">{myWPM}</div>
                    <div className="text-gray-400 font-mono text-sm">WPM</div>
                </div>
                <div className="bg-[#1e0a1f] border border-pink-500/30 rounded-2xl p-8 text-center w-64 shadow-[0_0_20px_rgba(236,72,153,0.15)] relative overflow-hidden">
                    {opponentWPM > myWPM && <div className="absolute top-0 left-0 w-full bg-yellow-500/20 text-yellow-500 text-xs font-bold py-1.5 uppercase tracking-widest">Winner</div>}
                    <div className="text-gray-500 uppercase tracking-wider text-sm font-bold mb-4 mt-2">Opponent</div>
                    {opponentLeft ? (<div className="text-xl font-bold text-red-400 mt-8">Left</div>) : (
                        <>
                            <div className="text-7xl font-black text-pink-400 mb-2">{opponentWPM > 0 ? opponentWPM : "..."}</div>
                            <div className="text-gray-400 font-mono text-sm">{opponentWPM > 0 ? "WPM" : "Typing..."}</div>
                        </>
                    )}
                </div>

            </div>

            <div className="flex justify-center gap-4 mt-6 w-full max-w-sm mx-auto">
                <button onClick={handleExit} className="flex-1 py-4 bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold rounded-xl transition-colors">
                    Main Menu
                </button>
                <button onClick={handlePlayAgain} className="flex-1 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg transition-transform hover:scale-105">
                    Play Again
                </button>
            </div>

        </div>
    );
}

export default Results;