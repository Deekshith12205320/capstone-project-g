import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Sprout, BookHeart, Cloud, Leaf, Send } from 'lucide-react';
import { useAmbience } from '../context/AmbienceContext';
import { cn } from '../lib/utils';
import { format } from 'date-fns';

export default function Journal() {
    const { theme } = useAmbience();
    const { user } = useAuth();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [entries, setEntries] = useState<any[]>([]);

    // Load entries on mount
    useEffect(() => {
        // Use name for guests to persist across sessions, ID for authenticated users
        const key = user ? (user.isGuest ? `journal_entries_${user.name}` : `journal_entries_${user.id}`) : 'guest_journal_entries';
        const saved = localStorage.getItem(key);
        if (saved) {
            setEntries(JSON.parse(saved));
        }
    }, [user]);

    const saveEntry = () => {
        if (!content.trim()) return;

        const newEntry = {
            id: Date.now().toString(),
            title: title || 'Untitled Reflection',
            content,
            date: new Date().toISOString(),
            mood: 'Neutral' // Could link this to mood selector later
        };

        const updatedEntries = [newEntry, ...entries];
        setEntries(updatedEntries);

        const key = user ? (user.isGuest ? `journal_entries_${user.name}` : `journal_entries_${user.id}`) : 'guest_journal_entries';
        localStorage.setItem(key, JSON.stringify(updatedEntries));

        setTitle('');
        setContent('');
        if (user?.name === 'GitHub User') {
            alert("Entry saved to your GitHub Profile (Simulated)");
        } else {
            alert("Entry saved to your Chrome Profile");
        }
    };

    // Calculate stats
    const stats = {
        entries: entries.length,
        streak: entries.length > 0 ? 1 : 0 // Simplified streak logic
    };

    return (
        <div className={cn(
            "min-h-screen p-8 transition-colors duration-700 relative overflow-hidden",
            theme === 'green' ? 'bg-[#ecfdf5]' : theme === 'lavender' ? 'bg-[#fafaeb]' : 'bg-[#fff1f2]'
        )}>
            {/* Background Decorations */}
            <div className="fixed top-20 left-10 opacity-20 animate-float-slow pointer-events-none">
                <Cloud size={60} className="text-white fill-white" />
            </div>
            <div className="fixed top-40 right-20 opacity-20 animate-float-slower pointer-events-none">
                <Cloud size={80} className="text-white fill-white" />
            </div>
            <div className="fixed bottom-20 left-1/4 opacity-10 animate-float pointer-events-none">
                <Leaf size={40} className={cn("text-primary", theme === 'green' ? 'text-emerald-300' : 'text-purple-300')} />
            </div>

            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">

                {/* Main Writing Area */}
                <div className="lg:col-span-2">
                    <div className="text-center mb-8">
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <Sprout size={32} className="text-primary" />
                        </div>
                        <h1 className="text-4xl font-serif font-bold text-emerald-800 mb-2">Inner Space</h1>
                        <p className="text-emerald-600/80 font-medium">A safe, gentle space to express your thoughts.</p>
                    </div>

                    <div className="bg-white/40 backdrop-blur-sm rounded-[2rem] p-1 shadow-xl border border-white/50 relative">
                        {/* Date Badge */}
                        <div className="absolute -top-4 left-8 bg-emerald-800/10 backdrop-blur-md px-4 py-1.5 rounded-xl border border-emerald-800/10 shadow-sm flex items-center gap-2">
                            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                                {format(new Date(), 'EEE MMM dd yyyy')}
                            </span>
                        </div>

                        {/* Paper Effect Container */}
                        <div className="bg-[#fdfbf7] rounded-[1.8rem] p-8 md:p-12 min-h-[600px] shadow-inner relative overflow-hidden group">

                            {/* Paper Header */}
                            <div className="mb-8">
                                <h2 className="font-serif italic text-2xl text-emerald-800/80 flex items-center gap-2 mb-6">
                                    Dear Self <Leaf size={16} className="text-emerald-600" />
                                </h2>

                                <input
                                    type="text"
                                    placeholder="Letter Title (optional)"
                                    className="w-full bg-transparent border-b-2 border-emerald-100 text-2xl font-serif text-emerald-900 placeholder:text-emerald-800/30 focus:outline-none focus:border-emerald-300 transition-colors py-2"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                />
                            </div>

                            {/* Lined Text Area */}
                            <textarea
                                className="w-full h-[400px] bg-transparent resize-none focus:outline-none text-emerald-900/90 text-lg leading-[3rem] font-medium placeholder:text-emerald-800/20"
                                style={{
                                    backgroundImage: 'linear-gradient(transparent 95%, #e5e7eb 95%)',
                                    backgroundSize: '100% 3rem',
                                    lineHeight: '3rem'
                                }}
                                placeholder="Start writing your thoughts here..."
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                            />

                            {/* Footer / Sign-off */}
                            <div className="mt-8 flex items-end justify-between">
                                <div className="text-emerald-800/60 font-serif italic">
                                    With love and kindness,<br />
                                    ~ {user?.name || "Me"} <span className="inline-block animate-pulse">🌿</span>
                                </div>

                                <Button
                                    onClick={saveEntry}
                                    className="bg-emerald-700 hover:bg-emerald-800 text-white rounded-full px-6 shadow-lg shadow-emerald-700/20 transition-all hover:scale-105"
                                >
                                    Save Entry <Send size={16} className="ml-2" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Side Panel */}
                <div className="space-y-6 lg:pt-32">
                    {/* Stats Card */}
                    <Card className="bg-[#fcfdfa] border-emerald-100/50 p-6 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-2 mb-6">
                            <BookHeart size={20} className="text-emerald-700" />
                            <h3 className="font-bold text-emerald-900">Your Journey</h3>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-center">
                            <div>
                                <div className="text-3xl font-serif font-bold text-emerald-800">{stats.entries}</div>
                                <div className="text-xs font-bold text-emerald-600/60 uppercase tracking-widest mt-1">Entries</div>
                            </div>
                            <div>
                                <div className="text-3xl font-serif font-bold text-emerald-800">{stats.streak}</div>
                                <div className="text-xs font-bold text-emerald-600/60 uppercase tracking-widest mt-1">Day Streak</div>
                            </div>
                        </div>
                    </Card>

                    {/* History Card */}
                    <Card className="bg-[#fcfdfa] border-emerald-100/50 p-6 shadow-sm hover:shadow-md transition-shadow min-h-[200px]">
                        <div className="flex items-center gap-2 mb-4">
                            <HistoryIcon className="text-emerald-700" size={20} />
                            <h3 className="font-bold text-emerald-900">Past Letters</h3>
                        </div>

                        <div className="flex flex-col items-center justify-center h-32 text-center">
                            <p className="text-emerald-800/40 italic text-sm">No entries yet. Start writing <span className="inline-block -rotate-12">🌱</span></p>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}

function HistoryIcon({ className, size }: { className?: string, size?: number }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 12" />
            <path d="M3 3v9h9" />
        </svg>
    )
}
