import { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { X } from 'lucide-react';

interface Stats {
    sleep: number;
    focus: number;
    social: number;
    stress: number;
    anxiety: number;
    depression: number;
}

interface AssessmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    stats: Stats;
    onSave: (newStats: Stats) => void;
}

export default function AssessmentModal({ isOpen, onClose, stats, onSave }: AssessmentModalProps) {
    const [localStats, setLocalStats] = useState(stats);

    if (!isOpen) return null;

    const handleChange = (key: keyof Stats, value: number) => {
        setLocalStats(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = () => {
        onSave(localStats);
        onClose();
    };

    const sliders = [
        { key: 'sleep', label: 'Sleep Quality', min: 'Poor', max: 'Excellent' },
        { key: 'focus', label: 'Mental Focus', min: 'Distracted', max: 'Focused' },
        { key: 'social', label: 'Social Connection', min: 'Isolated', max: 'Connected' },
        { key: 'stress', label: 'Stress Control', min: 'Overwhelmed', max: 'Calm' },
        { key: 'anxiety', label: 'Anxiety Level', min: 'Calm', max: 'High' },
        { key: 'depression', label: 'Depression Level', min: 'Happy', max: 'Low' },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto p-6 animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-serif font-bold text-text">Daily Assessment</h2>
                    <button onClick={onClose} className="text-muted hover:text-text transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="space-y-6">
                    {sliders.map(({ key, label, min, max }) => (
                        <div key={key}>
                            <div className="flex justify-between mb-2">
                                <label className="text-sm font-medium text-text">{label}</label>
                                <span className="text-sm font-bold text-primary">{localStats[key as keyof Stats]}%</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={localStats[key as keyof Stats]}
                                onChange={(e) => handleChange(key as keyof Stats, Number(e.target.value))}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                            />
                            <div className="flex justify-between mt-1">
                                <span className="text-xs text-muted">{min}</span>
                                <span className="text-xs text-muted">{max}</span>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-8 flex gap-3">
                    <Button variant="outline" onClick={onClose} className="flex-1">
                        Cancel
                    </Button>
                    <Button onClick={handleSave} className="flex-1">
                        Update Garden
                    </Button>
                </div>
            </Card>
        </div>
    );
}
