import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Chat from './pages/Chat';
import History from './pages/History';
import Profile from './pages/Profile';
import Journal from './pages/Journal';
import Quests from './pages/Quests';
import Landing from './pages/Landing';
import RegisterWizard from './pages/RegisterWizard';
import SpotifyCallback from './pages/SpotifyCallback';
import Games from './pages/Games';
import SupportNetwork from './pages/SupportNetwork';
import MusicLibrary from './pages/MusicLibrary';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useEffect } from 'react';

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/auth" element={!isAuthenticated ? <Auth /> : <Navigate to="/dashboard" />} />
      <Route path="/register" element={!isAuthenticated ? <RegisterWizard /> : <Navigate to="/dashboard" />} />
      <Route path="/spotify_callback" element={<SpotifyCallback />} />

      {isAuthenticated ? (
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/journal" element={<Journal />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/quests" element={<Quests />} />
          <Route path="/games" element={<Games />} />
          <Route path="/games" element={<Games />} />
          <Route path="/support" element={<SupportNetwork />} />
          <Route path="/library" element={<MusicLibrary />} />
          <Route path="/history" element={<History />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      ) : (
        <Route path="*" element={<Navigate to="/auth" replace />} />
      )}
    </Routes>
  );
}

function App() {
  // Global Mouse Tracking for Spotlight Effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      document.body.style.setProperty('--mouse-x', `${e.clientX}px`);
      document.body.style.setProperty('--mouse-y', `${e.clientY}px`);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <BrowserRouter>
      {/* Global Spotlight Overlay Removed as per user request to remove 'white sheet' if it was causing issues. 
          Actually the user said "remove white sheet that covers the image". 
          If there was a global bg-white somewhere, I should check Landing.tsx or Layout.tsx used in dashboard.
          The Landing page has its own background. 
          The Dashboard uses Layout.tsx. 
          The App.tsx has a pointer-events-none overlay. It's transparent mostly? 
          "rgba(52, 168, 83, 0.06)" is very faint green. 
          Let's comment it out to be safe.
      */}
      {/* <div className="pointer-events-none fixed inset-0 z-50 transition-opacity duration-300"
        style={{
          background: `radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), rgba(52, 168, 83, 0.06), transparent 40%)`
        }}
      /> */}
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
