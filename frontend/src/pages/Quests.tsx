import { useState } from 'react';
import { Grid3X3, Layers, Box, Sparkles } from 'lucide-react';
import CandyBubble from '../components/games/CandyBubble';
import ForestMania from '../components/games/ForestMania';
import AntiStress from '../components/games/AntiStress';
import TopBurger from '../components/games/TopBurger';
import { useRewards } from '../hooks/useRewards';
import { Card } from '../components/ui/Card';
import { X, Award, Flame } from 'lucide-react';

export default function Quests() {
    const [activeGame, setActiveGame] = useState<string | null>(null);
    const [showBadges, setShowBadges] = useState(false);
    const { stats, badges, completeQuest } = useRewards();

    const quests = [
        {
            id: 'candy-bubble',
            label: 'Candy Bubble',
            icon: <Layers size={32} className="text-pink-500" />,
            desc: 'Infinite bubbles and fun',
            longDesc: 'A never-ending adventure with infinite bubbles and fun.',
            color: 'bg-pink-50 hover:bg-pink-100',
            borderColor: 'border-pink-100',
            barColor: 'bg-pink-500',
            progress: 0,
            onClick: () => setActiveGame('candy-bubble')
        },
        {
            id: 'forest-mania',
            label: 'Forest Mania',
            icon: <Grid3X3 size={32} className="text-emerald-500" />,
            desc: 'Match 3 animals',
            longDesc: 'The latest and newest in ACCUMULATIVE "Match 3" puzzles!',
            color: 'bg-emerald-50 hover:bg-emerald-100',
            borderColor: 'border-emerald-100',
            barColor: 'bg-emerald-500',
            progress: 0,
            onClick: () => setActiveGame('forest-mania')
        },
        {
            id: 'anti-stress',
            label: 'Anti Stress Game',
            icon: <Sparkles size={32} className="text-teal-500" />,
            desc: 'Relaxation and diversion',
            longDesc: 'When you need relaxation, diversion or just a moment of distraction.',
            color: 'bg-teal-50 hover:bg-teal-100',
            borderColor: 'border-teal-100',
            barColor: 'bg-teal-500',
            progress: 0,
            onClick: () => setActiveGame('anti-stress')
        },
        {
            id: 'top-burger',
            label: 'Top Burger',
            icon: <Box size={32} className="text-orange-500" />,
            desc: 'Fast food simulation',
            longDesc: 'You just opened a burger restaurant, let\'s see if you can put together burgers fast enough!',
            color: 'bg-orange-50 hover:bg-orange-100',
            borderColor: 'border-orange-100',
            barColor: 'bg-orange-500',
            progress: 0,
            onClick: () => setActiveGame('top-burger')
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

                        {/* Progress Bar Removed - Just showing Level badge at the top */}
                    </button>
                ))}
            </div>

            {/* Daily Challenge / Streak Section */}
            <div className="mt-12 p-8 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-xl relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2 text-indigo-100 font-bold tracking-wide uppercase text-xs">
                            <Sparkles size={16} />
                            Your Progress
                        </div>
                        <h2 className="text-3xl font-serif font-bold mb-2">Level {stats.level}</h2>
                        <div className="flex items-center gap-4 mt-4">
                            <div className="bg-black/20 w-48 h-2 rounded-full overflow-hidden">
                                <div className="bg-indigo-300 h-full" style={{ width: `${(stats.xp % 100)}%` }} />
                            </div>
                            <span className="text-sm font-bold opacity-80">{stats.xp} / {stats.level * 100} XP</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-center group cursor-pointer" onClick={() => setShowBadges(true)}>
                            <div className="text-4xl font-bold text-yellow-300 flex justify-center items-center drop-shadow-md group-hover:scale-110 transition-transform">
                                {stats.currentStreak} <Flame size={28} className="ml-1" />
                            </div>
                            <div className="text-xs text-indigo-200 uppercase font-bold tracking-widest mt-1">Day Streak</div>
                        </div>
                        <div className="h-12 w-px bg-indigo-400/50 mx-2"></div>
                        <button
                            onClick={() => setShowBadges(true)}
                            className="bg-white text-indigo-600 px-6 py-3 rounded-xl font-bold hover:bg-indigo-50 transition-colors shadow-lg flex items-center gap-2"
                        >
                            <Award size={18} /> View Badges
                        </button>
                    </div>
                </div>

                {/* Background decoration */}
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-black/10 rounded-full blur-3xl pointer-events-none"></div>
            </div>

            {/* Badges Modal */}
            {showBadges && (
                <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <Card className="max-w-xl w-full p-6 max-h-[80vh] overflow-y-auto relative animate-in zoom-in-95">
                        <button onClick={() => setShowBadges(false)} className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <X size={20} />
                        </button>
                        <div className="mb-6">
                            <h2 className="text-3xl font-serif font-bold text-gray-900 mb-2">Your Trophies</h2>
                            <p className="text-gray-500">Collect badges by maintaining streaks and mastering quests.</p>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {badges.map(badge => (
                                <div key={badge.id} className={`p-4 rounded-xl border text-center transition-all ${badge.unlockedAt ? 'bg-indigo-50/50 border-indigo-200 hover:shadow-md' : 'bg-gray-50 border-gray-100 opacity-60 grayscale'}`}>
                                    <div className="text-4xl mb-3 drop-shadow-sm">{badge.icon}</div>
                                    <h3 className="font-bold text-gray-900 text-sm mb-1">{badge.title}</h3>
                                    <p className="text-[10px] text-gray-500 leading-tight">{badge.description}</p>
                                    {badge.unlockedAt && (
                                        <div className="mt-3 text-[9px] font-bold text-indigo-600 tracking-widest uppercase">
                                            Unlocked {new Date(badge.unlockedAt).toLocaleDateString()}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            )}

            {/* Game Modals */}
            <CandyBubble
                isOpen={activeGame === 'candy-bubble'}
                onClose={() => {
                    completeQuest('candy-bubble');
                    setActiveGame(null);
                }}
            />
            <ForestMania
                isOpen={activeGame === 'forest-mania'}
                onClose={() => {
                    completeQuest('forest-mania');
                    setActiveGame(null);
                }}
            />
            <AntiStress
                isOpen={activeGame === 'anti-stress'}
                onClose={() => {
                    completeQuest('anti-stress');
                    setActiveGame(null);
                }}
            />
            <TopBurger
                isOpen={activeGame === 'top-burger'}
                onClose={() => {
                    completeQuest('top-burger');
                    setActiveGame(null);
                }}
            />
        </div>
    );
}
