import { useState } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { AmbienceProvider, useAmbience } from '../../context/AmbienceContext';

import MusicPlayer from '../features/MusicPlayer';

function InnerLayout() {
    const location = useLocation();
    const { gradientStyle } = useAmbience();
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    // Redirect root to dashboard
    if (location.pathname === '/') {
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <div style={gradientStyle} className="flex min-h-screen text-text font-sans transition-colors duration-1000 relative">
            <MusicPlayer />
            <Sidebar isCollapsed={isSidebarCollapsed} toggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />

            <main
                className={`flex-1 p-8 overflow-y-auto h-screen relative transition-all duration-500 ${isSidebarCollapsed ? 'ml-28' : 'ml-64'}`}
            >
                <div className="max-w-6xl mx-auto w-full transition-all duration-500">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}

export default function Layout() {
    return (
        <AmbienceProvider>
            <InnerLayout />
        </AmbienceProvider>
    );
}
