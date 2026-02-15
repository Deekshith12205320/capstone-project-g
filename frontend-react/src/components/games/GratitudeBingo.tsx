import { useState, useMemo } from 'react';
import { X, RotateCcw, Check, Sparkles } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/Button';

interface GratitudeBingoProps {
    isOpen: boolean;
    onClose: () => void;
}

const PROMPTS = [
    "A small win today",
    "Someone you love",
    "A tasty meal",
    "Fresh air",
    "A good memory",
    "Something beautiful",
    "A kind gesture",
    "Your health",
    "A favorite song",
    "A warm bed",
    "Drinking water",
    "Laughing out loud"
];

export default function GratitudeBingo({ isOpen, onClose }: GratitudeBingoProps) {
    // Randomize 9 prompts for a 3x3 grid on open is tricky without flickering, 
    // so we memoize a set or just use a fixed set for MVP.
    // Let's shuffle properly once.
    const gridPrompts = useMemo(() => {
        return [...PROMPTS].sort(() => 0.5 - Math.random()).slice(0, 9);
    }, [isOpen]); // Reshuffle only when reopened

    const [marked, setMarked] = useState<boolean[]>(new Array(9).fill(false));

    // Check for Bingo (Rows, Cols, Diagonals)
    const isBingo = useMemo(() => {
        const wins = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Cols
            [0, 4, 8], [2, 4, 6]             // Diagonals
        ];
        return wins.some(line => line.every(i => marked[i]));
    }, [marked]);

    if (!isOpen) return null;

    const toggleCell = (index: number) => {
        const newMarked = [...marked];
        newMarked[index] = !newMarked[index];
        setMarked(newMarked);
    };

    const reset = () => {
        setMarked(new Array(9).fill(false));
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 w-full max-w-md p-6 relative overflow-hidden">
                {/* Confetti / Celebration Overlay if Bingo */}
                {isBingo && (
                    <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center">
                        <div className="absolute inset-0 bg-yellow-400/10 animate-pulse" />
                        <div className="text-6xl font-bold text-yellow-500 animate-bounce drop-shadow-md">
                            BINGO!
                        </div>
                    </div>
                )}

                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-xl font-serif font-bold text-text flex items-center gap-2">
                            Gratitude Bingo <Sparkles size={16} className="text-yellow-500" />
                        </h3>
                        <p className="text-xs text-muted">Find 3 acts of gratitude in a row</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X size={20} className="text-muted" />
                    </button>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                    {gridPrompts.map((prompt, i) => (
                        <button
                            key={i}
                            onClick={() => toggleCell(i)}
                            className={cn(
                                "aspect-square rounded-xl p-2 flex flex-col items-center justify-center text-center transition-all duration-200 border relative group",
                                marked[i]
                                    ? "bg-rose-100 border-rose-200 text-rose-800 scale-95"
                                    : "bg-white border-gray-100 hover:border-rose-200 hover:shadow-md text-gray-600 hover:scale-[1.02]"
                            )}
                        >
                            {marked[i] && (
                                <div className="absolute top-1 right-1">
                                    <Check size={14} className="text-rose-500" />
                                </div>
                            )}
                            <span className="text-xs font-medium leading-tight">
                                {prompt}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Footer */}
                <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-muted">
                        {marked.filter(Boolean).length} Found
                    </span>
                    <Button
                        onClick={reset}
                        size="sm"
                        variant="outline"
                        className="bg-white hover:bg-rose-50 text-rose-600 border-rose-200"
                    >
                        <RotateCcw size={16} className="mr-2" />
                        Reset Board
                    </Button>
                </div>
            </div>
        </div>
    );
}
