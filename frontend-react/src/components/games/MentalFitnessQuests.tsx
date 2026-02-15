import { useNavigate } from 'react-router-dom';
import { Card } from '../ui/Card';
import { Gamepad2, Trophy, ArrowRight, Sparkles } from 'lucide-react';
import { useAmbience } from '../../context/AmbienceContext';
import { cn } from '../../lib/utils';

export default function MentalFitnessQuests() {
    const { theme } = useAmbience();
    const navigate = useNavigate();

    const themeClass = theme === 'green' ? 'bg-emerald-50/60 border-4 border-emerald-200 backdrop-blur-md' :
        theme === 'lavender' ? 'bg-purple-50/60 border-4 border-purple-200 backdrop-blur-md' :
            'bg-rose-50/60 border-4 border-rose-200 backdrop-blur-md';

    return (
        <Card
            className={cn(
                "p-6 h-[22rem] flex flex-col relative overflow-hidden backdrop-blur-md group cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1 duration-500",
                themeClass
            )}
            onClick={() => navigate('/quests')}
        >
            {/* Background decoration */}
            <div className={cn(
                "absolute top-0 right-0 w-40 h-40 rounded-bl-full -mr-10 -mt-10 -z-10 opacity-50 transition-transform group-hover:scale-110",
                theme === 'green' ? 'bg-emerald-100' : theme === 'lavender' ? 'bg-purple-100' : 'bg-rose-100'
            )} />

            <div className="flex items-center justify-between mb-4 relative z-10">
                <div className={cn(
                    "p-2.5 rounded-xl text-indigo-600 transition-colors",
                    theme === 'green' ? 'bg-emerald-100/50 text-emerald-700' :
                        theme === 'lavender' ? 'bg-purple-100/50 text-purple-700' :
                            'bg-rose-100/50 text-rose-700'
                )}>
                    <Gamepad2 size={24} />
                </div>
                <div className="p-2 text-muted/50 group-hover:text-primary transition-colors">
                    <ArrowRight size={20} />
                </div>
            </div>

            <h3 className="font-serif font-bold text-xl text-text mb-2 relative z-10">Your Quests Journey</h3>
            <p className="text-sm text-muted mb-6 relative z-10 flex-1 max-w-[80%]">
                Level up your mind with daily challenges. Focus, relax, and grow.
            </p>

            <div className="relative z-10 mt-auto">
                <div className="w-full bg-white/60 backdrop-blur-sm border border-white/20 shadow-sm rounded-xl p-4 flex items-center justify-between group-hover:bg-white/80 transition-colors duration-500">
                    <div className="flex items-center gap-3">
                        <div className="bg-yellow-100 p-2 rounded-lg text-yellow-600">
                            <Trophy size={18} />
                        </div>
                        <div>
                            <span className="block text-xs font-semibold text-text">Daily Streak</span>
                            <span className="block text-[10px] text-muted">Keep it up!</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600">
                        <Sparkles size={14} />
                        <span>3 Days</span>
                    </div>
                </div>
            </div>
        </Card>
    );
}
