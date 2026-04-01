import {useState} from 'react';
import api from '../utils/api';

const Login = ()=>{
    
    const [inputName, setInputName] = useState("");
    const [inputPass, setInputPass] = useState("");
    const [error, setError] = useState("");

    const handleLogin = async(e)=>{
        e.preventDefault();
        try{
            const response = await api.post("/auth/login",{
                username: inputName,
                password: inputPass
            })

            const { token } = response.data;
            localStorage.setItem('token', token);
            console.log("Login successful, token is stored");

        } catch(err){
            if(error.response && error.response.data){
                setError(error.response.data.message);
            } else{
                setError("An error occurred while logging in.");
            }
        }
    }
    
    return(
        <div style={{ padding: "50px", textAlign: "center" }}>
            <h2>Login to GlideKeys</h2>

            {error && <p style={{ color: "red" }}>{error}</p>}

            <form onSubmit={handleLogin}>
                <div>
                    <input 
                        type="text"
                        placeholder="Username" 
                        value={inputName} 
                        onChange={(e) => setInputName(e.target.value)} 
                        required 
                    />
                </div>
                <br />
                <div>
                    <input 
                        type="password" 
                        placeholder="Password" 
                        value={inputPass} 
                        onChange={(e) => setInputPass(e.target.value)} 
                        required 
                    />
                </div>
                <br />
                <button type="submit">Login</button>
            </form>
        </div>
    );
};

export default Login;
