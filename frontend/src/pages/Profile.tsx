import { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Settings, Save, Heart, ThumbsUp, ThumbsDown, UserCircle, MapPin } from 'lucide-react';
import { fetchUserProfile, updateUserProfile, type UserProfile } from '../services/api';

import { useAmbience } from '../context/AmbienceContext';
import { cn } from '../lib/utils';

export default function Profile() {
    const { theme } = useAmbience();
    const themeClass = theme === 'green' ? 'bg-emerald-50/60 border-4 border-emerald-200 backdrop-blur-md' :
        theme === 'lavender' ? 'bg-purple-50/60 border-4 border-purple-200 backdrop-blur-md' :
            'bg-rose-50/60 border-4 border-rose-200 backdrop-blur-md';

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [profile, setProfile] = useState<UserProfile>({
        id: 1,
        name: '',
        email: '',
        location: '',
        bio: '',
        role: '',
        hobbies: [],
        likes: [],
        dislikes: [],
        contact_name: '',
        contact_phone: ''
    });

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        setIsLoading(true);
        const data = await fetchUserProfile();
        setProfile(data);
        setIsLoading(false);
    };

    const handleSave = async () => {
        setIsSaving(true);
        const success = await updateUserProfile(profile);
        if (success) {
            // Optional: Show toast
            console.log('Profile saved');
        }
        setIsSaving(false);
    };

    const handleChange = (field: keyof UserProfile, value: any) => {
        setProfile(prev => ({ ...prev, [field]: value }));
    };

    // Helper to handle array inputs (comma separated)
    const handleArrayChange = (field: keyof UserProfile, value: string) => {
        // We'll store it as array in state, but input is text
        // For simpler UX, we can just store the raw string if we wanted, 
        // but here let's assume we split by newlines or commas for display later
        // or just keep it as array of strings
        // For this UI, let's treat the text area as "one item per line" or "comma separated"
        // Actually, let's keep it simple: the UI asks for writing boxes.
        // We will store as array of strings split by newline
        const items = value.split('\n').filter(i => i.trim());
        handleChange(field, items);
    };

    const getArrayString = (field: keyof UserProfile) => {
        const val = profile[field];
        if (Array.isArray(val)) return val.join('\n');
        return val as string || '';
    };

    if (isLoading) return <div className="p-8 flex justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <header className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-text mb-2">Personal Profile</h1>
                    <p className="text-muted">Customize your AI companion's understanding of you.</p>
                </div>
                <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-primary hover:bg-primary/90 text-white gap-2 shadow-lg shadow-primary/25 rounded-full px-8"
                >
                    {isSaving ? <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" /> : <Save size={18} />}
                    {isSaving ? 'Saving...' : 'Save Profile'}
                </Button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Identity Card */}
                <div className="lg:col-span-4 space-y-6">
                    <Card className={cn("p-8 flex flex-col items-center text-center border-0 shadow-xl shadow-gray-100/50 relative overflow-hidden transition-colors duration-500", themeClass)}>
                        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-primary/10 to-transparent" />

                        <div className="relative mb-6">
                            <div className="w-32 h-32 rounded-full bg-white p-1 shadow-2xl ring-4 ring-primary/5 relative z-10">
                                <div className="w-full h-full rounded-full bg-gradient-to-br from-orange-100 to-orange-50 flex items-center justify-center text-orange-500 font-serif font-bold text-4xl">
                                    {profile.name.charAt(0) || 'U'}
                                </div>
                            </div>
                            <button className="absolute bottom-1 right-1 bg-white p-2 rounded-full shadow-md text-gray-500 hover:text-primary transition-colors z-20 border border-gray-100">
                                <Settings size={16} />
                            </button>
                        </div>

                        <h2 className="text-2xl font-bold text-text mb-1">{profile.name || 'User'}</h2>
                        <p className="text-muted mb-6 flex items-center justify-center gap-1.5">
                            <MapPin size={14} />
                            {profile.location || 'Add Location'}
                        </p>

                        <div className="w-full p-4 bg-primary/5 rounded-2xl mb-6">
                            <p className="text-sm font-medium text-primary uppercase tracking-wider mb-2 text-[10px]">Mantra</p>
                            <p className="font-serif italic text-text/80 text-lg">"{profile.bio || 'Taking it one day at a time.'}"</p>
                        </div>

                        <div className="w-full grid grid-cols-2 gap-4 text-left">
                            <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                                <span className="text-xs text-muted block mb-1">Role</span>
                                <span className="font-bold text-sm text-text block truncate">{profile.role || 'N/A'}</span>
                            </div>
                            <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                                <span className="text-xs text-muted block mb-1">Member Since</span>
                                <span className="font-bold text-sm text-text block">Feb 2026</span>
                            </div>
                        </div>
                    </Card>

                    <Card className={cn("p-6 border-0 shadow-lg shadow-gray-100/50 transition-colors duration-500", themeClass)}>
                        <h3 className="font-bold text-text mb-4 text-sm uppercase tracking-wider flex items-center gap-2">
                            Safety Net
                        </h3>
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-muted ml-1">Emergency Contact Name</label>
                                <Input
                                    value={profile.contact_name}
                                    onChange={(e) => handleChange('contact_name', e.target.value)}
                                    className="bg-gray-50 border-gray-100 focus:bg-white transition-all"
                                    placeholder="e.g. Mom"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-muted ml-1">Phone Number</label>
                                <Input
                                    value={profile.contact_phone}
                                    onChange={(e) => handleChange('contact_phone', e.target.value)}
                                    className="bg-gray-50 border-gray-100 focus:bg-white transition-all"
                                    placeholder="+1 234..."
                                />
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Right Column: Edit Forms */}
                <div className="lg:col-span-8 space-y-6">
                    <Card className={cn("p-8 border-0 shadow-lg shadow-gray-100/50 transition-colors duration-500", themeClass)}>
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100/50">
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                <UserCircle size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-text">Personal Details</h3>
                                <p className="text-sm text-muted">Basic information about you.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-text ml-1">Full Name</label>
                                <Input
                                    value={profile.name}
                                    onChange={(e) => handleChange('name', e.target.value)}
                                    className="h-11"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-text ml-1">Email (Read Only)</label>
                                <Input value={profile.email} disabled className="h-11 bg-gray-50 text-muted" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-text ml-1">Location</label>
                                <Input
                                    value={profile.location}
                                    onChange={(e) => handleChange('location', e.target.value)}
                                    placeholder="e.g. Mumbai"
                                    className="h-11"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-text ml-1">Mantra (Bio)</label>
                                <Input
                                    value={profile.bio}
                                    onChange={(e) => handleChange('bio', e.target.value)}
                                    placeholder="Taking it one day at a time. 🌱"
                                    className="h-11"
                                />
                            </div>
                            <div className="md:col-span-2 space-y-1.5">
                                <label className="text-sm font-medium text-text ml-1">Role / Profession</label>
                                <Input
                                    value={profile.role}
                                    onChange={(e) => handleChange('role', e.target.value)}
                                    placeholder="e.g. Software Engineer, Artist, Student"
                                    className="h-11"
                                />
                            </div>
                        </div>
                    </Card>

                    <Card className={cn("p-8 border-0 shadow-lg shadow-gray-100/50 transition-colors duration-500", themeClass)}>
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100/50">
                            <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
                                <Heart size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-text">About You</h3>
                                <p className="text-sm text-muted">Help Aura understand your personality.</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-text ml-1 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary" /> Hobbies & Interests
                                </label>
                                <textarea
                                    value={getArrayString('hobbies')}
                                    onChange={(e) => handleArrayChange('hobbies', e.target.value)}
                                    className="w-full min-h-[100px] p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-y text-text placeholder:text-muted/50 bg-gray-50/30"
                                    placeholder="List your hobbies here (one per line)...&#10;e.g.&#10;Reading Sci-Fi&#10;Hiking&#10;Playing Guitar"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-text ml-1 flex items-center gap-2">
                                        <ThumbsUp size={14} className="text-green-600" /> Likes
                                    </label>
                                    <textarea
                                        value={getArrayString('likes')}
                                        onChange={(e) => handleArrayChange('likes', e.target.value)}
                                        className="w-full min-h-[100px] p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all resize-y text-text bg-green-50/10"
                                        placeholder="What makes you happy?&#10;Morning coffee&#10;Rainy days"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-text ml-1 flex items-center gap-2">
                                        <ThumbsDown size={14} className="text-red-600" /> Dislikes
                                    </label>
                                    <textarea
                                        value={getArrayString('dislikes')}
                                        onChange={(e) => handleArrayChange('dislikes', e.target.value)}
                                        className="w-full min-h-[100px] p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all resize-y text-text bg-red-50/10"
                                        placeholder="What do you avoid?&#10;Loud noises&#10;Crowded places"
                                    />
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div >
    );
}
