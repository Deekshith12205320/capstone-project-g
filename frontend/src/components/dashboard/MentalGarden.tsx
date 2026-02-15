import { useMemo } from 'react';
import { Card } from '../ui/Card';
import { Sprout } from 'lucide-react';
import { useAmbience } from '../../context/AmbienceContext';
import { cn } from '../../lib/utils';
import type { AssessmentResult } from '../../services/api';

interface MentalGardenProps {
    latestAssessment?: AssessmentResult | null;
}

export default function MentalGarden({ latestAssessment }: MentalGardenProps) {
    const { theme } = useAmbience();
    const hasData = !!latestAssessment;

    // Derived stats & Hierarchy for Sunburst
    const data = useMemo(() => {
        const base = latestAssessment?.score || 50;

        // Mock Sub-category values based on base score
        const stats = {
            sleep: Math.min(100, base * 1.2),
            energy: Math.min(100, base * 1.5),
            focus: Math.min(100, base * 0.9 + 20),
            calm: Math.min(100, base + 10),
            stress: Math.max(20, 100 - base), // Inverse
            social: Math.min(100, base * 1.1 + 10),
            resilience: Math.min(100, base * 1.3),
        };

        // Hierarchy
        return [
            {
                name: 'Physical',
                color: '#10b981', // Emerald
                value: (stats.sleep + stats.energy) / 2,
                children: [
                    { name: 'Sleep', value: stats.sleep, color: '#34d399' },
                    { name: 'Energy', value: stats.energy, color: '#6ee7b7' },
                ]
            },
            {
                name: 'Mental',
                color: '#8b5cf6', // Violet
                value: (stats.focus + stats.calm + stats.stress + stats.resilience) / 4,
                children: [
                    { name: 'Focus', value: stats.focus, color: '#a78bfa' },
                    { name: 'Calm', value: stats.calm, color: '#c4b5fd' },
                    { name: 'Has Stress', value: stats.stress, color: '#ddd6fe' }, // Label trick? Or just "Stress"
                ]
            },
            {
                name: 'Social',
                color: '#f59e0b', // Amber
                value: stats.social,
                children: [
                    { name: 'Social', value: stats.social, color: '#fbbf24' },
                ]
            }
        ];
    }, [latestAssessment]);

    // Sunburst Dimensions
    const size = 240; // Reduced from 320 to fit 22rem height
    const center = size / 2;
    const coreRadius = 40;
    const innerRingRadius = 70;
    const outerRingRadius = 100;

    // Pulse animation duration based on score (Lower score = Faster pulse/anxiety? Or Higher score = Stronger pulse?)
    // Let's do a gentle breathing pulse.
    const pulseDuration = '4s';

    // Helper to calc generic arc
    const createArc = (startAngle: number, endAngle: number, innerR: number, outerR: number) => {
        // Convert to radians
        const start = (startAngle - 90) * (Math.PI / 180);
        const end = (endAngle - 90) * (Math.PI / 180);

        const x1 = center + innerR * Math.cos(start);
        const y1 = center + innerR * Math.sin(start);
        const x2 = center + outerR * Math.cos(start);
        const y2 = center + outerR * Math.sin(start);
        const x3 = center + outerR * Math.cos(end);
        const y3 = center + outerR * Math.sin(end);
        const x4 = center + innerR * Math.cos(end);
        const y4 = center + innerR * Math.sin(end);

        // Large arc flag
        const largeArc = endAngle - startAngle > 180 ? 1 : 0;

        return `M${x1},${y1} L${x2},${y2} A${outerR},${outerR} 0 ${largeArc},1 ${x3},${y3} L${x4},${y4} A${innerR},${innerR} 0 ${largeArc},0 ${x1},${y1} Z`;
    };



    const themeClass = theme === 'green' ? 'bg-emerald-50/60 border-4 border-emerald-200 backdrop-blur-md' :
        theme === 'lavender' ? 'bg-purple-50/60 border-4 border-purple-200 backdrop-blur-md' :
            'bg-rose-50/60 border-4 border-rose-200 backdrop-blur-md';

    return (
        <Card className={cn(
            "p-6 relative overflow-hidden h-[22rem] flex flex-col items-center justify-between transition-colors duration-500",
            themeClass
        )}>
            <style>{`
                @keyframes pulse-ring {
                    0% { transform: scale(0.98); opacity: 0.8; }
                    50% { transform: scale(1.02); opacity: 1; }
                    100% { transform: scale(0.98); opacity: 0.8; }
                }
                .animate-pulse-slow {
                    animation: pulse-ring ${pulseDuration} ease-in-out infinite;
                    transform-origin: center;
                }
            `}</style>

            <div className="w-full flex justify-between items-start z-10 mb-2">
                <div>
                    <h3 className="font-serif font-bold text-xl text-text">Inner Strength</h3>
                    <p className="text-sm text-muted">Core Well-being & Balance</p>
                </div>
            </div>

            <div className="flex-1 flex items-center justify-center w-full relative">
                {hasData ? (
                    <div className="relative w-[320px] h-[320px] animate-in fade-in zoom-in duration-700">
                        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="animate-pulse-slow">
                            {/* Defs for soft gradients */}
                            <defs>
                                <radialGradient id="coreGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                                    <stop offset="0%" stopColor="#fff" stopOpacity="0.8" />
                                    <stop offset="100%" stopColor="#f3f4f6" stopOpacity="1" />
                                </radialGradient>
                                <filter id="glow">
                                    <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
                                    <feMerge>
                                        <feMergeNode in="coloredBlur" />
                                        <feMergeNode in="SourceGraphic" />
                                    </feMerge>
                                </filter>
                            </defs>

                            {/* CORE: Center Circle */}
                            <circle cx={center} cy={center} r={coreRadius} fill="url(#coreGradient)" stroke="#e5e7eb" strokeWidth="1" className="shadow-lg" />

                            {/* RINGS */}
                            {data.map((category, i) => {
                                // Calculate angle share based on equal weight for 3 main categories for symmetry, 
                                // or weighted by value? Let's do equal weight (120deg) for clean design, 
                                // fulfilling "Design: First ring divided into categories".
                                const anglePerCategory = 360 / data.length; // 120
                                const startAngle = i * anglePerCategory;
                                const endAngle = startAngle + anglePerCategory - 2; // -2 deg gap

                                // Start angle for children
                                let childStartAngle = startAngle;
                                const totalChildValue = category.children.length;
                                const anglePerChild = (anglePerCategory - 2) / totalChildValue;

                                // Generate Inner Ring Segment
                                const innerSegmentPath = createArc(startAngle, endAngle, coreRadius + 5, innerRingRadius);

                                // Generate Outer Ring Segments
                                const outerSegments = category.children.map((child, j) => {
                                    const cStart = childStartAngle + (j * anglePerChild);
                                    const cEnd = cStart + anglePerChild - 1; // -1 gap
                                    return {
                                        path: createArc(cStart, cEnd, innerRingRadius + 5, outerRingRadius),
                                        color: child.color,
                                        label: child.name,
                                        value: child.value
                                    };
                                });

                                return (
                                    <g key={category.name}>
                                        {/* Inner Ring: Category */}
                                        <path
                                            d={innerSegmentPath}
                                            fill={category.color}
                                            className="opacity-90 hover:opacity-100 transition-opacity cursor-pointer"
                                            filter="url(#glow)"
                                        >
                                            <title>{category.name}</title>
                                        </path>

                                        {/* Outer Ring: Sub-categories */}
                                        {outerSegments.map(child => (
                                            <path
                                                key={child.label}
                                                d={child.path}
                                                fill={child.color}
                                                className="opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
                                            >
                                                <title>{child.label}: {Math.round(child.value)}%</title>
                                            </path>
                                        ))}

                                        {/* Category Label (Approximate placement) */}
                                        {/* We won't place text on arc for simplicity in this iteration unless needed */}
                                    </g>
                                );
                            })}
                        </svg>

                        {/* Core Label Overlay */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="text-center z-20">
                                <span className="block text-2xl font-serif font-bold text-gray-700">{Math.round(latestAssessment?.score || 0)}</span>
                                <span className="block text-[8px] text-muted uppercase tracking-widest">Score</span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center p-8 animate-in fade-in duration-500 max-w-sm">
                        <div className={cn(
                            "w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 border-2 shadow-sm transition-colors",
                            theme === 'green' ? 'bg-green-50 border-green-100 text-green-500'
                                : theme === 'lavender' ? 'bg-purple-50 border-purple-100 text-purple-500'
                                    : 'bg-rose-50 border-rose-100 text-rose-500'
                        )}>
                            <Sprout size={40} className="opacity-60" />
                        </div>
                        <h4 className="font-serif font-bold text-xl text-text mb-2">Core Well-being</h4>
                        <p className="text-sm text-muted leading-relaxed">
                            Take your first assessment to visualize your inner layers.
                        </p>
                    </div>
                )}
            </div>

            {hasData && (
                <div className="flex flex-wrap justify-center gap-4 mt-2">
                    {data.map(cat => (
                        <div key={cat.name} className="flex items-center gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                            <span className="text-xs font-medium text-text">{cat.name}</span>
                        </div>
                    ))}
                </div>
            )}
        </Card>
    );
}
