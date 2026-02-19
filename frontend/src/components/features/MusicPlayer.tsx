import { useState } from 'react';
import { Music, Play, Pause, SkipForward, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

// Mock data for now
const MOCK_TRACKS = [
    { title: "Deep Focus", artist: "Ambient" },
    { title: "Nature Sounds", artist: "Relaxation" },
    { title: "Lo-Fi Beats", artist: "Chill" }
];

export default function MusicPlayer() {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
    const [isSaved, setIsSaved] = useState(false);

    const togglePlay = () => setIsPlaying(!isPlaying);

    const nextTrack = () => {
        setCurrentTrackIndex((prev) => (prev + 1) % MOCK_TRACKS.length);
        setIsSaved(false);
    };

    const toggleSave = () => {
        const newSavedState = !isSaved;
        setIsSaved(newSavedState);

        const trackToSave = {
            title: MOCK_TRACKS[currentTrackIndex].title,
            artist: MOCK_TRACKS[currentTrackIndex].artist,
            addedAt: Date.now()
        };

        try {
            const existing = JSON.parse(localStorage.getItem('vista_saved_tracks') || '[]');
            if (newSavedState) {
                localStorage.setItem('vista_saved_tracks', JSON.stringify([...existing, trackToSave]));
            } else {
                const filtered = existing.filter((t: any) => t.title !== trackToSave.title);
                localStorage.setItem('vista_saved_tracks', JSON.stringify(filtered));
            }
            // Dispatch event so MusicLibrary updates immediately if open
            window.dispatchEvent(new Event('storage'));
        } catch (e) {
            console.error("Failed to save track", e);
        }
    };

    const currentTrack = MOCK_TRACKS[currentTrackIndex];

    return (
        <motion.div
            drag
            dragMomentum={false}
            whileDrag={{ scale: 1.05, cursor: 'grabbing' }}
            initial={{ bottom: '1.5rem', right: '1.5rem' }}
            className="fixed z-50 flex items-center gap-2 p-2 rounded-full bg-white/80 backdrop-blur-md shadow-lg border border-white/50 transition-colors duration-300 hover:bg-white/90 group cursor-grab"
        >
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Music size={14} className={cn(isPlaying && "animate-pulse")} />
            </div>

            <div className="flex flex-col w-0 group-hover:w-24 overflow-hidden transition-all duration-300 group-hover:px-2 select-none">
                <span className="text-xs font-bold text-gray-700 whitespace-nowrap truncate">
                    {currentTrack.title}
                </span>
                <span className="text-[10px] text-muted truncate">
                    {currentTrack.artist}
                </span>
            </div>

            <button
                onClick={togglePlay}
                className="p-1.5 hover:bg-black/5 rounded-full text-gray-700 transition-colors"
                title={isPlaying ? "Pause" : "Play"}
            >
                {isPlaying ? <Pause size={14} /> : <Play size={14} />}
            </button>

            <button
                onClick={nextTrack}
                className="p-1.5 hover:bg-black/5 rounded-full text-gray-700 transition-colors"
                title="Next Track"
            >
                <SkipForward size={14} />
            </button>

            <button
                onClick={toggleSave}
                className={cn(
                    "p-1.5 hover:bg-black/5 rounded-full transition-colors",
                    isSaved ? "text-red-500" : "text-gray-400"
                )}
                title="Save Song"
            >
                <Heart size={14} fill={isSaved ? "currentColor" : "none"} />
            </button>

            {/* Drag Handle Indicator (optional visual cue) */}
            <div className="w-1 h-4 bg-gray-300 rounded-full mx-1 opacity-0 group-hover:opacity-100 transition-opacity" />
        </motion.div>
    );
}
