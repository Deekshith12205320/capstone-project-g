import { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX, Play, Pause, SkipForward, Music } from 'lucide-react';

const TRACKS = [
    {
        title: "Serenity",
        url: "https://cdn.pixabay.com/download/audio/2022/02/07/audio_1822002e77.mp3?filename=relaxing-music-vol1-124477.mp3",
        // Placeholder: Relaxing Music Vol.1
    },
    {
        title: "Floating",
        url: "https://cdn.pixabay.com/download/audio/2022/10/18/audio_31c2730e64.mp3?filename=relaxing-mountains-141205.mp3",
        // Placeholder: Relaxing Mountains
    },
    {
        title: "Deep Inhale",
        url: "https://cdn.pixabay.com/download/audio/2022/03/24/audio_070cb1e621.mp3?filename=meditation-197669.mp3",
        // Placeholder: Meditation
    }
];

export default function AmbientAudioPlayer() {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [currentTrack, setCurrentTrack] = useState(0);
    const [volume] = useState(0.3); // Default low volume
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Initialize random track on mount
    useEffect(() => {
        const randomTrack = Math.floor(Math.random() * TRACKS.length);
        setCurrentTrack(randomTrack);

        // Attempt auto-play (browsers might block this without interaction)
        const playPromise = audioRef.current?.play();
        if (playPromise !== undefined) {
            playPromise
                .then(() => {
                    setIsPlaying(true);
                })
                .catch(error => {
                    console.log("Auto-play prevented:", error);
                    setIsPlaying(false);
                });
        }
    }, []);

    useEffect(() => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.play().catch(() => setIsPlaying(false));
            } else {
                audioRef.current.pause();
            }
        }
    }, [isPlaying, currentTrack]);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = isMuted ? 0 : volume;
        }
    }, [volume, isMuted]);

    const togglePlay = () => setIsPlaying(!isPlaying);
    const toggleMute = () => setIsMuted(!isMuted);

    const nextTrack = () => {
        let next = currentTrack + 1;
        if (next >= TRACKS.length) next = 0;
        setCurrentTrack(next);
        setIsPlaying(true); // Ensure it plays when skipping
    };

    const handleEnded = () => {
        nextTrack();
    };

    return (
        <div className="fixed bottom-6 right-6 z-40 flex items-center gap-2 p-2 rounded-full bg-white/80 backdrop-blur-md shadow-lg border border-white/50 transition-all duration-300 hover:scale-105 group">
            <audio
                ref={audioRef}
                src={TRACKS[currentTrack].url}
                onEnded={handleEnded}
                loop={false}
            />

            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                <Music size={14} className={isPlaying ? "animate-pulse" : ""} />
            </div>

            <div className="flex flex-col w-0 group-hover:w-auto overflow-hidden transition-all duration-300 group-hover:px-2">
                <span className="text-xs font-bold text-gray-700 whitespace-nowrap">
                    {TRACKS[currentTrack].title}
                </span>
            </div>

            <button
                onClick={togglePlay}
                className="p-1.5 hover:bg-black/5 rounded-full text-gray-700 transition-colors"
                title={isPlaying ? "Pause" : "Play"}
            >
                {isPlaying ? <Pause size={16} /> : <Play size={16} />}
            </button>

            <button
                onClick={nextTrack}
                className="p-1.5 hover:bg-black/5 rounded-full text-gray-700 transition-colors"
                title="Next Track"
            >
                <SkipForward size={16} />
            </button>

            <button
                onClick={toggleMute}
                className="p-1.5 hover:bg-black/5 rounded-full text-gray-700 transition-colors"
                title={isMuted ? "Unmute" : "Mute"}
            >
                {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>

            {/* Hidden Volume Slider (could expand on hover, keeping simple for now) */}
        </div>
    );
}
