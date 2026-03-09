import { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Wind, Activity, Play, Eye, ShieldCheck } from 'lucide-react';
import { fetchAssessments } from '../services/api';
import { useAmbience } from '../context/AmbienceContext';

interface YogaPrescription {
    id: number | string;
    name: string;
    sanskritName: string;
    duration: string;
    benefits: string;
    focus: string;
    windowOfTolerance: string;
    description?: string;
    imgUrl?: string;
}

// 5 Exercise names per Mood State to fetch from API
const POOL_NAMES: Record<'Anxious' | 'Lethargic' | 'Balanced', string[]> = {
    Anxious: ["Child's Pose", "Corpse", "Bridge", "Cat", "Cow"],
    Lethargic: ["Warrior One", "Warrior Two", "Plank", "Upward-Facing Dog", "Chair"],
    Balanced: ["Tree", "Downward-Facing Dog", "Half-Moon", "Crow", "Boat"]
};

const SOMATIC_PROTOCOLS: Record<string, { title: string; protocol: string }> = {
    head: { title: 'Cranial / Jaw Tension', protocol: 'Gently massage the masseter muscles. Practice 3-part breath to release cranial pressure. Soften the gaze.' },
    chest: { title: 'Thoracic Constriction', protocol: 'Place one hand on heart, one on belly. Focus on expanding the belly to move out of shallow, sympathetic chest-breathing.' },
    stomach: { title: 'Enteric Nervous System Upset', protocol: 'Gentle supine twists. Focus on long, slow exhales to stimulate the vagus nerve and promote digestion.' },
    hips: { title: 'Psoas / Iliacus Gripping', protocol: 'Supported bridge pose. Allow the deep "fight or flight" muscles of the pelvic bowl to passively release.' }
};

