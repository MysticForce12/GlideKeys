import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const Profile = () => {
    
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {

        const fetchProfile = async()=>{
            try{
                const response = await api.get('/users/profile');
                setUserData(response.data);
            } catch(err){
                console.error("Error fetching profile:", err);
                setError("Failed to load profile. Please try again.");
            } finally{
                setLoading(false);
            }
        }

        fetchProfile();

        if(loading) return <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading your stats...</div>;
        if(error) return <div style={{ color: 'red', textAlign: 'center' }}>Error: {error}</div>;

    },[]);

    return(
        <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
            <h2>Player Profile</h2>
            
            {userData && (
                <div>
                    <p><strong>Username:</strong> {userData.username}</p>
                    <p><strong>Average WPM:</strong> {userData.avgWPM}</p>
                    <p><strong>Total Wins:</strong> {userData.wins}</p>
                </div>
            )}

            <button 
                onClick={() => navigate('/play')}
                style={{ marginTop: '20px', padding: '10px 20px', cursor: 'pointer' }}
            >
                Back to Game
            </button>
        </div>
    );
}

export default Profile;