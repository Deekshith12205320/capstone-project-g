import { Card } from '../ui/Card';
import { BookHeart, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { useAmbience } from '../../context/AmbienceContext';
import { cn } from '../../lib/utils';

export default function JournalCard() {
    const navigate = useNavigate();
    const { theme } = useAmbience();

    const themeClass = theme === 'green' ? 'bg-emerald-50/60 border-4 border-emerald-200 backdrop-blur-md' :
        theme === 'lavender' ? 'bg-purple-50/60 border-4 border-purple-200 backdrop-blur-md' :
            'bg-rose-50/60 border-4 border-rose-200 backdrop-blur-md';

    return (
        <Card
            className={cn(
                "p-6 h-[10rem] flex flex-col relative overflow-hidden backdrop-blur-md group cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1 duration-500",
                themeClass
            )}
            onClick={() => navigate('/journal')}
        >
            {/* Background decoration */}
            <div className={cn(
                "absolute top-0 right-0 w-32 h-32 rounded-bl-full -mr-8 -mt-8 -z-10 opacity-50 transition-transform group-hover:scale-110",
                theme === 'green' ? 'bg-emerald-100' : theme === 'lavender' ? 'bg-purple-100' : 'bg-rose-100'
            )} />

            <div className="flex items-center justify-between mb-4 relative z-10">
                <div className="p-2.5 bg-yellow-100/50 rounded-xl text-yellow-700">
                    <BookHeart size={24} />
                </div>
                <div className="p-2 text-muted/50 group-hover:text-primary transition-colors">
                    <ArrowRight size={20} />
                </div>
            </div>

            <h3 className="font-serif font-bold text-xl text-text mb-2 relative z-10">Daily Journal</h3>
            <p className="text-sm text-muted mb-6 relative z-10 flex-1">
                A safe space for your thoughts. Clear your mind and track your journey.
            </p>

            <div className="relative z-10 mt-auto">
                <div className="w-full h-32 bg-white border border-gray-100 shadow-sm rounded-r-xl border-l-4 border-l-primary/20 flex flex-col p-4 gap-3 rotate-1 group-hover:rotate-0 transition-all duration-500 origin-bottom-left">
                    <div className="h-2 w-full bg-gray-50 rounded-full" />
                    <div className="h-2 w-3/4 bg-gray-50 rounded-full" />
                    <div className="h-2 w-5/6 bg-gray-50 rounded-full" />
                    <div className="mt-auto flex items-center gap-2 text-xs font-medium text-emerald-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Write today's entry
                    </div>
                </div>
            </div>
        </Card>
    );
}
