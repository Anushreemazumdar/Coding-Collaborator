import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { CollaborationRoom } from './pages/CollaborationRoom';
import './App.css';

function MainApp() {
  const { user } = useAuth();
  const [authView, setAuthView] = useState('login'); // 'login' | 'register'
  
  // Track active session (also read from URL search param if present)
  const [activeSessionId, setActiveSessionId] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('session') || null;
  });

  // Sync session state to URL query parameter for easy sharing/multi-browser testing
  const handleEnterSession = (sessionId) => {
    setActiveSessionId(sessionId);
    const url = new URL(window.location);
    url.searchParams.set('session', sessionId);
    window.history.pushState({}, '', url);
  };

  const handleLeaveSession = () => {
    setActiveSessionId(null);
    const url = new URL(window.location);
    url.searchParams.delete('session');
    window.history.pushState({}, '', url);
  };

  // If user is not logged in, render authentication screens
  if (!user) {
    if (authView === 'register') {
      return <Register onNavigateLogin={() => setAuthView('login')} />;
    }
    return <Login onNavigateRegister={() => setAuthView('register')} />;
  }

  // If user has chosen a session, render the real-time Collaboration Room
  if (activeSessionId) {
    return (
      <CollaborationRoom
        sessionId={activeSessionId}
        onNavigateDashboard={handleLeaveSession}
      />
    );
  }

  // Default: Dashboard
  return <Dashboard onEnterSession={handleEnterSession} />;
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
