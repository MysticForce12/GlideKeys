import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import GameDashboard from './pages/GameDashboard';
import Profile from './pages/Profile';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  
  return (
    <BrowserRouter>
      <Routes>
        
        {/* Temporary route to open GameDashboard for site visit */}
        <Route path="/" element={
          <ProtectedRoute>
            <GameDashboard />
          </ProtectedRoute>
        }/> 

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Login />} />
        <Route path="/play" element={
          <ProtectedRoute>
            <GameDashboard />
          </ProtectedRoute>
        }/>
        
        <Route path='/profile' element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />

      </Routes>
    </BrowserRouter>
  );
}

export default App;