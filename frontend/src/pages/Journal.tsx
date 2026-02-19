import { useState, useEffect } from 'react';
import { fetchJournalEntries, createJournalEntry, updateJournalEntry } from '../services/api';
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
    const [selectedEntry, setSelectedEntry] = useState<any>(null);

    // Load entries on mount
    useEffect(() => {
        const loadEntries = async () => {
            try {
                const data = await fetchJournalEntries();
                setEntries(data);
            } catch (error) {
                console.error("Failed to load journal entries", error);
            }
        };
        loadEntries();
    }, [user]);

    const saveEntry = async () => {
        if (!content.trim()) return;

        if (selectedEntry) {
            const updated = await updateJournalEntry(selectedEntry.id, {
                title,
                content,
                mood: selectedEntry.mood,
                tags: selectedEntry.tags
            });

            if (updated) {
                setEntries(entries.map(e => e.id === updated.id ? updated : e));
                alert("Entry updated successfully!");
            } else {
                alert("Failed to update entry.");
            }
            return;
        }

        const newEntry = {
            title: title || 'Untitled Reflection',
            content,
            mood: 'Neutral', // Could link this to mood selector later
            tags: []
        };

        const savedEntry = await createJournalEntry(newEntry);

        if (savedEntry) {
            setEntries([savedEntry, ...entries]);
            setTitle('');
            setContent('');
            alert("Entry saved successfully!");
        } else {
            alert("Failed to save entry.");
        }
    };

    const handleSelectEntry = (entry: any) => {
        setSelectedEntry(entry);
        setTitle(entry.title);
        setContent(entry.content);
    };

    const handleNewEntry = () => {
        setSelectedEntry(null);
        setTitle('');
        setContent('');
    };

    // Calculate stats
    const calculateStreak = () => {
        if (entries.length === 0) return 0;

        // Sort entries by date descending (should already be sorted but to be safe)
        const sorted = [...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        let streak = 0;
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        // Check if latest entry is today or yesterday
        const latestDate = new Date(sorted[0].date);
        const latestDay = new Date(latestDate.getFullYear(), latestDate.getMonth(), latestDate.getDate());

        const diffTime = Math.abs(today.getTime() - latestDay.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays > 1) return 0; // Streak broken if skipped a day

        streak = 1;
        let currentDate = latestDay;

        for (let i = 1; i < sorted.length; i++) {
            const entryDate = new Date(sorted[i].date);
            const entryDay = new Date(entryDate.getFullYear(), entryDate.getMonth(), entryDate.getDate());

            const gap = Math.abs(currentDate.getTime() - entryDay.getTime());
            const gapDays = Math.ceil(gap / (1000 * 60 * 60 * 24));

            if (gapDays === 1) {
                streak++;
                currentDate = entryDay;
            } else if (gapDays === 0) {
                // Same day, continue
                continue;
            } else {
                break;
            }
        }
        return streak;
    };

    const stats = {
        entries: entries.length,
        streak: calculateStreak()
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

                        <div className="flex flex-col items-center justify-center min-h-[100px] text-center space-y-3">
                            {entries.length === 0 ? (
                                <p className="text-emerald-800/40 italic text-sm">No entries yet. Start writing <span className="inline-block -rotate-12">🌱</span></p>
                            ) : (
                                <div className="w-full space-y-2 max-h-[300px] overflow-y-auto pr-1">
                                    {entries.map(entry => (
                                        <button
                                            key={entry.id}
                                            onClick={() => handleSelectEntry(entry)}
                                            className={cn(
                                                "w-full text-left p-3 rounded-xl transition-all border",
                                                selectedEntry?.id === entry.id
                                                    ? "bg-emerald-100 border-emerald-300 shadow-sm"
                                                    : "bg-white border-emerald-50 hover:bg-emerald-50 hover:translate-x-1"
                                            )}
                                        >
                                            <div className="flex justify-between items-start">
                                                <span className="font-bold text-emerald-900 text-sm truncate w-[70%]">{entry.title || 'Untitled'}</span>
                                                <span className="text-[10px] text-emerald-600 font-mono">{format(new Date(entry.date), 'MMM d')}</span>
                                            </div>
                                            <p className="text-xs text-emerald-800/60 truncate mt-1">{entry.content}</p>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {selectedEntry && (
                                <Button size="sm" variant="ghost" className="w-full mt-2 text-xs" onClick={handleNewEntry}>
                                    + New Entry
                                </Button>
                            )}
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
