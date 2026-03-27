import { useState, useEffect, useRef } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Music, Play, Pause, Trash2, Search, Heart } from 'lucide-react';
import { useAmbience } from '../context/AmbienceContext';
import { cn } from '../lib/utils';
import { searchJamendoTracks, type JamendoTrack } from '../services/jamendoApi';
import { type SavedTrack } from '../components/dashboard/JamendoPlayer';

export default function MusicLibrary() {
    const { theme } = useAmbience();
    const [savedTracks, setSavedTracks] = useState<SavedTrack[]>([]);
    const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Search state
    const [view, setView] = useState<'library' | 'search'>('library');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortOption, setSortOption] = useState('relevance');
    const [searchResults, setSearchResults] = useState<JamendoTrack[]>([]);
    const [isSearching, setIsSearching] = useState(false);

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

        window.addEventListener('storage', loadTracks);
        return () => window.removeEventListener('storage', loadTracks);
    }, []);

    const removeTrack = (trackId: string | undefined, timestamp: number) => {
        const updated = savedTracks.filter(t => !(t.id === trackId && t.addedAt === timestamp));
        setSavedTracks(updated);
        localStorage.setItem('vista_saved_tracks', JSON.stringify(updated));
        if (playingTrackId === trackId) {
            if (audioRef.current) audioRef.current.pause();
            setPlayingTrackId(null);
        }
        window.dispatchEvent(new Event('storage'));
    };

    const addTrack = (track: JamendoTrack) => {
        const newTrack: SavedTrack = {
            id: track.id,
            title: track.name,
            artist: track.artist_name,
            addedAt: Date.now(),
            audioUrl: track.audio,
            imageUrl: track.image
        };
        const updated = [...savedTracks, newTrack];
        setSavedTracks(updated);
        localStorage.setItem('vista_saved_tracks', JSON.stringify(updated));
        window.dispatchEvent(new Event('storage'));
    };

    const isTrackSaved = (id: string, name: string) => {
        return savedTracks.some(t => t.id === id || t.title === name);
    };

    const togglePlay = (track: SavedTrack) => {
        if (!track.audioUrl) {
            alert("This track does not have audio available to play.");
            return;
        }

        if (playingTrackId === track.id) {
            if (audioRef.current) {
                audioRef.current.pause();
                setPlayingTrackId(null);
            }
        } else {
            setPlayingTrackId(track.id);
        }
    };

    useEffect(() => {
        if (playingTrackId && audioRef.current) {
            // Find track in library OR search results
            let trackObj: { audioUrl?: string, audio?: string } | undefined = savedTracks.find(t => t.id === playingTrackId);
            if (!trackObj) {
                trackObj = searchResults.find(t => t.id === playingTrackId);
            }

            const audioSrc = trackObj?.audioUrl || trackObj?.audio;

            if (audioSrc && audioRef.current.src !== audioSrc) {
                audioRef.current.src = audioSrc;
                audioRef.current.play().catch(e => {
                    console.error("Failed to play track:", e);
                    setPlayingTrackId(null);
                });
            } else if (audioSrc && audioRef.current.paused) {
                audioRef.current.play().catch(e => {
                    console.error("Failed to play track:", e);
                    setPlayingTrackId(null);
                });
            }
        }
    }, [playingTrackId, savedTracks, searchResults]);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;
        setIsSearching(true);
        const results = await searchJamendoTracks(searchQuery, sortOption);
        setSearchResults(results);
        setIsSearching(false);
    };

    // Re-run search if sort option changes while we already have a query
    useEffect(() => {
        if (searchQuery.trim() && searchResults.length > 0) {
            handleSearch(new Event('submit') as unknown as React.FormEvent);
        }
    }, [sortOption]);

    return (
        <div className="p-8 h-full overflow-y-auto">
            <audio ref={audioRef} onEnded={() => setPlayingTrackId(null)} onPause={() => setPlayingTrackId(null)} />
            <header className="mb-8 flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-text mb-2">Music Library</h1>
                    <p className="text-muted">Songs to accompany your mental well-being journey.</p>
                </div>
                <div className="flex bg-white/50 p-1 rounded-xl shadow-sm border">
                    <button
                        onClick={() => setView('library')}
                        className={cn("px-4 py-1.5 text-sm font-semibold rounded-lg transition-all", view === 'library' ? "bg-white text-primary shadow-sm" : "text-muted hover:text-text")}
                    >
                        Saved Tracks
                    </button>
                    <button
                        onClick={() => setView('search')}
                        className={cn("px-4 py-1.5 text-sm font-semibold rounded-lg transition-all", view === 'search' ? "bg-white text-primary shadow-sm" : "text-muted hover:text-text")}
                    >
                        Search
                    </button>
                </div>
            </header>

            {view === 'library' && (
                <>
                    {savedTracks.length === 0 ? (
                        <Card className={cn("p-12 text-center text-muted flex flex-col items-center justify-center min-h-[400px]", themeClass)}>
                            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                                <Music size={40} className="text-primary opacity-50" />
                            </div>
                            <h3 className="text-xl font-bold text-text mb-2">Your collection is empty</h3>
                            <p className="max-w-md mx-auto mb-8">
                                Switch to the Search tab or click the heart icon on the music player when you hear a song you like to save it here.
                            </p>
                            <Button onClick={() => setView('search')}>
                                Browse Music
                            </Button>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {savedTracks.map((track) => {
                                const isPlaying = playingTrackId === track.id;
                                return (
                                    <Card key={track.addedAt} className={cn("p-4 group hover:shadow-lg transition-all duration-300", themeClass)}>
                                        <div className="flex items-center gap-4">
                                            {track.imageUrl ? (
                                                <img
                                                    src={track.imageUrl}
                                                    alt={track.title}
                                                    className={cn("w-16 h-16 rounded-xl shadow-inner shrink-0 group-hover:scale-105 transition-transform", isPlaying && "animate-pulse")}
                                                />
                                            ) : (
                                                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center shadow-inner shrink-0 group-hover:scale-105 transition-transform">
                                                    <Music size={24} className={cn("text-gray-400 group-hover:text-primary transition-colors", isPlaying && "text-primary")} />
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <h4 className={cn("font-bold truncate", isPlaying ? "text-primary" : "text-text")}>{track.title}</h4>
                                                <p className="text-sm text-muted truncate">{track.artist}</p>
                                                <p className="text-xs text-muted/60 mt-1">
                                                    Added {new Date(track.addedAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div className={cn("flex flex-col gap-2 transition-opacity", !isPlaying && "opacity-0 group-hover:opacity-100")}>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="h-8 w-8 text-primary hover:bg-primary/10 rounded-full p-0"
                                                    title={isPlaying ? "Pause" : "Play"}
                                                    onClick={() => togglePlay({ ...track, audioUrl: track.audioUrl })}
                                                >
                                                    {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="h-8 w-8 text-red-400 hover:bg-red-50 hover:text-red-500 rounded-full p-0"
                                                    onClick={() => removeTrack(track.id, track.addedAt)}
                                                    title="Remove"
                                                >
                                                    <Trash2 size={16} />
                                                </Button>
                                            </div>
                                        </div>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </>
            )}

            {view === 'search' && (
                <div className="flex flex-col">
                    <Card className={cn("p-4 mb-6", themeClass)}>
                        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search for tracks, artists, or moods..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 rounded-xl border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all shadow-sm"
                                />
                            </div>
                            <div className="flex gap-4">
                                <select
                                    value={sortOption}
                                    onChange={(e) => setSortOption(e.target.value)}
                                    className="px-4 py-2 rounded-xl border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none shadow-sm text-sm"
                                >
                                    <option value="relevance">Top Results (Relevance)</option>
                                    <option value="name">Sort by Track Name (A-Z)</option>
                                    <option value="artist">Sort by Artist Name (A-Z)</option>
                                </select>
                                <Button type="submit" disabled={isSearching} className="gap-2">
                                    {isSearching ? "Searching..." : "Search"}
                                </Button>
                            </div>
                        </form>
                    </Card>

                    {isSearching ? (
                        <div className="flex items-center justify-center p-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {searchResults.map((track) => {
                                const isPlaying = playingTrackId === track.id;
                                const isSaved = isTrackSaved(track.id, track.name);

                                return (
                                    <Card key={track.id} className={cn("p-4 group hover:shadow-lg transition-all duration-300", themeClass)}>
                                        <div className="flex items-center gap-4">
                                            {track.image ? (
                                                <img
                                                    src={track.image}
                                                    alt={track.name}
                                                    className={cn("w-16 h-16 rounded-xl shadow-inner shrink-0 group-hover:scale-105 transition-transform", isPlaying && "animate-pulse")}
                                                />
                                            ) : (
                                                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center shadow-inner shrink-0 group-hover:scale-105 transition-transform">
                                                    <Music size={24} className={cn("text-gray-400 group-hover:text-primary transition-colors", isPlaying && "text-primary")} />
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <h4 className={cn("font-bold truncate", isPlaying ? "text-primary" : "text-text")}>{track.name}</h4>
                                                <p className="text-sm text-muted truncate">{track.artist_name}</p>
                                            </div>
                                            <div className="flex flex-col gap-2 transition-opacity">
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="h-8 w-8 text-primary hover:bg-primary/10 rounded-full p-0"
                                                    title={isPlaying ? "Pause" : "Play"}
                                                    onClick={() => togglePlay({ id: track.id, title: track.name, artist: track.artist_name, audioUrl: track.audio, addedAt: 0 })}
                                                >
                                                    {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className={cn("h-8 w-8 rounded-full p-0", isSaved ? "text-red-500 hover:bg-red-50" : "text-gray-400 hover:text-gray-600 hover:bg-gray-100")}
                                                    onClick={() => isSaved ? removeTrack(savedTracks.find(t => t.id === track.id)?.id, savedTracks.find(t => t.id === track.id)?.addedAt || 0) : addTrack(track)}
                                                    title={isSaved ? "Remove" : "Save"}
                                                >
                                                    <Heart size={16} fill={isSaved ? "currentColor" : "none"} />
                                                </Button>
                                            </div>
                                        </div>
                                    </Card>
                                );
                            })}
                            {!isSearching && searchResults.length === 0 && searchQuery && (
                                <div className="col-span-full text-center text-muted p-12">
                                    No tracks found. Try a different search term.
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
