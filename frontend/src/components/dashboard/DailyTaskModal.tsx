import { useState, useEffect } from 'react';
import { X, CheckCircle2, Activity } from 'lucide-react';

const TASKS = [
    { title: "Box Breathing", desc: "Inhale for 4 seconds, hold for 4, exhale for 4, hold for 4. Repeat 4 times.", type: "breathing" },
    { title: "Deep Belly Breaths", desc: "Place a hand on your stomach. Take 10 slow, deep breaths, feeling your stomach rise and fall.", type: "breathing" },
    { title: "Neck Stretches", desc: "Gently tilt your head to the left, holding for 30s. Switch to the right for 30s.", type: "physical" },
    { title: "Jumping Jacks", desc: "Get your heart rate up with 15 quick jumping jacks to shake off lethargy.", type: "physical" },
    { title: "Child's Pose", desc: "Kneel, sit on your heels, and stretch your arms forward on the floor. Hold for 2 minutes.", type: "physical" },
    { title: "Shoulder Rolls", desc: "Release neck and back tension with 10 slow forward shoulder rolls, then 10 backward.", type: "physical" },
    { title: "Standing Forward Fold", desc: "Stand up, hinge at the hips, and let your head hang heavy toward the floor for 1 minute.", type: "physical" },
    { title: "Alternate Nostril Breathing", desc: "Close off one nostril, inhale through the other. Switch and exhale. Repeat for 5 cycles.", type: "breathing" },
    { title: "High Knees", desc: "Stand up and jog in place, bringing your knees up high, for 30 seconds straight.", type: "physical" },
    { title: "Cat-Cow Stretches", desc: "On hands and knees, arch your back up (Cat), then dip your belly down (Cow). Do 10 rounds.", type: "physical" }
];

export default function DailyTaskModal() {
    const [isVisible, setIsVisible] = useState(false);
    const [task, setTask] = useState<(typeof TASKS)[0] | null>(null);

    useEffect(() => {
        const checkDailyTask = () => {
            const today = new Date().toDateString();
            const lastCompleted = localStorage.getItem('vista_last_daily_task_date');

            if (lastCompleted !== today) {
                // Select a random task
                const randomTask = TASKS[Math.floor(Math.random() * TASKS.length)];
                setTask(randomTask);
                // Slight delay so the dashboard loads first before popping up
                setTimeout(() => setIsVisible(true), 1500);
            }
        };
        checkDailyTask();
    }, []);

    const markCompletedOrDismissed = () => {
        const today = new Date().toDateString();
        localStorage.setItem('vista_last_daily_task_date', today);
        setIsVisible(false);
    };

    if (!isVisible || !task) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-500">
            <div className="bg-white/90 backdrop-blur-xl w-full max-w-md rounded-3xl shadow-2xl border border-white p-8 relative transform transition-all">

                {/* Close Button */}
                <button
                    onClick={markCompletedOrDismissed}
                    className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-800 hover:bg-black/5 rounded-full transition-colors"
                    title="Dismiss for today"
                >
                    <X size={20} />
                </button>

                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center border-4 border-white shadow-sm">
                        <Activity size={32} className="text-emerald-600" />
                    </div>
                </div>

                <div className="text-center mb-8">
                    <h2 className="text-xs font-bold tracking-widest uppercase text-emerald-600 mb-2">Daily Challenge</h2>
                    <h3 className="text-2xl font-serif font-bold text-gray-900 mb-4">{task.title}</h3>
                    <p className="text-gray-600 leading-relaxed font-medium">
                        {task.desc}
                    </p>
                </div>

                <button
                    onClick={markCompletedOrDismissed}
                    className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl transition-all hover:scale-[1.02] shadow-lg shadow-emerald-600/20"
                >
                    <CheckCircle2 size={20} />
                    I Completed This
                </button>
            </div>
        </div>
    );
}
