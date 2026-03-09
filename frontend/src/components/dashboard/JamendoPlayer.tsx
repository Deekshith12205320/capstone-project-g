import { useState, useEffect, useRef } from 'react';
import { Music, Heart, Play, Pause, SkipBack, SkipForward } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAmbience } from '../../context/AmbienceContext';
import { cn } from '../../lib/utils';
import { fetchPopularJamendoTracks, type JamendoTrack } from '../../services/jamendoApi';

export interface SavedTrack {
    id: string;
    title: string;
    artist: string;
    addedAt: number;
    audioUrl?: string;
    imageUrl?: string;
}

export default function JamendoPlayer() {
    const { theme } = useAmbience();
    const navigate = useNavigate();
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const [tracks, setTracks] = useState<JamendoTrack[]>([]);
    const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [savedTracks, setSavedTracks] = useState<SavedTrack[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const loadInitialTracks = async () => {
            setIsLoading(true);
            const popularTracks = await fetchPopularJamendoTracks();
            if (popularTracks.length > 0) {
                setTracks(popularTracks);
            }
            setIsLoading(false);
        };
        loadInitialTracks();

        const stored = localStorage.getItem('vista_saved_tracks');
        if (stored) {
            try {
                setSavedTracks(JSON.parse(stored));
            } catch (e) { }
        }
    }, []);

    const currentTrack = tracks[currentTrackIndex];

    const togglePlay = () => {
        if (!audioRef.current || !currentTrack) return;
        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        } else {
            audioRef.current.play().then(() => {
                setIsPlaying(true);
            }).catch(e => console.error("Playback failed:", e));
        }
    };

    const nextTrack = () => {
        if (tracks.length === 0) return;
        const nextIndex = (currentTrackIndex + 1) % tracks.length;
        setCurrentTrackIndex(nextIndex);
        setIsPlaying(true);
    };

    const prevTrack = () => {
        if (tracks.length === 0) return;
        const prevIndex = (currentTrackIndex - 1 + tracks.length) % tracks.length;
        setCurrentTrackIndex(prevIndex);
        setIsPlaying(true);
    };

    const isTrackSaved = currentTrack ? savedTracks.some(t => t.id === currentTrack.id || t.title === currentTrack.name) : false;

    const toggleSaveTrack = () => {
        if (!currentTrack) return;
        let newSaved;
        if (isTrackSaved) {
            newSaved = savedTracks.filter(t => t.id !== currentTrack.id && t.title !== currentTrack.name);
        } else {
            newSaved = [...savedTracks, {
                id: currentTrack.id,
                title: currentTrack.name,
                artist: currentTrack.artist_name,
                addedAt: Date.now(),
                audioUrl: currentTrack.audio,
                imageUrl: currentTrack.image
            }];
        }
        setSavedTracks(newSaved);
        localStorage.setItem('vista_saved_tracks', JSON.stringify(newSaved));
        // dispatch storage event for other components
        window.dispatchEvent(new Event('storage'));
    };

    useEffect(() => {
        if (audioRef.current && currentTrack) {
            audioRef.current.src = currentTrack.audio;
            if (isPlaying) {
                audioRef.current.play().catch(e => {
                    console.error("Autoplay prevented:", e);
                    setIsPlaying(false);
                });
            }
        }
    }, [currentTrackIndex, tracks]);

    const themeClass = theme === 'green' ? 'bg-emerald-50/60 border-4 border-emerald-200 backdrop-blur-md' :
        theme === 'lavender' ? 'bg-purple-50/60 border-4 border-purple-200 backdrop-blur-md' :
            'bg-rose-50/60 border-4 border-rose-200 backdrop-blur-md';

    return (
        <div className={cn("backdrop-blur-md p-6 rounded-xl border shadow-sm relative overflow-hidden group transition-colors duration-500 h-[10rem] flex flex-col", themeClass)}>

            <audio
                ref={audioRef}
                onEnded={nextTrack}
                onPause={() => setIsPlaying(false)}
                onPlay={() => setIsPlaying(true)}
            />

            {/* Header */}
            <div className="flex justify-between items-center mb-4 z-10 relative">
                <div className="flex items-center gap-2">
                    <Music size={18} className="text-gray-700" />
                    <h3 className="font-bold text-gray-800 text-sm">Vista Music</h3>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => navigate('/library')}
                        className="text-xs font-bold bg-white/50 hover:bg-white px-3 py-1 rounded-full text-gray-700 transition-colors"
                    >
                        Library
                    </button>
                </div>
            </div>

            {/* Background blur of album art */}
            {currentTrack?.image && (
                <div
                    className="absolute inset-0 opacity-20 blur-xl bg-cover bg-center pointer-events-none transition-all duration-1000"
                    style={{ backgroundImage: `url(${currentTrack.image})` }}
                />
            )}

            <div className="flex-1 flex items-center justify-between gap-4 relative z-10 px-2">
                {currentTrack?.image ? (
                    <img
                        src={currentTrack.image}
                        alt="Album Art"
                        className={cn("w-20 h-20 rounded-xl shadow-lg transition-transform duration-500", isPlaying ? "scale-105" : "scale-100")}
                    />
                ) : (
                    <div className="w-20 h-20 rounded-xl bg-gray-200/50 flex items-center justify-center text-gray-400 shadow-inner">
                        {isLoading ? <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400"></div> : <Music size={24} />}
                    </div>
                )}

                <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <h4 className="font-bold text-gray-800 text-sm truncate w-full">
                        {currentTrack?.name || "Loading..."}
                    </h4>
                    <p className="text-xs text-gray-600 truncate w-full mb-3">
                        {currentTrack?.artist_name || "Please wait"}
                    </p>

                    <div className="flex items-center gap-4">
                        <button
                            className="p-2 rounded-full hover:bg-black/5 text-gray-700 transition-colors"
                            onClick={prevTrack}
                        >
                            <SkipBack size={16} />
                        </button>

                        <button
                            className="w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center hover:scale-105 transition-transform shadow-md"
                            onClick={togglePlay}
                        >
                            {isPlaying ? <Pause size={16} /> : <Play size={16} fill="currentColor" />}
                        </button>

                        <button
                            className="p-2 rounded-full hover:bg-black/5 text-gray-700 transition-colors"
                            onClick={nextTrack}
                        >
                            <SkipForward size={16} />
                        </button>

                        <button
                            className="p-2 rounded-full hover:bg-black/5 transition-colors ml-auto"
                            onClick={toggleSaveTrack}
                            title={isTrackSaved ? "Remove from Library" : "Save to Library"}
                        >
                            <Heart size={16} className={isTrackSaved ? "fill-red-500 text-red-500" : "text-gray-500"} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
