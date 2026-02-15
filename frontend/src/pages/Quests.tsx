import { useState } from 'react';
import { Gamepad2, Grid3X3, Layers, Box, Sparkles } from 'lucide-react';
import BubbleWrap from '../components/games/BubbleWrap';
import GratitudeBingo from '../components/games/GratitudeBingo';

export default function Quests() {
    const [activeGame, setActiveGame] = useState<string | null>(null);

    const quests = [
        {
            id: 'bubble-wrap',
            label: 'Bubble Wrap',
            icon: <Layers size={32} className="text-orange-500" />,
            desc: 'Pop stress away instantly',
            longDesc: 'A simple, tactile way to relieve anxiety. Pop bubbles endlessly with satisfying sounds.',
            color: 'bg-orange-50 hover:bg-orange-100',
            borderColor: 'border-orange-100',
            barColor: 'bg-orange-500',
            progress: 30,
            onClick: () => setActiveGame('bubble-wrap')
        },
        {
            id: 'bingo',
            label: 'Gratitude Bingo',
            icon: <Grid3X3 size={32} className="text-rose-500" />,
            desc: 'Find the positives in your day',
            longDesc: 'Train your brain to scan for the good things. Complete a row to win!',
            color: 'bg-rose-50 hover:bg-rose-100',
            borderColor: 'border-rose-100',
            barColor: 'bg-rose-500',
            progress: 60,
            onClick: () => setActiveGame('bingo')
        },
        {
            id: 'tetris',
            label: 'Tetris Flow',
            icon: <Box size={32} className="text-blue-500" />,
            desc: 'Organize your thoughts',
            longDesc: 'Find flow and focus by fitting pieces together. Coming soon.',
            color: 'bg-blue-50 hover:bg-blue-100',
            borderColor: 'border-blue-100',
            barColor: 'bg-blue-500',
            progress: 10,
            onClick: () => { }
        },
        {
            id: '2048',
            label: 'Mindful 2048',
            icon: <Gamepad2 size={32} className="text-purple-500" />,
            desc: 'Focus & merge numbers',
            longDesc: 'A relaxing number puzzle to sharpen your mind. Coming soon.',
            color: 'bg-purple-50 hover:bg-purple-100',
            borderColor: 'border-purple-100',
            barColor: 'bg-purple-500',
            progress: 0,
            onClick: () => { }
        },
        {
            id: 'journaling',
            label: 'Expressive Writing',
            icon: <Layers size={32} className="text-indigo-500" />,
            desc: 'Unload your mind',
            longDesc: 'Write freely for 5 minutes. No judgment, just flow.',
            color: 'bg-indigo-50 hover:bg-indigo-100',
            borderColor: 'border-indigo-100',
            barColor: 'bg-indigo-500',
            progress: 0,
            onClick: () => { }
        },
        {
            id: 'breathing',
            label: 'Box Breathing',
            icon: <Sparkles size={32} className="text-teal-500" />,
            desc: 'Regulate your nervous system',
            longDesc: 'Inhale, hold, exhale, hold. 4 seconds each.',
            color: 'bg-teal-50 hover:bg-teal-100',
            borderColor: 'border-teal-100',
            barColor: 'bg-teal-500',
            progress: 0,
            onClick: () => { }
        }
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <header className="mb-8 flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-serif font-bold text-text mb-2">Your Quests Journey</h1>
                    <p className="text-muted text-lg">Daily mind exercises to build resilience and joy.</p>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {quests.map(quest => (
                    <button
                        key={quest.id}
                        onClick={quest.onClick}
                        className={`
                            relative p-6 rounded-2xl border text-left transition-all duration-300
                            ${quest.color} ${quest.borderColor}
                            hover:scale-[1.02] hover:shadow-md spotlight-card group flex flex-col h-64 justify-between
                        `}
                    >
                        <div>
                            <div className="flex justify-between items-start mb-4">
                                <div className="bg-white/60 w-14 h-14 rounded-2xl flex items-center justify-center backdrop-blur-sm shadow-sm">
                                    {quest.icon}
                                </div>
                                {quest.progress > 0 && (
                                    <div className="bg-white/50 px-3 py-1 rounded-full text-xs font-bold text-muted border border-white/20">
                                        Lvl {Math.floor(quest.progress / 20) + 1}
                                    </div>
                                )}
                            </div>

                            <h3 className="font-bold text-xl text-gray-800 mb-2 group-hover:text-black">
                                {quest.label}
                            </h3>
                            <p className="text-sm text-muted font-medium mb-1">
                                {quest.desc}
                            </p>
                            <p className="text-xs text-muted/70">
                                {quest.longDesc}
                            </p>
                        </div>

                        {/* Progress Bar */}
                        <div className="mt-4">
                            <div className="flex justify-between text-xs font-bold text-muted mb-1.5 opacity-80">
                                <span>Progress</span>
                                <span>{quest.progress}%</span>
                            </div>
                            <div className="w-full bg-black/5 h-2.5 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full ${quest.barColor} transition-all duration-1000`}
                                    style={{ width: `${quest.progress}%` }}
                                />
                            </div>
                        </div>
                    </button>
                ))}
            </div>

            {/* Daily Challenge / Streak Section */}
            <div className="mt-12 p-8 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-xl relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2 text-indigo-100 font-bold tracking-wide uppercase text-xs">
                            <Sparkles size={16} />
                            Daily Challenge
                        </div>
                        <h2 className="text-3xl font-serif font-bold mb-2">Complete 3 Quests Today</h2>
                        <p className="text-indigo-100 max-w-md">
                            Consistency is key to mental fitness. Complete 3 quick exercises to maintain your streak and earn a badge.
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-center">
                            <div className="text-4xl font-bold">1</div>
                            <div className="text-xs text-indigo-200 uppercase font-bold">Streak</div>
                        </div>
                        <div className="h-12 w-px bg-indigo-400/50"></div>
                        <button className="bg-white text-indigo-600 px-6 py-3 rounded-xl font-bold hover:bg-indigo-50 transition-colors shadow-lg">
                            Claim Reward
                        </button>
                    </div>
                </div>

                {/* Background decoration */}
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-black/10 rounded-full blur-3xl pointer-events-none"></div>
            </div>

            {/* Game Modals */}
            <BubbleWrap
                isOpen={activeGame === 'bubble-wrap'}
                onClose={() => setActiveGame(null)}
            />
            <GratitudeBingo
                isOpen={activeGame === 'bingo'}
                onClose={() => setActiveGame(null)}
            />
        </div>
    );
}
