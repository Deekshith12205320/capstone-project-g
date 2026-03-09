import { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { X, Wind, Play, Square } from 'lucide-react';
import { useAmbience } from '../../context/AmbienceContext';
import { cn } from '../../lib/utils';

export default function BoxBreathing({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const { theme } = useAmbience();
    const [isActive, setIsActive] = useState(false);
    const [phase, setPhase] = useState<'idle' | 'inhale' | 'hold1' | 'exhale' | 'hold2'>('idle');
    const [cycles, setCycles] = useState(0);

    // 4-4-4-4 Timing (4 seconds each phase)
    useEffect(() => {
        if (!isActive) {
            setPhase('idle');
            return;
        }

        const phases = ['inhale', 'hold1', 'exhale', 'hold2'] as const;
        let currentIndex = phases.indexOf(phase as any);
        if (currentIndex === -1) currentIndex = 0;

        // Set initial phase
        if (phase === 'idle') setPhase('inhale');

        const timer = setTimeout(() => {
            const nextIndex = (currentIndex + 1) % 4;
            setPhase(phases[nextIndex]);
            if (nextIndex === 0) {
                setCycles((c) => c + 1);
            }
        }, 4000);

        return () => clearTimeout(timer);
    }, [isActive, phase]);

    useEffect(() => {
        if (!isOpen) {
            setIsActive(false);
            setPhase('idle');
            setCycles(0);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const themeClass = theme === 'green' ? 'bg-emerald-50 text-emerald-900 border-emerald-200' :
        theme === 'lavender' ? 'bg-purple-50 text-purple-900 border-purple-200' :
            'bg-rose-50 text-rose-900 border-rose-200';

    const getInstruction = () => {
        switch (phase) {
            case 'inhale': return "Breathe In";
            case 'hold1': return "Hold";
            case 'exhale': return "Breathe Out";
            case 'hold2': return "Hold";
            default: return "Ready?";
        }
    };

    const getScale = () => {
        switch (phase) {
            case 'idle': return 'scale-100';
            case 'inhale': return 'scale-150 duration-[4000ms]';
            case 'hold1': return 'scale-150 duration-0';
            case 'exhale': return 'scale-100 duration-[4000ms]';
            case 'hold2': return 'scale-100 duration-0';
            default: return 'scale-100';
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
            <div className={cn("rounded-3xl shadow-2xl max-w-lg w-full border-2 relative overflow-hidden flex flex-col min-h-[500px]", themeClass)}>

                {/* Header */}
                <div className="p-6 flex justify-between items-center relative z-10 border-b border-black/5 bg-white/50 backdrop-blur-md">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white rounded-xl text-teal-600 shadow-sm">
                            <Wind size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold font-serif">Box Breathing</h2>
                            <p className="text-sm opacity-70">Focus your mind</p>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-black/5 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col items-center justify-center relative z-10 p-8">

                    {/* Breathing Visualizer */}
                    <div className="relative w-48 h-48 flex items-center justify-center mb-12">
                        {/* Outer rotating dashed box */}
                        <div className={`absolute inset-0 border-2 border-dashed border-teal-500/30 rounded-3xl ${isActive ? 'animate-[spin_16s_linear_infinite]' : ''}`} />

                        {/* Inner breathing shape */}
                        <div
                            className={`w-32 h-32 bg-gradient-to-br from-teal-400 to-emerald-500 rounded-[2rem] shadow-lg flex items-center justify-center transition-transform ease-in-out ${getScale()}`}
                        >
                            <span className="text-white font-black tracking-widest uppercase text-xs opacity-90 drop-shadow-md">
                                {getInstruction()}
                            </span>
                        </div>
                    </div>

                    <div className="text-center mb-10">
                        <h3 className="font-serif text-2xl font-bold mb-2">4-4-4-4 Method</h3>
                        <p className="text-sm opacity-70 max-w-xs mx-auto">
                            Inhale for 4s, hold for 4s, exhale for 4s, hold for 4s. This resets your nervous system.
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <Button
                            onClick={() => setIsActive(!isActive)}
                            className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl px-8 py-6 shadow-md transition-all font-bold tracking-wide flex items-center gap-2"
                        >
                            {isActive ? <Square size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
                            {isActive ? "Stop" : "Begin Pacer"}
                        </Button>
                    </div>

                    {cycles > 0 && (
                        <div className="absolute bottom-6 font-mono text-xs opacity-50 font-bold uppercase tracking-widest">
                            Cycles completed: {cycles}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
