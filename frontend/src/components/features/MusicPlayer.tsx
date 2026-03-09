import { useState, useEffect, useRef } from 'react';
import { Music, Play, Pause, SkipForward, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';
import type { SavedTrack } from '../dashboard/JamendoPlayer';

// Default Jamendo tracks if user has nothing saved
const DEFAULT_TRACKS: SavedTrack[] = [
    {
        id: "1884485",
        title: "Sunset Chaser",
        artist: "Ketsa",
        addedAt: Date.now(),
        audioUrl: "https://prod-1.storage.jamendo.com/?trackid=1884485&format=mp31&from=V3-U7-l2M9N6A5L72f",
    },
    {
        id: "1983056",
        title: "Ambient Calm",
        artist: "Edoy",
        addedAt: Date.now(),
        audioUrl: "https://prod-1.storage.jamendo.com/?trackid=1983056&format=mp31&from=V3-3w-h3J2F8H4K67c",
    },
    {
        id: "1894178",
        title: "Deep Focus",
        artist: "John Tasoulas",
        addedAt: Date.now(),
        audioUrl: "https://prod-1.storage.jamendo.com/?trackid=1894178&format=mp31&from=V3-z8-m7K5C1D8Z93o",
    }
];

export default function MusicPlayer() {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
    const [savedTracks, setSavedTracks] = useState<SavedTrack[]>([]);

    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Load saved tracks on mount & listen to storage events
    useEffect(() => {
        const loadTracks = () => {
            try {
                const stored = localStorage.getItem('vista_saved_tracks');
                if (stored) {
                    const parsed = JSON.parse(stored);
                    setSavedTracks(parsed.length > 0 ? parsed : DEFAULT_TRACKS);
                } else {
                    setSavedTracks(DEFAULT_TRACKS);
                }
            } catch (e) {
                console.error("Failed to load tracks", e);
                setSavedTracks(DEFAULT_TRACKS);
            }
        };

        loadTracks();
        window.addEventListener('storage', loadTracks);
        return () => window.removeEventListener('storage', loadTracks);
    }, []);

    // Ensure we don't go out of bounds if tracks change
    const effectiveIndex = Math.min(currentTrackIndex, Math.max(0, savedTracks.length - 1));
    const currentTrack = savedTracks[effectiveIndex] || DEFAULT_TRACKS[0];

    // Handle Play/Pause
    const togglePlay = () => {
        if (!audioRef.current || !currentTrack.audioUrl) return;

        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        } else {
            audioRef.current.play().then(() => {
                setIsPlaying(true);
            }).catch(e => {
                console.error("Playback failed:", e);
                setIsPlaying(false);
            });
        }
    };

    // Auto-sync audio element src
    useEffect(() => {
        if (audioRef.current && currentTrack) {
            // Only update src if it changed to avoid interrupting playback
            if (audioRef.current.src !== currentTrack.audioUrl && currentTrack.audioUrl) {
                audioRef.current.src = currentTrack.audioUrl;
                if (isPlaying) {
                    audioRef.current.play().catch(e => {
                        console.error("Autoplay prevented:", e);
                        setIsPlaying(false);
                    });
                }
            }
        }
    }, [effectiveIndex, savedTracks, currentTrack, isPlaying]);

    const nextTrack = () => {
        if (savedTracks.length === 0) return;
        const nextIdx = (effectiveIndex + 1) % savedTracks.length;
        setCurrentTrackIndex(nextIdx);
        // Keep playing if it was already playing
        if (isPlaying && audioRef.current) {
            // Re-trigger play in effect
            setIsPlaying(true);
        }
    };

    // Check if current playing track is actually in local storage manually (if not, it's a default/removed track)
    const isSaved = () => {
        try {
            const rawStored = localStorage.getItem('vista_saved_tracks');
            if (!rawStored) return false;
            const parsed: SavedTrack[] = JSON.parse(rawStored);
            return parsed.some(t => t.id === currentTrack.id);
        } catch {
            return false;
        }
    };

    const isCurrentlySaved = isSaved();

    const toggleSave = () => {
        try {
            const existing = JSON.parse(localStorage.getItem('vista_saved_tracks') || '[]');

            if (isCurrentlySaved) {
                // Remove
                const filtered = existing.filter((t: SavedTrack) => t.id !== currentTrack.id);
                localStorage.setItem('vista_saved_tracks', JSON.stringify(filtered));
            } else {
                // Add
                const trackToSave = {
                    ...currentTrack,
                    addedAt: Date.now()
                };
                localStorage.setItem('vista_saved_tracks', JSON.stringify([...existing, trackToSave]));
            }
            // Trigger storage update globally
            window.dispatchEvent(new Event('storage'));
        } catch (e) {
            console.error("Failed to save/remove track in bar", e);
        }
    };

    return (
        <motion.div
            drag
            dragMomentum={false}
            whileDrag={{ scale: 1.05, cursor: 'grabbing' }}
            initial={{ bottom: '1.5rem', right: '1.5rem' }}
            className="fixed z-50 flex items-center gap-2 p-2 rounded-full bg-white/80 backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/50 transition-colors duration-300 hover:bg-white/95 group cursor-grab"
        >
            <audio
                ref={audioRef}
                onEnded={nextTrack}
                onPause={() => setIsPlaying(false)}
                onPlay={() => setIsPlaying(true)}
            />

            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white shadow-md relative overflow-hidden">
                {currentTrack.imageUrl ? (
                    <>
                        <img src={currentTrack.imageUrl} alt="art" className="absolute inset-0 w-full h-full object-cover opacity-60" />
                        <Music size={16} className={cn("relative z-10", isPlaying && "animate-pulse")} />
                    </>
                ) : (
                    <Music size={16} className={cn(isPlaying && "animate-pulse")} />
                )}
            </div>

            <div className="flex flex-col w-0 group-hover:w-32 overflow-hidden transition-all duration-300 group-hover:px-2 select-none">
                <span className="text-sm font-bold text-gray-800 whitespace-nowrap truncate leading-tight">
                    {currentTrack.title}
                </span>
                <span className="text-[10px] text-muted truncate">
                    {currentTrack.artist}
                </span>
            </div>

            <div className="flex items-center gap-1 w-0 overflow-hidden group-hover:w-auto transition-all duration-300 opacity-0 group-hover:opacity-100 pl-1">
                <button
                    onClick={togglePlay}
                    className="p-2 hover:bg-black/5 rounded-full text-gray-800 transition-colors flex items-center justify-center"
                    title={isPlaying ? "Pause" : "Play"}
                >
                    {isPlaying ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
                </button>

                <button
                    onClick={nextTrack}
                    className="p-2 hover:bg-black/5 rounded-full text-gray-800 transition-colors flex items-center justify-center"
                    title="Next Track"
                >
                    <SkipForward size={16} />
                </button>

                <button
                    onClick={toggleSave}
                    className={cn(
                        "p-2 hover:bg-black/5 rounded-full transition-colors flex items-center justify-center",
                        isCurrentlySaved ? "text-red-500 hover:text-red-600" : "text-gray-400 hover:text-gray-600"
                    )}
                    title={isCurrentlySaved ? "Remove from Library" : "Save to Library"}
                >
                    <Heart size={16} fill={isCurrentlySaved ? "currentColor" : "none"} />
                </button>
            </div>

            {/* Drag Handle Indicator */}
            <div className="w-1.5 h-6 bg-gray-200 rounded-full mx-1 opacity-[0.4] group-hover:opacity-[0.8] transition-opacity cursor-grab" />
        </motion.div>
    );
}
