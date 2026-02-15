import { LayoutDashboard, MessageSquare, History, User, LogOut, Gamepad2, ChevronLeft, ChevronRight, HeartHandshake } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import clsx from 'clsx';
import { useEffect, useState } from 'react';
import { useAmbience } from '../../context/AmbienceContext';
import { useAuth } from '../../context/AuthContext';
import { fetchUserProfile } from '../../services/api';

const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: MessageSquare, label: 'Chat', path: '/chat' },
    { icon: History, label: 'History', path: '/history' },
    { icon: Gamepad2, label: 'Quests', path: '/quests' },
    { icon: HeartHandshake, label: 'Support Network', path: '/support' },
    { icon: User, label: 'Profile', path: '/profile' },
];

interface SidebarProps {
    isCollapsed: boolean;
    toggleCollapse: () => void;
}

export default function Sidebar({ isCollapsed, toggleCollapse }: SidebarProps) {
    const { theme, setTheme } = useAmbience();
    const { logout, user } = useAuth();
    const [displayName, setDisplayName] = useState(user?.name || "User");

    // Fetch latest profile name on mount
    useEffect(() => {
        const loadProfile = async () => {
            try {
                const profile = await fetchUserProfile();
                if (profile && profile.name) {
                    setDisplayName(profile.name);
                }
            } catch (error) {
                console.error("Failed to load profile for sidebar", error);
            }
        };
        loadProfile();
    }, []);

    const shadowClass = theme === 'green'
        ? 'shadow-[0_0_15px_rgba(52,168,83,0.15)] ring-emerald-500/20'
        : theme === 'lavender'
            ? 'shadow-[0_0_15px_rgba(147,51,234,0.15)] ring-purple-500/20'
            : 'shadow-[0_0_15px_rgba(236,72,153,0.15)] ring-pink-500/20';

    const bgClass = theme === 'green'
        ? 'bg-[#f0fdf4]/60' // Green-50
        : theme === 'lavender'
            ? 'bg-[#faf5ff]/60' // Purple-50
            : 'bg-[#fff1f2]/60'; // Rose-50

    return (
        <aside
            className={`backdrop-blur-xl border-r border-white/20 h-[96vh] my-[2vh] ml-4 rounded-3xl flex flex-col p-4 fixed left-0 top-0 z-20 ring-1 cursor-default transition-all duration-500 ${shadowClass} ${bgClass} ${isCollapsed ? 'w-24' : 'w-64'}`}
        >
            <div className="flex justify-end mb-2">
                <button
                    onClick={toggleCollapse}
                    className="p-1.5 rounded-lg hover:bg-black/5 text-muted transition-colors"
                >
                    {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                </button>
            </div>

            <div className={`mb-8 flex items-center gap-3 px-2 ${isCollapsed ? 'justify-center' : ''}`}>
                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-sm shrink-0">
                    <span className="text-white font-bold text-lg">V</span>
                </div>
                {!isCollapsed && <span className="text-2xl font-serif font-bold text-text tracking-tight animate-in fade-in duration-300">Vista</span>}
            </div>

            <nav className="flex flex-col gap-2">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            clsx(
                                'flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-200 group',
                                isActive
                                    ? 'bg-primary text-white shadow-lg shadow-primary/25 font-medium'
                                    : 'text-muted hover:bg-white hover:text-text hover:shadow-sm',
                                isCollapsed ? 'justify-center px-0' : ''
                            )
                        }
                        title={isCollapsed ? item.label : undefined}
                    >
                        <item.icon size={22} strokeWidth={2} className="shrink-0" />
                        {!isCollapsed && <span className="text-sm tracking-wide animate-in fade-in duration-300 whitespace-nowrap">{item.label}</span>}
                    </NavLink>
                ))}
            </nav>

            <div className={`mt-auto px-4 py-4 rounded-2xl bg-white/50 border border-white/40 shadow-sm backdrop-blur-sm flex flex-col gap-4 ${isCollapsed ? 'items-center px-2' : ''}`}>
                {/* Theme Colors */}
                {!isCollapsed && (
                    <div className="w-full flex flex-col gap-2 px-3 py-2 rounded-xl bg-white/50 backdrop-blur-sm animate-in fade-in duration-300">
                        <span className="text-xs font-medium text-muted">Theme</span>
                        <div className="flex items-center justify-between gap-1">
                            <button onClick={() => setTheme('green')} className={`w-8 h-8 rounded-full bg-green-100 border-2 transition-all ${theme === 'green' ? 'border-primary ring-2 ring-primary/20 scale-110' : 'border-transparent hover:scale-105'}`} />
                            <button onClick={() => setTheme('lavender')} className={`w-8 h-8 rounded-full bg-purple-100 border-2 transition-all ${theme === 'lavender' ? 'border-primary ring-2 ring-primary/20 scale-110' : 'border-transparent hover:scale-105'}`} />
                            <button onClick={() => setTheme('pink')} className={`w-8 h-8 rounded-full bg-pink-100 border-2 transition-all ${theme === 'pink' ? 'border-primary ring-2 ring-primary/20 scale-110' : 'border-transparent hover:scale-105'}`} />
                        </div>
                    </div>
                )}

                {/* User Profile */}
                <button
                    onClick={logout}
                    className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between gap-3'} hover:bg-white/50 p-2 rounded-xl transition-colors group text-left w-full`}
                    title="Sign Out"
                >
                    <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
                        <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-serif font-bold group-hover:bg-orange-200 transition-colors shrink-0">
                            {(() => {
                                const parts = displayName.split(' ');
                                if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
                                return displayName.slice(0, 2).toUpperCase();
                            })()}
                        </div>
                        {!isCollapsed && (
                            <div className="flex flex-col animate-in fade-in duration-300 overflow-hidden">
                                <span className="text-sm font-bold text-text truncate max-w-[100px]">
                                    {displayName}
                                </span>
                                <span className="text-xs text-muted flex items-center gap-1 group-hover:text-red-500 transition-colors">
                                    <LogOut size={10} />
                                    Sign Out
                                </span>
                            </div>
                        )}
                    </div>
                </button>
            </div>
        </aside>
    );
}
