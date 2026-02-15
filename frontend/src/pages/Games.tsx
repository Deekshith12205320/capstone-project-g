import { useState } from 'react';
import { useAmbience } from '../context/AmbienceContext';
import { Card } from '../components/ui/Card';
import Sudoku from '../components/games/Sudoku';
import { Gamepad2, Brain, Puzzle } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Games() {
    const { theme } = useAmbience();
    const [activeGame, setActiveGame] = useState<'sudoku' | 'tetris' | null>(null);

    return (
        <div className={cn(
            "min-h-screen p-8 transition-colors duration-700",
            theme === 'green' ? 'bg-[#ecfdf5]' : theme === 'lavender' ? 'bg-[#fafaeb]' : 'bg-[#fff1f2]'
        )}>
            <div className="max-w-4xl mx-auto">
                <header className="mb-10 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white shadow-sm mb-4">
                        <Gamepad2 size={32} className="text-primary" />
                    </div>
                    <h1 className="text-4xl font-serif font-bold text-gray-900 mb-2">Mind Games</h1>
                    <p className="text-muted">Engage your brain, find your flow.</p>
                </header>

                {!activeGame ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card
                            className="p-8 hover:scale-105 cursor-pointer flex flex-col items-center text-center gap-4 group"
                            onClick={() => setActiveGame('sudoku')}
                        >
                            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                                <Puzzle size={40} className="text-blue-500" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-800">Sudoku</h3>
                                <p className="text-sm text-gray-500 mt-2">Classic number puzzle to sharpen your logic.</p>
                            </div>
                        </Card>

                        <Card
                            className="p-8 hover:scale-105 cursor-pointer flex flex-col items-center text-center gap-4 group opacity-50"
                            title="Coming Soon"
                        >
                            <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center group-hover:bg-purple-100 transition-colors">
                                <Brain size={40} className="text-purple-500" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-800">Brain Flow</h3>
                                <p className="text-sm text-gray-500 mt-2">Memory and pattern matching challenges.</p>
                            </div>
                        </Card>
                    </div>
                ) : (
                    <div className="animate-in slide-in-from-bottom-4">
                        <button
                            onClick={() => setActiveGame(null)}
                            className="mb-6 text-sm text-muted hover:text-primary flex items-center gap-1 transition-colors"
                        >
                            ← Back to Games
                        </button>

                        {activeGame === 'sudoku' && <Sudoku />}
                    </div>
                )}
            </div>
        </div>
    );
}
