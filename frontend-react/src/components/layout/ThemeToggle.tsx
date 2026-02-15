import { useAmbience } from '../../context/AmbienceContext';
import { Palette } from 'lucide-react';
import { useState } from 'react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/Button';

export default function ThemeToggle() {
    const { theme, setTheme } = useAmbience();
    const [isOpen, setIsOpen] = useState(false);

    const toggleOpen = () => setIsOpen(!isOpen);

    return (
        <div className="fixed top-6 right-8 z-50 flex flex-col items-end gap-2">
            <div
                className={cn(
                    "flex items-center gap-2 p-2 rounded-full bg-white/80 backdrop-blur-md border border-white/50 shadow-lg transition-all duration-300 origin-right",
                    isOpen ? "scale-100 opacity-100" : "scale-50 opacity-0 pointer-events-none absolute right-0"
                )}
            >
                <span className="text-xs font-medium text-muted ml-2">Theme</span>

                {/* Green Theme */}
                <button
                    onClick={() => setTheme('green')}
                    className={cn(
                        "w-8 h-8 rounded-full border-2 transition-all duration-300 flex items-center justify-center bg-green-100",
                        theme === 'green' ? "border-primary ring-2 ring-primary/20 scale-110" : "border-transparent hover:scale-105"
                    )}
                    title="Nature"
                >
                    <div className="w-4 h-4 rounded-full bg-[#34A853]" />
                </button>

                {/* Lavender Theme */}
                <button
                    onClick={() => setTheme('lavender')}
                    className={cn(
                        "w-8 h-8 rounded-full border-2 transition-all duration-300 flex items-center justify-center bg-purple-100",
                        theme === 'lavender' ? "border-primary ring-2 ring-primary/20 scale-110" : "border-transparent hover:scale-105"
                    )}
                    title="Serenity"
                >
                    <div className="w-4 h-4 rounded-full bg-[#9333ea]" />
                </button>

                {/* Pink Theme */}
                <button
                    onClick={() => setTheme('pink')}
                    className={cn(
                        "w-8 h-8 rounded-full border-2 transition-all duration-300 flex items-center justify-center bg-pink-100",
                        theme === 'pink' ? "border-primary ring-2 ring-primary/20 scale-110" : "border-transparent hover:scale-105"
                    )}
                    title="Gentle"
                >
                    <div className="w-4 h-4 rounded-full bg-[#ec4899]" />
                </button>
            </div>

            <Button
                variant="outline"
                onClick={toggleOpen}
                className={cn(
                    "w-12 h-12 rounded-full shadow-lg border-2 transition-all duration-300",
                    isOpen ? "bg-white border-primary text-primary rotate-90" : "bg-white/80 border-white/50 text-muted hover:text-primary hover:border-primary/50"
                )}
            >
                <Palette size={20} />
            </Button>
        </div>
    );
}
