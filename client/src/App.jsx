import React, { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext, AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import AIOrb from './components/AIOrb';
import ParticleBackground from './components/ParticleBackground';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import GrowthDashboard from './pages/GrowthDashboard';
import AdminPanel from './pages/AdminPanel';
import Analyzer from './pages/Analyzer';
import GroupDiscussion from './pages/GroupDiscussion';
import PublicSpeaking from './pages/PublicSpeaking';
import Presentation from './pages/Presentation';
import EmailAssistant from './pages/EmailAssistant';
import MockInterview from './pages/MockInterview';
import DebateArena from './pages/DebateArena';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center font-mono text-xs text-gray-500">
        Syncing authentication status...
      </div>
    );
  }
  return user ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center font-mono text-xs text-gray-500">
        Syncing authorization checks...
      </div>
    );
  }
  return user && user.role === 'admin' ? children : <Navigate to="/dashboard" />;
};

function AppContent() {
  const { user } = useContext(AuthContext);
  return (
    <div className="relative min-h-screen z-10">
      <ParticleBackground />
      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
        <Route path="/signup" element={!user ? <Signup /> : <Navigate to="/dashboard" />} />
        
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
        <Route path="/growth" element={<PrivateRoute><GrowthDashboard /></PrivateRoute>} />
        <Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />
        
        <Route path="/modules/analyzer" element={<PrivateRoute><Analyzer /></PrivateRoute>} />
        <Route path="/modules/gd" element={<PrivateRoute><GroupDiscussion /></PrivateRoute>} />
        <Route path="/modules/public-speaking" element={<PrivateRoute><PublicSpeaking /></PrivateRoute>} />
        <Route path="/modules/presentation" element={<PrivateRoute><Presentation /></PrivateRoute>} />
        <Route path="/modules/email" element={<PrivateRoute><EmailAssistant /></PrivateRoute>} />
        <Route path="/modules/interview" element={<PrivateRoute><MockInterview /></PrivateRoute>} />
        <Route path="/modules/debate" element={<PrivateRoute><DebateArena /></PrivateRoute>} />
        
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <AIOrb />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
