import { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useNavigate, Link } from 'react-router-dom';
import { Sprout } from 'lucide-react';
import { useAmbience } from '../context/AmbienceContext';
import { cn } from '../lib/utils';

import { useAuth } from '../context/AuthContext';

import { login as apiLogin, register as apiRegister, loginWithGoogle, loginWithGitHub } from '../services/api';

export default function Auth() {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');

    const navigate = useNavigate();
    const { theme, setTheme } = useAmbience();
    const { login } = useAuth();

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            if (isLogin) {
                const data = await apiLogin(formData.email, formData.password);
                login(data.token, data.user);
            } else {
                if (formData.password !== formData.confirmPassword) {
                    setError('Passwords do not match');
                    return;
                }
                if (!formData.name.trim()) {
                    setError('Please enter your full name');
                    return;
                }
                const data = await apiRegister(formData.name, formData.email, formData.password);
                login(data.token, data.user);
            }
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.message || 'Authentication failed');
        }
    };

    const handleGoogleLogin = async () => {
        try {
            // Check for client ID from environment
            const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

            if (clientId && typeof (window as any).google !== 'undefined' && (window as any).google.accounts) {
                // Initialize Google Sign-In
                const google = (window as any).google;

                google.accounts.id.initialize({
                    client_id: clientId,
                    callback: async (response: any) => {
                        try {
                            const data = await loginWithGoogle(response.credential);
                            login(data.token, data.user);
                            navigate('/dashboard');
                        } catch (err: any) {
                            setError(err.message || 'Google login failed');
                        }
                    }
                });

                // Prompt user to select account
                google.accounts.id.prompt((notification: any) => {
                    if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
                        // Fallback or error handling
                        console.log("Google One Tap skipped/not displayed");
                    }
                });

                return;
            } else if (!clientId) {
                console.warn("Missing VITE_GOOGLE_CLIENT_ID. Using simulation mode for demo.");
            }

            // For DEMO purposes: simulate a token exchange if no CLIENT_ID is present
            // This ensures the button works for the user even without setup
            if (!clientId) {
                const mockIdToken = "mock_google_token_" + Date.now();
                const data = await loginWithGoogle(mockIdToken);
                login(data.token, data.user);
                navigate('/dashboard');
            }
        } catch (err: any) {
            setError(err.message || 'Google login failed');
        }
    };

    const handleGithubLogin = async () => {
        try {
            const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID;

            if (clientId) {
                // Real GitHub OAuth Redirect
                window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=user:email`;
                return;
            } else {
                console.warn("Missing VITE_GITHUB_CLIENT_ID. Using simulation mode for demo.");
            }

            // For DEMO purposes: simulate a code exchange if no CLIENT_ID
            const mockCode = "mock_github_code_" + Date.now();
            const data = await loginWithGitHub(mockCode);
            login(data.token, data.user);
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.message || 'GitHub login failed');
        }
    };

    // Cinematic Background Styles based on theme
    // We use a pseudo-video effect with css gradients and animation
    const bgGradient = theme === 'green'
        ? 'from-emerald-900 via-green-800 to-emerald-950'
        : theme === 'lavender'
            ? 'from-purple-900 via-violet-800 to-indigo-950'
            : 'from-rose-900 via-pink-800 to-rose-950';

    const accentColor = theme === 'green' ? 'text-emerald-500' : theme === 'lavender' ? 'text-purple-500' : 'text-rose-500';
    const buttonClass = theme === 'green' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-900/20'
        : theme === 'lavender' ? 'bg-purple-600 hover:bg-purple-700 shadow-purple-900/20'
            : 'bg-rose-600 hover:bg-rose-700 shadow-rose-900/20';

    return (
        <div className={cn("min-h-screen flex items-center justify-center p-4 overflow-hidden relative transition-colors duration-1000 bg-gradient-to-br", bgGradient)}>

            {/* Animated Background Elements (Simulating Blurred Video) */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className={cn("absolute top-[-20%] left-[-10%] w-[80vw] h-[80vw] rounded-full mix-blend-overlay filter blur-[100px] opacity-40 animate-pulse",
                    theme === 'green' ? 'bg-green-400' : theme === 'lavender' ? 'bg-purple-400' : 'bg-pink-400'
                )} style={{ animationDuration: '8s' }} />
                <div className={cn("absolute bottom-[-20%] right-[-10%] w-[80vw] h-[80vw] rounded-full mix-blend-overlay filter blur-[100px] opacity-40 animate-pulse",
                    theme === 'green' ? 'bg-emerald-300' : theme === 'lavender' ? 'bg-indigo-300' : 'bg-rose-300'
                )} style={{ animationDuration: '10s', animationDelay: '1s' }} />
            </div>

            {/* Main Cinematic Card - Wide & Glassy */}
            <div className="w-full max-w-5xl bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row relative z-10 transition-all duration-500">

                {/* Left Side: Brand & Toggles (40%) */}
                <div className="w-full md:w-[40%] p-10 flex flex-col justify-between bg-black/20 border-r border-white/10 text-white">
                    <div>
                        <div className="mb-8 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/20">
                                <Sprout size={20} className="text-white" />
                            </div>
                            <span className="text-xl font-bold tracking-wide">Aura</span>
                        </div>

                        <h2 className="text-4xl font-serif font-bold leading-tight mb-4">
                            Focus on your <br />
                            <span className={cn("italic", accentColor)}>well-being.</span>
                        </h2>
                        <p className="text-white/60 text-sm leading-relaxed">
                            Customize your environment before you even step inside. Choose the color that speaks to your current state of mind.
                        </p>
                    </div>

                    {/* Theme Toggles */}
                    <div className="mt-10 md:mt-0">
                        <span className="text-xs font-semibold text-white/40 uppercase tracking-widest block mb-4">Select Ambiance</span>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setTheme('green')}
                                className={cn("w-12 h-12 rounded-full border-2 transition-all duration-300 flex items-center justify-center bg-green-900/50 backdrop-blur-sm",
                                    theme === 'green' ? 'border-emerald-400 scale-110 shadow-[0_0_20px_rgba(52,168,83,0.4)]' : 'border-white/10 hover:border-white/30 hover:scale-105'
                                )}
                                title="Vitality (Green)"
                            >
                                <div className="w-4 h-4 rounded-full bg-[#34A853]" />
                            </button>
                            <button
                                onClick={() => setTheme('lavender')}
                                className={cn("w-12 h-12 rounded-full border-2 transition-all duration-300 flex items-center justify-center bg-purple-900/50 backdrop-blur-sm",
                                    theme === 'lavender' ? 'border-purple-400 scale-110 shadow-[0_0_20px_rgba(147,51,234,0.4)]' : 'border-white/10 hover:border-white/30 hover:scale-105'
                                )}
                                title="Serenity (Lavender)"
                            >
                                <div className="w-4 h-4 rounded-full bg-[#9333ea]" />
                            </button>
                            <button
                                onClick={() => setTheme('pink')}
                                className={cn("w-12 h-12 rounded-full border-2 transition-all duration-300 flex items-center justify-center bg-pink-900/50 backdrop-blur-sm",
                                    theme === 'pink' ? 'border-pink-400 scale-110 shadow-[0_0_20px_rgba(236,72,153,0.4)]' : 'border-white/10 hover:border-white/30 hover:scale-105'
                                )}
                                title="Warmth (Pink)"
                            >
                                <div className="w-4 h-4 rounded-full bg-[#ec4899]" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Side: Form (60%) */}
                <div className="w-full md:w-[60%] p-10 md:p-14 bg-white/95 backdrop-blur-xl flex flex-col justify-center">
                    <div className="max-w-sm mx-auto w-full">
                        <div className="mb-10 text-center md:text-left">
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                {isLogin ? 'Welcome Back' : 'Get Started'}
                            </h1>
                            <p className="text-gray-500">
                                {isLogin ? 'Enter your details to access your account.' : 'Create your account to start your journey.'}
                            </p>
                        </div>

                        <form onSubmit={handleAuth} className="space-y-5">
                            {error && (
                                <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg font-medium border border-red-100">
                                    {error}
                                </div>
                            )}

                            {!isLogin && (
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-900 uppercase tracking-widest pl-1">Full Name</label>
                                    <Input
                                        placeholder="John Doe"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="h-12 rounded-xl bg-gray-50 border-gray-200 focus:bg-white focus:ring-2 focus:ring-black/5 focus:border-gray-400 transition-all font-medium"
                                    />
                                </div>
                            )}

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-900 uppercase tracking-widest pl-1">Email</label>
                                <Input
                                    type="email"
                                    placeholder="name@example.com"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="h-12 rounded-xl bg-gray-50 border-gray-200 focus:bg-white focus:ring-2 focus:ring-black/5 focus:border-gray-400 transition-all font-medium"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-900 uppercase tracking-widest pl-1">Password</label>
                                <Input
                                    type="password"
                                    placeholder="••••••••"
                                    required
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="h-12 rounded-xl bg-gray-50 border-gray-200 focus:bg-white focus:ring-2 focus:ring-black/5 focus:border-gray-400 transition-all font-medium"
                                />
                            </div>

                            {!isLogin && (
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-900 uppercase tracking-widest pl-1">Confirm Password</label>
                                    <Input
                                        type="password"
                                        placeholder="••••••••"
                                        required
                                        value={formData.confirmPassword}
                                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                        className="h-12 rounded-xl bg-gray-50 border-gray-200 focus:bg-white focus:ring-2 focus:ring-black/5 focus:border-gray-400 transition-all font-medium"
                                    />
                                </div>
                            )}

                            <Button
                                className={cn("w-full h-12 text-base font-bold tracking-wide rounded-xl text-white shadow-lg transition-all transform hover:-translate-y-0.5 mt-4", buttonClass)}
                            >
                                {isLogin ? 'Sign In' : 'Create Account'}
                            </Button>
                        </form>

                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-100"></div>
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-white px-2 text-gray-400 font-bold tracking-widest">Or</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Button
                                type="button"
                                onClick={handleGoogleLogin}
                                className="h-12 text-sm font-bold tracking-wide rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 shadow-sm transition-all flex items-center justify-center gap-2"
                            >
                                <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google" className="w-5 h-5" />
                                Google
                            </Button>

                            <Button
                                type="button"
                                onClick={handleGithubLogin}
                                className="h-12 text-sm font-bold tracking-wide rounded-xl bg-[#24292F] hover:bg-[#24292F]/90 text-white shadow-sm transition-all flex items-center justify-center gap-2"
                            >
                                <svg height="20" viewBox="0 0 16 16" width="20" className="fill-current">
                                    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
                                </svg>
                                GitHub
                            </Button>
                        </div>

                        <div className="mt-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
                            <p className="text-muted">
                                {isLogin ? "Don't have an account yet? " : "Already have an account? "}
                                {isLogin ? (
                                    <Link to="/register" className="font-bold text-primary hover:text-primary/80 transition-colors">
                                        Create one
                                    </Link>
                                ) : (
                                    <button
                                        onClick={() => setIsLogin(true)}
                                        className="font-bold text-primary hover:text-primary/80 transition-colors"
                                    >
                                        Sign in
                                    </button>
                                )}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
