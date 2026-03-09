import { X } from 'lucide-react';

export default function ForestMania({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#1a1640] rounded-3xl shadow-2xl max-w-5xl w-full h-[90vh] relative overflow-hidden flex flex-col border border-emerald-500/20 animate-in zoom-in-95">
                <div className="p-4 flex justify-between items-center border-b border-white/10 text-white bg-emerald-900/40">
                    <h2 className="text-xl font-bold font-serif">Forest Mania</h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors"><X size={20} /></button>
                </div>
                <div className="flex-1 bg-black relative">
                    <iframe
                        src="https://gameforge.com/en-US/littlegames/forest-mania/"
                        className="absolute inset-0 w-full h-full border-0"
                        title="Forest Mania"
                        allow="autoplay; fullscreen"
                    />
                </div>
            </div>
        </div>
    );
}
