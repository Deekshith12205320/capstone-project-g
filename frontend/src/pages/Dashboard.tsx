import { useEffect, useState } from 'react';
import MoodFlow from '../components/dashboard/MoodFlow';
import JournalCard from '../components/dashboard/JournalCard';
import MoodSelector from '../components/dashboard/MoodSelector';
import MentalGarden from '../components/dashboard/MentalGarden';
import MentalFitnessQuests from '../components/games/MentalFitnessQuests';
import SpotifyPlayer from '../components/dashboard/SpotifyPlayer';
import { fetchAssessments, fetchUserProfile, type AssessmentResult } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
    const { user: authUser } = useAuth();
    const [displayName, setDisplayName] = useState(authUser?.name?.split(' ')[0] || 'User');
    const [assessments, setAssessments] = useState<AssessmentResult[]>([]);
    const [latestAssessment, setLatestAssessment] = useState<AssessmentResult | null>(null);

    useEffect(() => {
        const loadData = async () => {
            // Load Assessments
            const data = await fetchAssessments();
            setAssessments(data);
            if (data.length > 0) {
                const sorted = [...data].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
                setLatestAssessment(sorted[0]);
            }

            // Load Platform Profile to ensure name is up to date
            try {
                const profile = await fetchUserProfile();
                if (profile && profile.name) {
                    setDisplayName(profile.name.split(' ')[0]);
                }
            } catch (e) {
                console.error("Could not load profile", e);
            }
        };
        loadData();
    }, []);

    return (
        <div className="p-8">
            <header className="mb-8 flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-text mb-2 animate-in fade-in slide-in-from-left-4 duration-500">
                        Welcome back, {displayName}
                    </h1>
                    <p className="text-muted">Here's your daily overview.</p>
                </div>
            </header>

            <MoodSelector />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                {/* Left Column - Mood Chart */}
                <div className="lg:col-span-2">
                    <MoodFlow assessments={assessments} />
                </div>

                {/* Right Column - Stack */}
                <div className="flex flex-col gap-6">
                    <div className="flex-1">
                        <JournalCard />
                    </div>
                    <div className="flex-1">
                        <SpotifyPlayer />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <MentalGarden latestAssessment={latestAssessment} />
                <MentalFitnessQuests />
            </div>
        </div>
    );
}
