import { useState } from 'react';
import { X, RotateCcw } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/Button';

interface BubbleWrapProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function BubbleWrap({ isOpen, onClose }: BubbleWrapProps) {
    // 6x6 grid of bubbles
    const totalBubbles = 36;
    const [popped, setPopped] = useState<boolean[]>(new Array(totalBubbles).fill(false));

    if (!isOpen) return null;

    const playPopSound = () => {
        // Simple synthetic pop sound using Web Audio API would be ideal, 
        // but for now we'll rely on visual feedback or a very simple click if implied.
        // We can visual-only for MVP to avoid browser autoplay policies.
    };

    const handlePop = (index: number) => {
        if (!popped[index]) {
            const newPopped = [...popped];
            newPopped[index] = true;
            setPopped(newPopped);
            playPopSound();

            // Haptic feedback if available
            if (navigator.vibrate) navigator.vibrate(50);
        }
    };

    const reset = () => {
        setPopped(new Array(totalBubbles).fill(false));
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 w-full max-w-md p-6 relative">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-xl font-serif font-bold text-text">Stress Relief</h3>
                        <p className="text-xs text-muted">Pop the bubbles to release tension</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X size={20} className="text-muted" />
                    </button>
                </div>

                {/* Bubble Grid */}
                <div className="grid grid-cols-6 gap-3 mb-6 p-4 bg-orange-50/50 rounded-xl border border-orange-100/50">
                    {popped.map((isPopped, i) => (
                        <button
                            key={i}
                            onClick={() => handlePop(i)}
                            className={cn(
                                "aspect-square rounded-full shadow-inner transition-all duration-100 bg-gradient-to-br border",
                                isPopped
                                    ? "from-orange-200 to-orange-100 border-orange-200 scale-95 opacity-80" // Popped state
                                    : "from-orange-300 to-orange-400 border-orange-400 hover:scale-105 cursor-pointer shadow-md" // Unpopped state
                            )}
                            aria-label={isPopped ? "Popped bubble" : "Pop bubble"}
                        />
                    ))}
                </div>

                {/* Footer Actions */}
                <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-muted">
                        {popped.filter(Boolean).length} / {totalBubbles} Popped
                    </span>
                    <Button
                        onClick={reset}
                        size="sm"
                        variant="outline"
                        className="bg-white hover:bg-orange-50 text-orange-600 border-orange-200"
                    >
                        <RotateCcw size={16} className="mr-2" />
                        Reset Wrap
                    </Button>
                </div>
            </div>
        </div>
    );
}
