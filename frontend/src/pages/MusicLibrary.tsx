import { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Music, Play, Trash2 } from 'lucide-react';
import { useAmbience } from '../context/AmbienceContext';
import { cn } from '../lib/utils';

interface SavedTrack {
    title: string;
    artist: string;
    addedAt: number;
}

export default function MusicLibrary() {
    const { theme } = useAmbience();
    const [savedTracks, setSavedTracks] = useState<SavedTrack[]>([]);

    const themeClass = theme === 'green' ? 'bg-emerald-50/60 border-4 border-emerald-200 backdrop-blur-md' :
        theme === 'lavender' ? 'bg-purple-50/60 border-4 border-purple-200 backdrop-blur-md' :
            'bg-rose-50/60 border-4 border-rose-200 backdrop-blur-md';

    useEffect(() => {
        const loadTracks = () => {
            try {
                const stored = localStorage.getItem('vista_saved_tracks');
                if (stored) {
                    setSavedTracks(JSON.parse(stored));
                }
            } catch (e) {
                console.error("Failed to load tracks", e);
            }
        };
        loadTracks();

        // Listen for storage events in case other tabs/components update it
        window.addEventListener('storage', loadTracks);
        return () => window.removeEventListener('storage', loadTracks);
    }, []);

    const removeTrack = (timestamp: number) => {
        const updated = savedTracks.filter(t => t.addedAt !== timestamp);
        setSavedTracks(updated);
        localStorage.setItem('vista_saved_tracks', JSON.stringify(updated));
    };

    return (
        <div className="p-8 h-full overflow-y-auto">
            <header className="mb-8">
                <h1 className="text-3xl font-serif font-bold text-text mb-2">Your Music Library</h1>
                <p className="text-muted">Songs you've saved for your mental well-being moments.</p>
            </header>

            {savedTracks.length === 0 ? (
                <Card className={cn("p-12 text-center text-muted flex flex-col items-center justify-center min-h-[400px]", themeClass)}>
                    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                        <Music size={40} className="text-primary opacity-50" />
                    </div>
                    <h3 className="text-xl font-bold text-text mb-2">Your collection is empty</h3>
                    <p className="max-w-md mx-auto mb-8">
                        Click the heart icon on the music player when you hear a song you like to save it here.
                    </p>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {savedTracks.map((track) => (
                        <Card key={track.addedAt} className={cn("p-4 group hover:shadow-lg transition-all duration-300", themeClass)}>
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center shadow-inner shrink-0 group-hover:scale-105 transition-transform">
                                    <Music size={24} className="text-gray-400 group-hover:text-primary transition-colors" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-text truncate">{track.title}</h4>
                                    <p className="text-sm text-muted truncate">{track.artist}</p>
                                    <p className="text-xs text-muted/60 mt-1">
                                        Added {new Date(track.addedAt).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button size="sm" variant="ghost" className="h-8 w-8 text-primary hover:bg-primary/10 rounded-full p-0" title="Play">
                                        <Play size={16} />
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-8 w-8 text-red-400 hover:bg-red-50 hover:text-red-500 rounded-full p-0"
                                        onClick={() => removeTrack(track.addedAt)}
                                        title="Remove"
                                    >
                                        <Trash2 size={16} />
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
