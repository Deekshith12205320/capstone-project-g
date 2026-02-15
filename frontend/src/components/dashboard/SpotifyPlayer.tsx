import { useState, useEffect } from 'react';
import { Music, Heart, AlertCircle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAmbience } from '../../context/AmbienceContext';
import { cn } from '../../lib/utils';
import { Card } from '../ui/Card';

export default function SpotifyPlayer() {
    const { theme } = useAmbience();
    const navigate = useNavigate();
    const [token, setToken] = useState<string | null>(null);
    const [player, setPlayer] = useState<any>(null);
    const [isPaused, setPaused] = useState(false);
    const [isActive, setActive] = useState(false);
    const [currentTrack, setTrack] = useState<any>(null);
    // Removed unused tracks, isLoading, error states

    useEffect(() => {
        if (!token) return;

        const script = document.createElement("script");
        script.src = "https://sdk.scdn.co/spotify-player.js";
        script.async = true;

        document.body.appendChild(script);

        window.onSpotifyWebPlaybackSDKReady = () => {
            const player = new window.Spotify.Player({
                name: 'Vista Web Player',
                getOAuthToken: (cb: any) => { cb(token); },
                volume: 0.5
            });

            player.addListener('ready', ({ device_id }: any) => {
                console.log('Ready with Device ID', device_id);
                // Auto-transfer playback could happen here if we had backend to call /player
            });

            player.addListener('not_ready', ({ device_id }: any) => {
                console.log('Device ID has gone offline', device_id);
            });

            player.addListener('player_state_changed', (state: any) => {
                if (!state) return;
                setTrack(state.track_window.current_track);
                setPaused(state.paused);
                player.getCurrentState().then((state: any) => {
                    setActive(!!state);
                });
            });

            player.addListener('authentication_error', ({ message }: any) => {
                console.error(message);
                localStorage.removeItem('spotify_access_token');
                setToken(null);
            });

            player.connect();
            setPlayer(player);
        };

        return () => {
            // Cleanup provided by SDK usually handled by window unload, but good practice
        };
    }, [token]);

    const [view, setView] = useState<'player' | 'library'>('player');
    const [likedSongs, setLikedSongs] = useState<any[]>([]);

    useEffect(() => {
        if (token && view === 'library') {
            fetch('https://api.spotify.com/v1/me/tracks?limit=20', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
                .then(res => res.json())
                .then(data => {
                    if (data.items) setLikedSongs(data.items.map((i: any) => i.track));
                })
                .catch(err => console.error(err));
        }
    }, [token, view]);

    const playTrack = async (uri: string) => {
        if (!player) return;
        // This requires the device to be active, or we specific device_id if we stored it
        // Since we don't store device_id in state properly for this scope, let's just try basic play
        // Or tell user to select device.
        // For now, simpler to just start playback on active device
        try {
            await fetch(`https://api.spotify.com/v1/me/player/play`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ uris: [uri] })
            });
            setView('player');
        } catch (e) {
            console.error(e);
            alert("Please make sure 'Vista Web Player' is active in your Spotify App!");
        }
    };

    const themeClass = theme === 'green' ? 'bg-emerald-50/60 border-4 border-emerald-200 backdrop-blur-md' :
        theme === 'lavender' ? 'bg-purple-50/60 border-4 border-purple-200 backdrop-blur-md' :
            'bg-rose-50/60 border-4 border-rose-200 backdrop-blur-md';

    if (!token) {
        return (
            <Card
                className={cn("p-6 h-[10rem] flex flex-col relative overflow-hidden transition-colors duration-500 cursor-pointer hover:shadow-lg group", themeClass)}
                onClick={() => navigate('/library')}
            >
                {/* ... header ... */}
                <div className="flex items-center gap-3 mb-4 relative z-10">
                    <div className="p-2.5 bg-green-100/50 rounded-xl text-green-700">
                        <Music size={24} />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-serif font-bold text-xl text-text group-hover:text-primary transition-colors">Your Music Library</h3>
                    </div>
                    <ArrowRight size={20} className="text-muted/50 group-hover:text-primary transition-colors" />
                </div>

                <div className="flex-1 flex flex-col justify-center items-center text-center relative z-10">
                    <p className="text-sm text-muted mb-4">
                        Access your saved tracks in the Music Library page.
                    </p>
                    <div className="flex gap-2">
                        <div className="w-10 h-10 rounded-full bg-white/50 flex items-center justify-center animate-pulse">
                            <Music size={20} className="text-muted" />
                        </div>
                        <div className="w-10 h-10 rounded-full bg-white/50 flex items-center justify-center animate-pulse delay-75">
                            <Heart size={20} className="text-muted" />
                        </div>
                    </div>
                </div>

                {/* Background decoration */}
                <div className={cn(
                    "absolute -bottom-8 -right-8 w-32 h-32 rounded-full blur-3xl opacity-40 transition-colors",
                    theme === 'green' ? 'bg-green-400' : theme === 'lavender' ? 'bg-purple-400' : 'bg-rose-400'
                )} />
            </Card>
        );
    }

    return (
        <div className={cn("backdrop-blur-md p-6 rounded-xl border shadow-sm relative overflow-hidden group transition-colors duration-500 h-[10rem] flex flex-col", themeClass)}>

            {/* Header */}
            <div className="flex justify-between items-center mb-4 z-10 relative">
                <div className="flex items-center gap-2">
                    <Music size={18} className="text-gray-700" />
                    <h3 className="font-bold text-gray-800 text-sm">Now Playing</h3>
                </div>
                <button
                    onClick={() => setView(view === 'player' ? 'library' : 'player')}
                    className="text-xs font-bold bg-white/50 hover:bg-white px-3 py-1 rounded-full text-gray-700 transition-colors"
                >
                    {view === 'player' ? 'Open Library' : 'Back to Player'}
                </button>
            </div>

            {view === 'library' ? (
                <div className="flex-1 overflow-y-auto space-y-2 relative z-10 pr-2 custom-scrollbar">
                    {likedSongs.length === 0 && <p className="text-center text-sm text-muted mt-10">Loading liked songs...</p>}
                    {likedSongs.map((track) => (
                        <div key={track.id} onClick={() => playTrack(track.uri)} className="flex items-center gap-3 p-2 hover:bg-black/5 rounded-lg cursor-pointer group/track transition-colors">
                            <img src={track.album.images[2]?.url} alt={track.name} className="w-10 h-10 rounded shadow-sm" />
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-gray-800 truncate">{track.name}</p>
                                <p className="text-[10px] text-gray-500 truncate">{track.artists[0].name}</p>
                            </div>
                            <button className="opacity-0 group-hover/track:opacity-100 p-1.5 bg-[#1DB954] text-white rounded-full shadow-sm transition-opacity">
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <>
                    {/* Background blur of album art */}
                    {currentTrack?.album?.images?.[0]?.url && (
                        <div
                            className="absolute inset-0 opacity-20 blur-xl bg-cover bg-center pointer-events-none transition-all duration-1000"
                            style={{ backgroundImage: `url(${currentTrack.album.images[0].url})` }}
                        />
                    )}

                    <div className="flex-1 flex flex-col items-center justify-center gap-4 relative z-10">
                        {currentTrack?.album?.images?.[0]?.url ? (
                            <img
                                src={currentTrack.album.images[0].url}
                                alt="Album Art"
                                className="w-32 h-32 rounded-2xl shadow-2xl animate-in fade-in zoom-in-50 duration-500"
                            />
                        ) : (
                            <div className="w-32 h-32 rounded-2xl bg-gray-200/50 flex items-center justify-center text-gray-400 shadow-inner">
                                <Music size={40} />
                            </div>
                        )}

                        <div className="text-center w-full px-4">
                            <h4 className="font-bold text-gray-800 text-base truncate w-full">
                                {currentTrack?.name || "Vista Web Player"}
                            </h4>
                            <p className="text-sm text-gray-600 truncate w-full">
                                {currentTrack?.artists?.[0]?.name || (isActive ? "Ready to play" : "Select device: Vista Web Player")}
                            </p>
                        </div>
                    </div>

                    <div className="relative z-10 flex justify-center gap-6 mt-2 mb-2">
                        <button
                            className="p-3 rounded-full hover:bg-black/5 text-gray-700 transition-colors"
                            onClick={() => player?.previousTrack()}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
                            </svg>
                        </button>

                        <button
                            className="w-14 h-14 rounded-full bg-gray-900 text-white flex items-center justify-center hover:scale-105 transition-transform shadow-xl"
                            onClick={() => player?.togglePlay()}
                        >
                            {isPaused ? (
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                            ) : (
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
                            )}
                        </button>

                        <button
                            className="p-3 rounded-full hover:bg-black/5 text-gray-700 transition-colors"
                            onClick={() => player?.nextTrack()}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
                            </svg>
                        </button>
                    </div>

                    {!isActive && token && (
                        <div className="mt-2 text-[10px] text-center text-orange-600 bg-orange-50/80 p-1.5 rounded-full border border-orange-100 flex items-center justify-center gap-1.5 backdrop-blur-sm">
                            <AlertCircle size={10} />
                            <span>Open Spotify & Select "Vista Web Player"</span>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

// Add types for Spotify SDK
declare global {
    interface Window {
        onSpotifyWebPlaybackSDKReady: () => void;
        Spotify: any;
    }
}