export default function Yoga() {
    const { theme } = useAmbience(); // Restored Ambience context

    // --- State: Environmental ---
    const [isNightMode, setIsNightMode] = useState(false);

    // --- State: SOS Crisis ---
    const [sosMode, setSosMode] = useState(false);
    const [sosStep, setSosStep] = useState(5);

    // --- State: Assessment & Protocols ---
    const [userMood, setUserMood] = useState<'Anxious' | 'Lethargic' | 'Balanced'>('Balanced');
    const [dailyScore, setDailyScore] = useState<number | null>(null);
    const [prescriptions, setPrescriptions] = useState<YogaPrescription[]>([]);
    const [activePrescription, setActivePrescription] = useState<YogaPrescription | null>(null);

    // --- State: Somatic Map ---
    const [activeZone, setActiveZone] = useState<string | null>(null);

    // --- State: VNS Pacer ---
    const [vnsActive, setVnsActive] = useState(false);
    const [vnsPhase, setVnsPhase] = useState<'inhale' | 'exhale' | 'hold'>('hold');

    // --- State: Interoceptive Reflection ---
    const [reflection, setReflection] = useState('');

    // --- State: Video Overlay Practice ---
    const [guidedPracticeActive, setGuidedPracticeActive] = useState(false);


    // --- Effects ---

    // Fetch Assessment logic and Yoga API data
    useEffect(() => {
        const loadData = async () => {
            try {
                // 1. Fetch Yoga API Poses
                const posesResponse = await fetch('https://yoga-api-nzy4.onrender.com/v1/poses');
                const posesData = await posesResponse.json();

                // 2. Fetch Assessments
                const assessData = await fetchAssessments();
                let derivedMood: 'Anxious' | 'Lethargic' | 'Balanced' = 'Balanced';

                if (assessData.length > 0) {
                    const sorted = [...assessData].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
                    const latest = sorted.find(a => a.type === 'daily');

                    if (latest) {
                        const score = latest.score || 50;
                        setDailyScore(score);

                        if (score <= 40) derivedMood = 'Anxious';
                        else if (score > 40 && score <= 70) derivedMood = 'Lethargic';
                    }
                }

                setUserMood(derivedMood);

                // 3. Map API data to our format for the chosen mood
                const targetPoseNames = POOL_NAMES[derivedMood];
                const wot = derivedMood === 'Anxious' ? 'Hyper-arousal' : derivedMood === 'Lethargic' ? 'Hypo-arousal' : 'Optimal Zone';

                const mappedPoses = posesData
                    .filter((p: any) => targetPoseNames.includes(p.english_name))
                    .map((p: any) => ({
                        id: p.id,
                        name: p.english_name,
                        sanskritName: p.sanskrit_name,
                        duration: 'Hold for 1-2 mins', // API doesn't provide duration
                        benefits: p.pose_benefits || 'Promotes general physical and mental well-being.',
                        focus: derivedMood === 'Anxious' ? 'Grounding' : 'Energizing',
                        windowOfTolerance: wot,
                        description: p.pose_description,
                        imgUrl: p.url_svg_alt || p.url_png // prefer alternative SVGs usually better quality
                    }));

                // Shuffle and pick 3
                const shuffled = mappedPoses.sort(() => 0.5 - Math.random()).slice(0, 3);

                setPrescriptions(shuffled);
                setActivePrescription(shuffled[0]);

            } catch (e) {
                console.error("Could not load assessments or yoga data", e);
            }
        };
        loadData();
    }, []);

    // Circadian Rhythm (Check local time)
    useEffect(() => {
        const hour = new Date().getHours();
        if (hour >= 20 || hour <= 5) { // 8 PM to 5 AM
            setIsNightMode(true);
        }
    }, []);

    // VNS Breathing Pacer (5.5s inhale, 5.5s exhale for Coherent Breathing)
    useEffect(() => {
        let timer: ReturnType<typeof setTimeout>;
        if (vnsActive) {
            const runCycle = (phase: 'inhale' | 'exhale') => {
                setVnsPhase(phase);
                timer = setTimeout(() => {
                    runCycle(phase === 'inhale' ? 'exhale' : 'inhale');
                }, 5500); // 5.5 seconds
            };
            runCycle('inhale');
        } else {
            setVnsPhase('hold');
        }
        return () => clearTimeout(timer);
    }, [vnsActive]);

    // SOS Grounding Timer
    useEffect(() => {
        let timer: ReturnType<typeof setInterval>;
        if (sosMode && sosStep > 0) {
            timer = setInterval(() => {
                setSosStep(p => p - 1);
            }, 5000); // 5 seconds per sense
        } else if (sosMode && sosStep === 0) {
            // End of exercise
        }
        return () => clearInterval(timer);
    }, [sosMode, sosStep]);


    // --- Handlers ---
    const triggerSOS = () => {
        setSosMode(true);
        setSosStep(5);
        setVnsActive(false); // Kill other active things
        setGuidedPracticeActive(false);
        // In a real app, also mute all HTML5 audio/video elements globally here
    };

    const getGroundingText = (step: number) => {
        switch (step) {
            case 5: return "Acknowledge 5 things you can SEE around you.";
            case 4: return "Acknowledge 4 things you can TOUCH around you.";
            case 3: return "Acknowledge 3 things you can HEAR around you.";
            case 2: return "Acknowledge 2 things you can SMELL around you.";
            case 1: return "Acknowledge 1 thing you can TASTE around you.";
            default: return "You are here. You are safe. You are grounded.";
        }
    };

    // --- Render Helpers ---

    // Clinical Zen Colors honoring standard app themes
    const palette = isNightMode
        ? { bg: 'bg-[#2d2a26]', text: 'text-[#e6ceb3]', card: 'bg-[#3b3631]', accent: 'bg-[#b67a42]', border: 'border-[#4a443e]', highlight: 'text-[#ffb86c]' }
        : {
            bg: theme === 'green' ? 'bg-[#ecfdf5]' : theme === 'lavender' ? 'bg-[#f5f3ff]' : 'bg-[#fff1f2]',
            text: 'text-[#334155]',
            card: 'bg-white/80 backdrop-blur-md',
            accent: theme === 'green' ? 'bg-[#10b981]' : theme === 'lavender' ? 'bg-[#8b5cf6]' : 'bg-[#f43f5e]',
            border: theme === 'green' ? 'border-emerald-200' : theme === 'lavender' ? 'border-violet-200' : 'border-rose-200',
            highlight: theme === 'green' ? 'text-emerald-600' : theme === 'lavender' ? 'text-violet-600' : 'text-rose-600'
        };

    // --- Modal Renders ---
    if (sosMode) {
        return (
            <div className="fixed inset-0 z-50 bg-[#1e293b] flex flex-col items-center justify-center p-6 text-white text-center">
                <div className="max-w-2xl w-full">
                    <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse">
                        <ShieldCheck size={48} className="text-[#94a3b8]" />
                    </div>
                    <h1 className="text-4xl font-serif mb-4">Grounding Protocol</h1>
                    <p className="text-2xl font-light text-[#cbd5e1] mb-12 min-h-[80px]">
                        {getGroundingText(sosStep)}
                    </p>

                    {sosStep === 0 && (
                        <Button onClick={() => setSosMode(false)} variant="outline" className="border-white/20 text-white hover:bg-white/10 rounded-full px-8 py-6">
                            Return to Practice
                        </Button>
                    )}

                    {sosStep > 0 && (
                        <div className="flex justify-center gap-2 mt-8">
                            {[5, 4, 3, 2, 1].map(n => (
                                <div key={n} className={`w-3 h-3 rounded-full transition-colors duration-500 ${sosStep <= n ? 'bg-white' : 'bg-white/20'}`} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    if (guidedPracticeActive) {
        return (
            <div className={`fixed inset-0 z-50 ${palette.bg} ${palette.text} flex flex-col`}>
                <div className="p-6 flex justify-between items-center bg-black/5">
                    <h2 className="font-serif font-bold text-lg">Guided Practice: {activePrescription?.name}</h2>
                    <Button onClick={() => setGuidedPracticeActive(false)} variant="ghost" className="rounded-full">Close</Button>
                </div>

                <div className="flex-1 overflow-y-auto relative bg-[#e2e8f0] flex flex-col p-8">
                    {/* Yoga API Content Area */}
                    <div className="max-w-3xl mx-auto w-full flex-1 flex flex-col items-center bg-white shadow-xl rounded-3xl p-10 mt-6 mb-6">

                        {activePrescription?.imgUrl ? (
                            <div className="w-full flex justify-center mb-10 h-[300px]">
                                <img
                                    src={activePrescription.imgUrl}
                                    alt={activePrescription.name}
                                    className="h-full object-contain"
                                    style={{ mixBlendMode: 'multiply' }}
                                />
                            </div>
                        ) : (
                            <div className="text-center opacity-50 text-gray-800 mb-10">
                                <Eye size={48} className="mx-auto mb-4" />
                                <p className="font-serif italic">Loading Visuals...</p>
                            </div>
                        )}

                        <div className="text-center w-full pb-10">
                            <h3 className="font-bold uppercase tracking-widest text-[#849b87] text-sm mb-4">How To Perform</h3>
                            <p className="text-gray-700 leading-relaxed font-medium">
                                {activePrescription?.description || "Breathe deeply and gently hold the position."}
                            </p>
                        </div>
                    </div>

                    {/* Proprioceptive Video Overlay (CBT Reframing Prompt) */}
                    <div className="sticky bottom-4 mx-auto max-w-lg w-full">
                        <div className="bg-white border-2 border-[#849b87]/30 text-gray-800 p-6 rounded-2xl text-center shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-700">
                            "I invite you to observe any tension in your muscles. You might choose to simply notice it without judgment."
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // --- Main Dashboard ---

    return (
        <div className={`min-h-screen p-8 transition-colors duration-1000 relative ${palette.bg} ${palette.text} font-sans`}>

            {/* Circadian Overlay indication */}
            {isNightMode && (
                <div className="absolute top-0 left-0 w-full h-full bg-amber-900/5 pointer-events-none mix-blend-multiply z-10" />
            )}

            <div className="max-w-7xl mx-auto relative z-20">

                {/* Header & SOS */}
                <header className="flex justify-between items-start mb-10">
                    <div>
                        <h1 className="text-3xl font-serif font-bold mb-2">
                            Clinical Practice Space
                        </h1>
                        <p className="text-sm opacity-70 flex items-center gap-2">
                            {isNightMode ? 'Sleep Hygiene Mode Active (Low Blue-Light)' : 'Regulating your nervous system'}
                        </p>
                    </div>

                    <Button
                        onClick={triggerSOS}
                        className="bg-red-900 text-white hover:bg-red-800 rounded-full px-6 py-2 shadow-sm font-bold tracking-wide border-2 border-red-950/20"
                    >
                        SOS COOL DOWN
                    </Button>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                    {/* Left Column: Diagnostics & Map */}
                    <div className="lg:col-span-5 space-y-6">

                        {/* Somatic Map (Seated Yoga Pose) */}
                        <Card className={`p-6 rounded-3xl border shadow-sm ${palette.card} ${palette.border} relative overflow-hidden h-full min-h-[400px]`}>
                            <div className="flex items-center gap-3 mb-6">
                                <Activity size={20} className={palette.highlight} />
                                <h2 className="font-bold text-sm tracking-wide uppercase">Somatic Tension Map</h2>
                            </div>

                            <div className="flex flex-col items-center justify-center p-4 bg-black/5 rounded-2xl mb-4 relative min-h-[300px]">

                                {/* User Uploaded Seated Silhouette Image */}
                                <div className="relative w-full max-w-[200px] aspect-[3/4] mx-auto">
                                    <img
                                        src="/seated-yoga-silhouette.png"
                                        alt="Seated Yoga Silhouette"
                                        className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                                        style={{
                                            mixBlendMode: isNightMode ? 'screen' : 'multiply',
                                            filter: isNightMode ? 'invert(1) opacity(0.7)' : 'opacity(0.8)'
                                        }}
                                    />

                                    {/* Hitboxes Overlay mapping to the physical image */}
                                    {/* Head */}
                                    <div
                                        className={`absolute left-1/2 -translate-x-1/2 cursor-pointer transition-all ${activeZone === 'head' ? 'bg-[#849b87]/80 scale-125 shadow-[0_0_15px_rgba(132,155,135,0.8)]' : 'hover:bg-[#849b87]/50 bg-transparent'}`}
                                        style={{ top: '8%', width: '15%', height: '12%', borderRadius: '50%' }}
                                        onClick={() => setActiveZone('head')}
                                    />
                                    {/* Chest */}
                                    <div
                                        className={`absolute left-1/2 -translate-x-1/2 cursor-pointer transition-all ${activeZone === 'chest' ? 'bg-[#849b87]/80 scale-125 shadow-[0_0_15px_rgba(132,155,135,0.8)]' : 'hover:bg-[#849b87]/50 bg-transparent'}`}
                                        style={{ top: '32%', width: '22%', height: '15%', borderRadius: '50%' }}
                                        onClick={() => setActiveZone('chest')}
                                    />
                                    {/* Stomach */}
                                    <div
                                        className={`absolute left-1/2 -translate-x-1/2 cursor-pointer transition-all ${activeZone === 'stomach' ? 'bg-[#849b87]/80 scale-125 shadow-[0_0_15px_rgba(132,155,135,0.8)]' : 'hover:bg-[#849b87]/50 bg-transparent'}`}
                                        style={{ top: '55%', width: '25%', height: '15%', borderRadius: '50%' }}
                                        onClick={() => setActiveZone('stomach')}
                                    />
                                    {/* Hips */}
                                    <div
                                        className={`absolute left-1/2 -translate-x-1/2 cursor-pointer transition-all ${activeZone === 'hips' ? 'bg-[#849b87]/80 scale-125 shadow-[0_0_15px_rgba(132,155,135,0.8)]' : 'hover:bg-[#849b87]/50 bg-transparent'}`}
                                        style={{ top: '80%', width: '45%', height: '12%', borderRadius: '50%' }}
                                        onClick={() => setActiveZone('hips')}
                                    />
                                </div>

                                <div className="absolute top-2 right-2 flex flex-col gap-1">
                                    {['head', 'chest', 'stomach', 'hips'].map(z => (
                                        <div key={z} className="flex items-center gap-1">
                                            <div className={`w-2 h-2 rounded-full ${activeZone === z ? 'bg-[#849b87]' : 'bg-gray-300'}`} />
                                            <span className="text-[9px] uppercase tracking-wider opacity-60">{z}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {activeZone ? (
                                <div className="p-4 bg-black/5 rounded-xl animate-in fade-in duration-300">
                                    <h4 className="font-bold text-xs mb-1 uppercase tracking-wider">{SOMATIC_PROTOCOLS[activeZone].title}</h4>
                                    <p className="text-sm opacity-80 leading-relaxed font-medium">{SOMATIC_PROTOCOLS[activeZone].protocol}</p>
                                </div>
                            ) : (
                                <p className="text-xs text-center opacity-50 italic mt-8">Identify an area of physical tension.</p>
                            )}
                        </Card>

                    </div>


                    {/* Middle Column: Active Practice & Pacer */}
                    <div className="lg:col-span-7 space-y-6">

                        {/* Targeted Prescription Based on Assessment */}
                        <Card className={`p-8 rounded-3xl border shadow-sm relative overflow-hidden ${palette.card} ${palette.border}`}>
                            <div className="mb-4 flex items-center justify-between">
                                <div>
                                    <h3 className="text-xs uppercase tracking-widest opacity-60 font-bold mb-1">Targeted Protocol</h3>
                                    {dailyScore !== null ? (
                                        <p className="text-[10px] font-mono opacity-80 mb-6 border-b border-black/10 pb-2 inline-block">
                                            Triggered by latest check-in score ({dailyScore}/100) → {userMood} State
                                        </p>
                                    ) : (
                                        <p className="text-[10px] font-mono opacity-80 mb-6 border-b border-black/10 pb-2 inline-block">
                                            No assessment today → Loading default Balanced protocol
                                        </p>
                                    )}
                                </div>
                                <span className={`text-[10px] uppercase font-bold tracking-widest border border-black/20 px-3 py-1 rounded-full ${userMood === 'Anxious' ? 'text-red-700 bg-red-50' : userMood === 'Lethargic' ? 'text-orange-700 bg-orange-50' : 'text-emerald-700 bg-emerald-50'}`}>
                                    {activePrescription?.windowOfTolerance}
                                </span>
                            </div>

                            <div className="space-y-4 mb-8">
                                {prescriptions.map((p) => (
                                    <div
                                        key={p.id}
                                        onClick={() => setActivePrescription(p)}
                                        className={`p-5 rounded-2xl cursor-pointer border transition-all ${activePrescription?.id === p.id ? `${palette.accent} text-white shadow-md transform scale-[1.02]` : `bg-white/50 hover:bg-white/80 ${palette.border} opacity-80 hover:opacity-100`}`}
                                    >
                                        <div className="flex justify-between items-start mb-1">
                                            <h2 className="text-xl font-serif font-bold">{p.name}</h2>
                                            <span className="text-xs font-mono font-bold tracking-widest uppercase opacity-80 border border-current px-2 py-0.5 rounded-full">{p.duration.split(' ')[0]} {p.duration.split(' ')[1]}</span>
                                        </div>
                                        <p className="font-serif italic text-sm opacity-80 mb-3">{p.sanskritName}</p>
                                        <p className="text-xs font-medium leading-relaxed opacity-90">{p.benefits}</p>
                                    </div>
                                ))}
                            </div>

                            <Button
                                onClick={() => setGuidedPracticeActive(true)}
                                disabled={!activePrescription}
                                className={`w-full ${palette.accent} text-white hover:opacity-90 rounded-2xl py-6 font-bold tracking-wide transition-transform hover:scale-[1.01] disabled:opacity-50`}
                            >
                                <Play size={18} fill="currentColor" className="mr-2" /> Start Guided Practice
                            </Button>
                        </Card>

                        {/* Pacer & Reflection Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            {/* VNS Breathing Pacer */}
                            <Card className={`p-8 rounded-3xl border shadow-sm text-center ${palette.card} ${palette.border}`}>
                                <div className="flex items-center justify-center gap-2 mb-8">
                                    <Wind size={20} className={palette.highlight} />
                                    <h3 className="text-sm font-bold tracking-wider uppercase">VNS Breathing Pacer</h3>
                                </div>

                                <div className="relative w-40 h-40 mx-auto mb-8 flex items-center justify-center">
                                    <div
                                        className={`absolute rounded-full border-2 ${palette.border} transition-all ease-in-out`}
                                        style={{
                                            width: vnsPhase === 'inhale' ? '100%' : vnsPhase === 'exhale' ? '30%' : '60%',
                                            height: vnsPhase === 'inhale' ? '100%' : vnsPhase === 'exhale' ? '30%' : '60%',
                                            transitionDuration: '5.5s'
                                        }}
                                    />
                                    <div
                                        className={`absolute rounded-full ${palette.accent} opacity-20 transition-all ease-in-out`}
                                        style={{
                                            width: vnsPhase === 'inhale' ? '90%' : vnsPhase === 'exhale' ? '25%' : '50%',
                                            height: vnsPhase === 'inhale' ? '90%' : vnsPhase === 'exhale' ? '25%' : '50%',
                                            transitionDuration: '5.5s'
                                        }}
                                    />
                                    <span className={`relative z-10 font-serif italic text-lg ${vnsActive ? 'opacity-100' : 'opacity-40'} transition-opacity`}>
                                        {vnsPhase === 'inhale' ? 'Inhale 5.5s' : vnsPhase === 'exhale' ? 'Exhale 5.5s' : 'Ready'}
                                    </span>
                                </div>

                                <Button
                                    onClick={() => setVnsActive(!vnsActive)}
                                    variant="outline"
                                    className={`rounded-xl px-8 border-2 ${palette.border} hover:bg-black/5 w-full`}
                                >
                                    {vnsActive ? 'Stop Pacer' : 'Begin Coherent Breathing'}
                                </Button>
                            </Card>

                            {/* Interoceptive Reflection */}
                            <Card className={`p-8 rounded-3xl border shadow-sm flex flex-col ${palette.card} ${palette.border}`}>
                                <h3 className="font-bold text-sm tracking-wide uppercase mb-2">Clinical Journal</h3>
                                <p className="text-xs opacity-70 font-medium mb-4 italic">
                                    "Where in your body did you feel the most space today?"
                                </p>

                                <textarea
                                    value={reflection}
                                    onChange={(e) => setReflection(e.target.value)}
                                    placeholder="I noticed a release in my upper back..."
                                    className={`flex-1 min-h-[120px] w-full p-4 rounded-xl border resize-none focus:outline-none focus:ring-1 focus:ring-[#849b87] bg-black/5 text-sm ${palette.border} opacity-80`}
                                />

                                <div className="mt-4 text-right">
                                    <Button size="sm" variant="outline" className={`text-xs font-bold border-2 ${palette.border} hover:bg-black/5`}>
                                        Save Record
                                    </Button>
                                </div>
                            </Card>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
}
