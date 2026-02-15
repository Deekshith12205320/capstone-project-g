import { Card } from '../ui/Card';
import { cn } from '../../lib/utils';
import { Activity } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useAmbience } from '../../context/AmbienceContext';
import type { AssessmentResult } from '../../services/api';

interface MoodFlowProps {
    assessments?: AssessmentResult[];
}

export default function MoodFlow({ assessments = [] }: MoodFlowProps) {
    // Default filter state
    const [view, setView] = useState<'days' | 'weeks'>('days');

    // Process data based on view
    const chartData = useMemo(() => {
        if (!assessments.length) return [];

        // Sort by date old -> new
        const sorted = [...assessments].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

        if (view === 'days') {
            // Last 7 Entries (assuming 1 per day roughly, or just last 7 data points)
            return sorted.slice(-7);
        } else {
            // Mock "Weeks" logic: Take last 7 weeks (approx every 7th entry or just sample)
            // For now, if we don't have enough data, we just show what we have but spaced out
            // In real app, we would group by week.
            return sorted.filter((_, i) => i % 5 === 0).slice(-7); // Mock weekly sampling
        }
    }, [assessments, view]);

    const dataPoints = chartData.map(a => a.score || 50); // Fallback score
    const hasData = dataPoints.length > 0;

    // SVG Chart Dimensions
    const width = 600;
    const height = 180;
    const padding = 30;
    const effectiveWidth = width - padding * 2;
    const effectiveHeight = height - padding * 2;

    // Generate Worm Graph Path (Straight lines connecting dots, Cricket style)
    const getPath = (points: number[]) => {
        if (points.length < 1) return { line: '', area: '', coords: [] };

        const spacing = points.length > 1 ? effectiveWidth / (points.length - 1) : effectiveWidth;

        const coords = points.map((score, i) => {
            const x = padding + i * spacing;
            // 0 at bottom, 100 at top
            const y = height - padding - ((score / 100) * effectiveHeight);
            return { x, y };
        });

        const line = coords.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x},${p.y}`).join(' ');

        // Area slightly fading below? Or just line. User said "Cricket score comparison graph". Usually just a line, maybe filled.
        const area = `${line} L ${coords[coords.length - 1].x},${height - padding} L ${coords[0].x},${height - padding} Z`;

        return { line, area, coords };
    };

    const { line, area, coords } = useMemo(() => getPath(dataPoints), [dataPoints]);

    const { theme } = useAmbience();
    const themeClass = theme === 'green' ? 'bg-emerald-50/60 border-4 border-emerald-200 backdrop-blur-md' :
        theme === 'lavender' ? 'bg-purple-50/60 border-4 border-purple-200 backdrop-blur-md' :
            'bg-rose-50/60 border-4 border-rose-200 backdrop-blur-md';

    return (
        <Card className={cn("p-6 h-[22rem] flex flex-col transition-colors duration-500", themeClass)}>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="font-serif font-bold text-lg text-text">Mood Flow</h3>
                    <p className="text-xs text-muted">Recent Overs (History)</p>
                </div>

                <div className="flex bg-gray-100 p-1 rounded-xl">
                    <button
                        onClick={() => setView('days')}
                        className={cn(
                            "px-4 py-1.5 text-xs font-semibold rounded-lg transition-all",
                            view === 'days' ? "bg-white text-primary shadow-sm" : "text-muted hover:text-text"
                        )}
                    >
                        Days
                    </button>
                    <button
                        onClick={() => setView('weeks')}
                        className={cn(
                            "px-4 py-1.5 text-xs font-semibold rounded-lg transition-all",
                            view === 'weeks' ? "bg-white text-primary shadow-sm" : "text-muted hover:text-text"
                        )}
                    >
                        Weeks
                    </button>
                </div>
            </div>

            {hasData ? (
                <div className="flex-1 w-full relative overflow-visible">
                    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible" preserveAspectRatio="none">
                        <defs>
                            <linearGradient id="wormGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#4ADE80" stopOpacity="0.3" />
                                <stop offset="100%" stopColor="#4ADE80" stopOpacity="0" />
                            </linearGradient>
                        </defs>

                        {/* Grid Lines */}
                        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#e5e7eb" strokeWidth="1" />
                        <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4 4" />
                        <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4 4" />

                        {/* Area */}
                        <path d={area} fill="url(#wormGradient)" />

                        {/* Line (Worm) */}
                        <path d={line} fill="none" stroke="#16a34a" strokeWidth="3" strokeLinejoin="round" />

                        {/* Dots (Wickets/Runs style) */}
                        {coords?.map((p, i) => (
                            <g key={i} className="group cursor-pointer">
                                <circle cx={p.x} cy={p.y} r="5" className="fill-white stroke-green-600 stroke-2 hover:scale-125 transition-transform" />
                                {/* Tooltip on hover */}
                                <title>Score: {dataPoints[i]}</title>
                            </g>
                        ))}
                    </svg>

                    {/* X-Axis Labels */}
                    <div className="flex justify-between mt-[-20px] px-8 text-[10px] text-muted font-medium">
                        {chartData.map((_, i) => (
                            <span key={i} className="text-center w-4">{view === 'days' ? `D${i + 1}` : `W${i + 1}`}</span>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center border-2 border-dashed border-gray-100 rounded-2xl bg-gray-50/50 mx-4 mb-4">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-3">
                        <Activity size={20} className="text-muted" />
                    </div>
                    <p className="text-sm font-medium text-text">No mood data yet</p>
                    <p className="text-xs text-muted max-w-[200px] mt-1">
                        Start tracking to build your graph.
                    </p>
                </div>
            )}
        </Card>
    );
}
