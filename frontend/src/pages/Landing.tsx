import { Link } from 'react-router-dom';
import { ArrowRight, Moon, Sun } from 'lucide-react';
import { Button } from '../components/ui/Button';

export default function Landing() {
    return (
        <div className="min-h-screen bg-white text-gray-900 selection:bg-primary/20 overflow-x-hidden font-sans relative">
            {/* Background Gradients */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-purple-200/40 rounded-full blur-[100px] mix-blend-multiply" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-200/40 rounded-full blur-[100px] mix-blend-multiply" />
                <div className="absolute top-[40%] left-[40%] w-[40%] h-[40%] bg-pink-200/40 rounded-full blur-[100px] mix-blend-multiply" />
            </div>

            {/* Navigation */}
            <nav className="fixed top-0 w-full z-50 px-6 py-6 flex justify-between items-center backdrop-blur-sm bg-black/10">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-black font-bold text-sm">V</div>
                    <span className="font-serif font-bold text-xl tracking-tight">Vista</span>
                </div>
                <div className="flex gap-4">
                    <Link to="/auth">
                        <Button variant="ghost" className="text-white/70 hover:text-white hover:bg-white/10">Log in</Button>
                    </Link>
                    <Link to="/register">
                        <Button className="bg-white text-black hover:bg-white/90 rounded-full px-6">Get Started</Button>
                    </Link>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="relative pt-32 pb-20 px-6 max-w-7xl mx-auto flex flex-col items-center text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/60 border border-gray-200 text-sm text-gray-600 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700 shadow-sm backdrop-blur-sm">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    Available 24/7 for you
                </div>

                <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-medium tracking-tight mb-8 max-w-4xl text-gray-900 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                    Find your calm <br /> in the chaos.
                </h1>

                <p className="text-lg md:text-xl text-gray-600 max-w-2xl mb-12 leading-relaxed animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-200">
                    A safe space for your mind. Track your mood, journal your thoughts, and find support whenever you need it. Powered by AI, designed for humans.
                </p>

                <div className="flex flex-col md:flex-row gap-4 animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-300">
                    <Link to="/register">
                        <div className="group relative">
                            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full blur opacity-40 group-hover:opacity-75 transition duration-200" />
                            <button className="relative px-8 py-4 bg-white rounded-full leading-none flex items-center gap-2 text-black font-medium transition-transform active:scale-95">
                                Start your journey
                                <ArrowRight size={18} />
                            </button>
                        </div>
                    </Link>
                </div>

                {/* Visual Abstract Elements */}
                <div className="relative mt-20 w-full max-w-5xl aspect-[16/9] bg-white/5 rounded-3xl border border-white/10 backdrop-blur-sm overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-1000 delay-500">
                    <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/10 to-blue-500/10" />

                    {/* Floating Cards Mockup */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full flex items-center justify-center">
                        <div className="relative w-[300px] h-[400px] bg-black border border-white/10 rounded-2xl shadow-2xl p-6 -rotate-6 hover:rotate-0 transition-transform duration-500 z-10">
                            <div className="flex justify-between items-center mb-6">
                                <span className="text-sm text-white/50">Daily Journal</span>
                                <Sun size={16} className="text-white/50" />
                            </div>
                            <div className="h-2 w-1/3 bg-white/20 rounded-full mb-4" />
                            <div className="h-2 w-2/3 bg-white/20 rounded-full mb-2" />
                            <div className="h-2 w-full bg-white/10 rounded-full mb-2" />
                            <div className="h-2 w-full bg-white/10 rounded-full mb-2" />
                            <div className="h-2 w-1/2 bg-white/10 rounded-full" />
                        </div>

                        <div className="relative w-[300px] h-[400px] bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-2xl p-6 rotate-6 hover:rotate-0 transition-transform duration-500 -ml-20">
                            <div className="flex justify-between items-center mb-6">
                                <span className="text-sm text-white/50">Mood Tracker</span>
                                <Moon size={16} className="text-white/50" />
                            </div>
                            <div className="flex gap-2 justify-center mt-10">
                                <div className="w-12 h-12 rounded-full bg-purple-500/20 border border-purple-500/50 flex items-center justify-center">😔</div>
                                <div className="w-12 h-12 rounded-full bg-blue-500/20 border border-blue-500/50 flex items-center justify-center scale-110">😐</div>
                                <div className="w-12 h-12 rounded-full bg-green-500/20 border border-green-500/50 flex items-center justify-center">🙂</div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <footer className="border-t border-white/10 mt-20 py-12 text-center text-white/30 text-sm">
                <p>&copy; {new Date().getFullYear()} Vista. All rights reserved.</p>
            </footer>
        </div>
    );
}
