import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import GameDashboard from './pages/GameDashboard';
import Profile from './pages/Profile';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';


function App() {
  
  return (
    <BrowserRouter>
      <Routes>
        
        <Route path="/" element={
          <ProtectedRoute>
            <GameDashboard />
          </ProtectedRoute>
        }/> 

        <Route path="/register" element={
          <PublicRoute> 
            <AuthPage initialMode="register" /> 
          </PublicRoute>
          
        } />  
        
        <Route path="/login" element={
          <PublicRoute>
            <AuthPage initialMode="login" />
          </PublicRoute>
        }/>            
        
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