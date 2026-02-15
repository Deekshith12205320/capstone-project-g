import { useState } from 'react';
import { Card } from '../ui/Card';
import { Sun, CloudRain, Cloud, CloudLightning } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function WeatherSlider() {
    const [value, setValue] = useState(50);

    const getWeatherIcon = (val: number) => {
        if (val > 75) return { icon: Sun, label: 'Sunny', color: 'text-orange-500' };
        if (val > 50) return { icon: Cloud, label: 'Cloudy', color: 'text-blue-400' };
        if (val > 25) return { icon: CloudRain, label: 'Rainy', color: 'text-blue-600' };
        return { icon: CloudLightning, label: 'Stormy', color: 'text-purple-600' };
    };

    const { icon: Icon, label, color } = getWeatherIcon(value);

    return (
        <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-serif font-bold text-lg">Internal Weather</h3>
                <div className={cn("flex items-center gap-2 px-3 py-1 rounded-full bg-gray-50", color)}>
                    <Icon size={18} />
                    <span className="text-sm font-medium">{label}</span>
                </div>
            </div>

            <div className="relative pt-6 pb-2">
                <input
                    type="range"
                    min="0"
                    max="100"
                    value={value}
                    onChange={(e) => setValue(Number(e.target.value))}
                    className="w-full h-2 bg-gradient-to-r from-purple-500 via-blue-400 to-orange-400 rounded-lg appearance-none cursor-pointer"
                />
                <div
                    className="absolute top-0 transform -translate-x-1/2 transition-all duration-200"
                    style={{ left: `${value}%` }}
                >
                    <div className="bg-white text-xs font-bold px-2 py-1 rounded shadow-md border border-gray-100 mb-2">
                        {value}%
                    </div>
                </div>
            </div>
            <p className="text-xs text-muted mt-4 text-center">
                Slide to capture your current mood intensity
            </p>
        </Card>
    );
}
