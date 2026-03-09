import { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { X, PenTool, Play, CheckCircle2 } from 'lucide-react';
import { useAmbience } from '../../context/AmbienceContext';
import { cn } from '../../lib/utils';

export default function ExpressiveWriting({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const { theme } = useAmbience();
    const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
    const [isActive, setIsActive] = useState(false);
    const [text, setText] = useState('');
    const [completed, setCompleted] = useState(false);

    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((time) => time - 1);
            }, 1000);
        } else if (timeLeft === 0 && isActive) {
            setIsActive(false);
            setCompleted(true);
        }
        return () => clearInterval(interval);
    }, [isActive, timeLeft]);

    useEffect(() => {
        if (!isOpen) {
            // Reset state when closed
            setIsActive(false);
            setTimeLeft(300);
            setText('');
            setCompleted(false);
        }
    }, [isOpen]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (!isOpen) return null;

    const startTimer = () => setIsActive(true);

    const themeClass = theme === 'green' ? 'bg-emerald-50 text-emerald-900 border-emerald-200' :
        theme === 'lavender' ? 'bg-purple-50 text-purple-900 border-purple-200' :
            'bg-rose-50 text-rose-900 border-rose-200';

    const progressPercent = ((300 - timeLeft) / 300) * 100;

    return (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className={cn("rounded-3xl shadow-2xl max-w-2xl w-full border-2 relative overflow-hidden flex flex-col h-[80vh] max-h-[700px]", themeClass)}>

                {/* Header */}
                <div className="p-6 border-b border-black/5 flex justify-between items-center bg-white/50 backdrop-blur-md relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white rounded-xl shadow-sm text-indigo-600">
                            <PenTool size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-serif font-bold">Expressive Writing</h2>
                            <p className="text-sm opacity-70">5 Minutes of Unfiltered Flow</p>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-black/5 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Progress Bar */}
                {isActive && (
                    <div className="w-full h-1 bg-black/5 relative z-10">
                        <div
                            className="h-full bg-indigo-500 transition-all duration-1000 ease-linear"
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>
                )}

                {/* Content */}
                <div className="flex-1 p-8 flex flex-col relative z-10">
                    {!isActive && !completed ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center max-w-md mx-auto">
                            <h3 className="text-3xl font-serif font-bold mb-4">Unload your mind</h3>
                            <p className="opacity-80 mb-8 leading-relaxed">
                                For the next 5 minutes, write continuously. Do not stop to edit, format, or judge your spelling. If you run out of things to say, type "I don't know what to write" until a new thought appears.
                            </p>
                            <Button
                                onClick={startTimer}
                                className="px-8 py-4 rounded-full text-lg shadow-lg hover:scale-105 transition-transform"
                            >
                                <Play size={20} className="mr-2" />
                                Start Timer
                            </Button>
                        </div>
                    ) : completed ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-500">
                            <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 shadow-inner">
                                <CheckCircle2 size={48} />
                            </div>
                            <h3 className="text-3xl font-serif font-bold mb-4">Space Created</h3>
                            <p className="opacity-80 mb-8 max-w-md">
                                You have successfully unloaded your active thoughts. Notice how your breathing feels right now.
                            </p>
                            <Button onClick={onClose} variant="outline" className="bg-white/50 px-8">
                                Return to Quests
                            </Button>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col">
                            <div className="flex justify-between items-end mb-4">
                                <span className="text-sm font-semibold opacity-60 uppercase tracking-widest">Keep Writing</span>
                                <span className="text-3xl font-mono font-bold tracking-tighter tabular-nums drop-shadow-sm">
                                    {formatTime(timeLeft)}
                                </span>
                            </div>
                            <textarea
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                placeholder="Start typing whatever comes to mind..."
                                className="flex-1 w-full bg-white/40 backdrop-blur-sm border-0 rounded-2xl p-6 text-lg resize-none focus:ring-2 focus:ring-indigo-500 shadow-inner placeholder:italic placeholder:opacity-40 outline-none leading-relaxed"
                                autoFocus
                            />
                        </div>
                    )}
                </div>

                {/* Decorative Background */}
                <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-white/40 to-transparent pointer-events-none" />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/20 rounded-tl-full blur-3xl pointer-events-none" />

            </div>
        </div>
    );
}
