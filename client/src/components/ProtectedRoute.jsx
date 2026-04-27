import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const ProtectedRoute = ({ children }) => {
    
    const [isValid, setIsValid] = useState(null);

    useEffect(() => {

        const verifyToken = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                return setIsValid(false);
            }
            try{
                
                const decodedtoken = jwtDecode(token);
                const currentTime = Date.now() / 1000;
                if (decodedtoken.exp < currentTime) {
                    localStorage.removeItem("token");
                    return setIsValid(false);
                }

                await api.get('/users/profile');

                setIsValid(true);

            } catch(err){
                localStorage.removeItem('token'); 
                setIsValid(false);
            }
        }
        verifyToken();

    },[]);

    if (isValid === null) return <div>Verifying security clearance... 🛡️</div>;
    if (isValid === false) return <Navigate to="/login" replace />;
    return children;
};

export default ProtectedRoute;