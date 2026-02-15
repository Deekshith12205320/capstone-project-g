import { useEffect, useState } from 'react';
import { cn } from '../../lib/utils';

export default function BiophilicLoader({ className }: { className?: string }) {
    const [breathState, setBreathState] = useState<'inhale' | 'hold' | 'exhale'>('inhale');

    useEffect(() => {
        // 4-7-8 Breathing Rhythm (simulated/simplified for UI)
        // Inhale: 4s, Hold: 2s, Exhale: 4s = 10s cycle (6 breaths/min)
        const cycle = () => {
            setBreathState('inhale');
            setTimeout(() => {
                setBreathState('hold');
                setTimeout(() => {
                    setBreathState('exhale');
                }, 2000);
            }, 4000);
        };

        cycle();
        const interval = setInterval(cycle, 10000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className={cn("flex flex-col items-center justify-center gap-4", className)}>
            <div className="relative flex items-center justify-center">
                {/* Outer Glow (Exhale) */}
                <div
                    className={cn(
                        "absolute w-32 h-32 rounded-full bg-primary/10 blur-xl transition-all duration-[4000ms] ease-in-out",
                        breathState === 'inhale' ? "scale-100 opacity-50" :
                            breathState === 'hold' ? "scale-110 opacity-60" : "scale-150 opacity-0"
                    )}
                />

                {/* Main Circle (Lungs) */}
                <div
                    className={cn(
                        "w-16 h-16 rounded-full bg-gradient-to-br from-teal-400 to-primary shadow-lg flex items-center justify-center transition-all duration-[4000ms] ease-in-out",
                        breathState === 'inhale' ? "scale-125 shadow-primary/40" :
                            breathState === 'hold' ? "scale-125 shadow-primary/50" : "scale-100 shadow-primary/20"
                    )}
                >
                    <div className="w-12 h-12 bg-white/20 rounded-full blur-sm" />
                </div>
            </div>

            <p className="text-muted text-sm font-medium animate-pulse tracking-widest uppercase">
                {breathState === 'inhale' ? "Breathe In" :
                    breathState === 'hold' ? "Hold" : "Breathe Out"}
            </p>
        </div>
    );
}
