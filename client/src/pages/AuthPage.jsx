import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const AuthPage = ({ initialMode }) => {

    const [isLogin, setIsLogin] = useState(initialMode === 'login'); 
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    
    useEffect(() => {
        const token = localStorage.getItem('token');
        if(token){
            navigate('/play', { replace: true });
            return;
        }
        setIsLogin(initialMode === 'login');
    }, [initialMode, navigate]);


    const toggle = () => {
        setIsLogin(prev => !prev); 
        setError("");
        setName(""); 
        setUsername("");
        setPassword("");
    }

    const handleSubmit = async (e) =>{
        e.preventDefault();
        setError("");
        setLoading(true);

        const endpoint = isLogin ? "/auth/login" : "/auth/register";

        const payload = isLogin ? { username, password } : { name, username, password };

        try{
            const response = await api.post(endpoint, payload);
            const { token } = response.data;
            localStorage.setItem('token', token);
            localStorage.setItem('gk_userId', response.data.user._id);
            localStorage.setItem('gk_username', username.trim().toLowerCase());
            if (!isLogin) localStorage.setItem('gk_name', name.trim().toLowerCase());
            navigate('/play');

        } catch (err) {
            const errorMessage = err.response?.data?.message || "Authentication failed. Check your credentials.";
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0B0D14] flex items-center justify-center p-6 font-sans select-none">
            
            <div className="relative w-full max-w-md bg-[#11151f] border border-gray-800 rounded-2xl p-8 shadow-2xl overflow-hidden">
                
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-blue-500"></div>

                <div className="text-center mb-8 mt-2">
                    <h2 className="text-2xl font-bold text-white tracking-wide">
                        {isLogin ? "Login" : "Signup"}
                    </h2>
                </div>

                {error && (
                    <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center animate-pulse">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    
                    {!isLogin && (
                        <div className="space-y-2 animate-fade-in">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Full Name</label>
                            <input 
                                type="text" 
                                placeholder="Type your name..." 
                                className="w-full bg-[#07090d] border border-gray-800 rounded-lg px-4 py-3 text-white placeholder:text-gray-700 focus:border-blue-500 outline-none transition-colors"
                                value={name} 
                                onChange={(e) => setName(e.target.value)}
                                required={!isLogin} 
                            />
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Username</label>
                        <input 
                            type="text" 
                            placeholder="xyz@gmail.com" 
                            className="w-full bg-[#07090d] border border-gray-800 rounded-lg px-4 py-3 text-white placeholder:text-gray-700 focus:border-blue-500 outline-none transition-colors"
                            value={username} 
                            onChange={(e) => setUsername(e.target.value)}
                            required 
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Password</label>
                        <input 
                            type="password" 
                            placeholder="••••••••" 
                            className="w-full bg-[#07090d] border border-gray-800 rounded-lg px-4 py-3 text-white placeholder:text-gray-700 focus:border-blue-500 outline-none transition-colors"
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)}
                            required 
                        />
                    </div>

                    <button 
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 mt-4 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 text-white rounded-lg font-bold transition-colors active:scale-[0.98]"
                    >
                        {loading ? "Authenticating..." : (isLogin ? "Login" : "Create Account")}
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-gray-800/50 text-center">
                    <span className="text-gray-500 text-sm">
                        {isLogin ? "Need an account? " : "Already have an account? "} 
                    </span>
                    <button 
                        type="button"
                        onClick={toggle} 
                        className="text-white font-bold text-sm hover:text-blue-400 transition-colors"
                    >
                        {isLogin ? "Sign Up" : "Login"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;