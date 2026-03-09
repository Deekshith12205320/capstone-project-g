import { useState, useRef, useEffect } from 'react';
import { Button } from '../ui/Button';
import { X, Send, Bot, User, Loader2 } from 'lucide-react';
import { useAmbience } from '../../context/AmbienceContext';
import { cn } from '../../lib/utils';
import { sendMessage } from '../../services/api';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
}

export default function WellbeingChatbot({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const { theme } = useAmbience();
    const [messages, setMessages] = useState<Message[]>([
        { id: '1', role: 'assistant', content: 'Hi there! I am your Emotional Wellbeing Chatbot. How are you feeling today?' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: Message = { id: Date.now().toString(), role: 'user', content: input.trim() };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await sendMessage(userMessage.content);
            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: response.reply || ""
            };
            setMessages(prev => [...prev, assistantMessage]);
        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: "I'm having trouble connecting right now. Please try again later."
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    if (!isOpen) return null;

    const themeClass = theme === 'green' ? 'bg-emerald-50 text-emerald-900 border-emerald-200' :
        theme === 'lavender' ? 'bg-purple-50 text-purple-900 border-purple-200' :
            'bg-rose-50 text-rose-900 border-rose-200';

    const headerClass = theme === 'green' ? 'bg-emerald-600' :
        theme === 'lavender' ? 'bg-purple-600' : 'bg-rose-600';

    return (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className={cn("rounded-3xl shadow-2xl max-w-2xl w-full border-2 relative overflow-hidden flex flex-col h-[85vh]", themeClass)}>

                {/* Header */}
                <div className={cn("p-6 flex justify-between items-center text-white relative z-10", headerClass)}>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-xl">
                            <Bot size={28} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold font-serif">Wellbeing Chatbot</h2>
                            <p className="text-sm opacity-90">Powered by AI</p>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/20 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Chat Messages Log */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white/40">
                    {messages.map((msg) => (
                        <div key={msg.id} className={cn("flex gap-4", msg.role === 'user' ? "flex-row-reverse" : "")}>
                            <div className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm",
                                msg.role === 'user' ? "bg-indigo-600 text-white" : "bg-white text-gray-800"
                            )}>
                                {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
                            </div>
                            <div className={cn(
                                "max-w-[75%] rounded-2xl p-4 shadow-sm",
                                msg.role === 'user'
                                    ? "bg-indigo-600 text-white rounded-tr-sm"
                                    : "bg-white text-gray-800 border border-black/5 rounded-tl-sm"
                            )}>
                                <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center flex-shrink-0 shadow-sm text-gray-800">
                                <Bot size={20} />
                            </div>
                            <div className="bg-white text-gray-800 border border-black/5 rounded-2xl rounded-tl-sm p-4 flex items-center gap-2 shadow-sm">
                                <Loader2 size={16} className="animate-spin text-gray-400" />
                                <span className="text-sm text-gray-500 font-medium">Thinking...</span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-white border-t border-black/5">
                    <div className="flex gap-3 max-w-4xl mx-auto items-end">
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Type your message here..."
                            className="flex-1 max-h-32 min-h-[56px] bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                            rows={1}
                        />
                        <Button
                            onClick={handleSend}
                            disabled={!input.trim() || isLoading}
                            className={cn(
                                "h-14 w-14 rounded-2xl flex items-center justify-center shadow-md shrink-0",
                                headerClass
                            )}
                        >
                            <Send size={20} className={input.trim() && !isLoading ? "text-white" : "text-white/50"} />
                        </Button>
                    </div>
                </div>

            </div>
        </div>
    );
}
