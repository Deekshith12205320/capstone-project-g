import { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { cn } from '../../lib/utils';
import { Sun, CloudSun, Cloud, CloudRain, CloudLightning, Quote } from 'lucide-react';
import { useAmbience } from '../../context/AmbienceContext';

const moods = [
    {
        value: 100,
        label: 'Bright',
        icon: Sun,
        color: 'text-orange-500',
        solid: 'bg-orange-500 text-white shadow-orange-500/30',
        tip: "You're glowing! Spread that energy—maybe pay a compliment to someone today."
    },
    {
        value: 75,
        label: 'Good',
        icon: CloudSun,
        color: 'text-yellow-500',
        solid: 'bg-yellow-500 text-white shadow-yellow-500/30',
        tip: "Great vibes. Keep the momentum going with a favorite upbeat song."
    },
    {
        value: 50,
        label: 'Okay',
        icon: Cloud,
        color: 'text-blue-400',
        solid: 'bg-blue-400 text-white shadow-blue-400/30',
        tip: "Steady and stable. A perfect time for 5 minutes of focused work or reading."
    },
    {
        value: 25,
        label: 'Low',
        icon: CloudRain,
        color: 'text-blue-600',
        solid: 'bg-blue-600 text-white shadow-blue-600/30',
        tip: "Be gentle with yourself. How about a warm drink or a short walk?"
    },
    {
        value: 0,
        label: 'Gloomy',
        icon: CloudLightning,
        color: 'text-purple-600',
        solid: 'bg-purple-600 text-white shadow-purple-600/30',
        tip: "It's okay to not be okay. Try the 'Bubble Wrap' quest or just breathe for 2 mins."
    },
];

export default function MoodSelector() {
    const { theme } = useAmbience();
    const [selectedMood, setSelectedMood] = useState<number | null>(null);

    const themeClass = theme === 'green' ? 'bg-emerald-50/60 border-4 border-emerald-200 backdrop-blur-md' :
        theme === 'lavender' ? 'bg-purple-50/60 border-4 border-purple-200 backdrop-blur-md' :
            'bg-rose-50/60 border-4 border-rose-200 backdrop-blur-md';

    useEffect(() => {
        const saved = localStorage.getItem('dailyMood');
        if (saved) setSelectedMood(parseInt(saved));
    }, []);

    const handleSelect = (value: number) => {
        setSelectedMood(value);
        localStorage.setItem('dailyMood', value.toString());
        // Could also trigger an API call here
    };

    const currentMoodData = moods.find(m => m.value === selectedMood);

    return (
        <Card className={cn("p-6 mb-8 border transition-all duration-500", themeClass)}>
            <h2 className="text-xl font-serif font-bold text-text mb-6 text-left">What color is your energy right now?</h2>

            <div className="flex flex-wrap gap-4 mb-6">
                {moods.map((mood) => {
                    const isSelected = selectedMood === mood.value;
                    return (
                        <button
                            key={mood.value}
                            onClick={() => handleSelect(mood.value)}
                            className={cn(
                                "flex items-center gap-2 px-6 py-3 rounded-2xl transition-all duration-300 font-medium",
                                isSelected
                                    ? cn(mood.solid, "scale-105 shadow-lg transform ring-2 ring-offset-2 ring-offset-white/50")
                                    : "bg-white/50 hover:bg-white hover:shadow-md text-muted hover:text-text"
                            )}
                        >
                            <mood.icon
                                size={20}
                                className={cn(
                                    "transition-colors",
                                    isSelected ? "text-white" : mood.color
                                )}
                            />
                            <span>{mood.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* Dynamic Tip Area */}
            {currentMoodData && (
                <div className="animate-in slide-in-from-top-2 fade-in duration-500">
                    <div className="bg-white/50 rounded-xl p-4 border border-white/40 flex items-start gap-3">
                        <Quote className="text-primary shrink-0 mt-1" size={20} />
                        <div>
                            <p className="font-serif font-bold text-lg text-text mb-1">
                                {currentMoodData.label} Energy
                            </p>
                            <p className="text-muted text-sm leading-relaxed">
                                {currentMoodData.tip}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </Card>
    );
}
