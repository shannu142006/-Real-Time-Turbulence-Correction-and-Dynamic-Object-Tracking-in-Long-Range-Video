import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Recover from './pages/Recover';
import Dashboard from './pages/Dashboard';
import VideoAnalysis from './pages/VideoAnalysis';
import LiveTracking from './pages/LiveTracking';
import Analytics from './pages/Analytics';
import History from './pages/History';
import Security from './pages/Security';

const LoadingScreen = () => (
  <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#020204' }}>
    <div style={{ textAlign: 'center' }}>
      <div style={{
        width: 48, height: 48,
        border: '2px solid rgba(0,242,255,0.15)',
        borderTop: '2px solid #00f2ff',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
        margin: '0 auto 16px',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ fontFamily: '"JetBrains Mono",monospace', fontSize: 10, color: 'rgba(0,242,255,0.6)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
        Initializing...
      </div>
    </div>
  </div>
);

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login"  element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/recover" element={<Recover />} />
        <Route path="/demo" element={<Dashboard />} />
        <Route path="/" element={<Dashboard />} />
        <Route path="/video" element={<ProtectedRoute><VideoAnalysis /></ProtectedRoute>} />
        <Route path="/tracking" element={<ProtectedRoute><LiveTracking /></ProtectedRoute>} />
        <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
        <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
        <Route path="/security" element={<ProtectedRoute><Security /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
