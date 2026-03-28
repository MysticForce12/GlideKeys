const Home = ({handlePlay})=>{
    return(
        <div className="flex flex-col items-center justify-center mt-32 space-y-8 animate-fade-in">
            <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-200 mb-3">Ready to Race?</h2>
                <p className="text-gray-400 text-lg">Compete against others in real-time typing battles.</p>
            </div>
            <button onClick={handlePlay} className="px-12 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xl font-bold rounded-full shadow-[0_0_20px_rgba(79,70,229,0.4)] hover:shadow-[0_0_30px_rgba(79,70,229,0.6)] hover:scale-105 transition-all duration-200">
                Find Match
            </button>
        </div>
    );
}

export default Home;