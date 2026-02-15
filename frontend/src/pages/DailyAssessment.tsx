import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { startAssessment, submitAssessment, type Question } from '../services/api';
import { cn } from '../lib/utils';

export default function DailyAssessment() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, number>>({});
    const [isComplete, setIsComplete] = useState(false);
    const [score, setScore] = useState(0);
    const [severity, setSeverity] = useState('');

    useEffect(() => {
        const loadAssessment = async () => {
            try {
                const response = await startAssessment('daily');
                if (response.questions) {
                    setQuestions(response.questions);
                }
            } catch (error) {
                console.error('Failed to load assessment', error);
            } finally {
                setLoading(false);
            }
        };
        loadAssessment();
    }, []);

    const handleAnswer = (value: number) => {
        const newAnswers = { ...answers, [currentIndex]: value };
        setAnswers(newAnswers);

        // Only auto-advance, don't auto-submit on last question
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(currentIndex + 1);
        }
    };

    const handleSubmit = async (finalAnswers: Record<string, number>) => {
        setLoading(true);
        try {
            const response = await submitAssessment('daily', finalAnswers);
            setScore(response.score || 0);
            setSeverity(response.severity || '');
            setIsComplete(true);
        } catch (error) {
            console.error('Failed to submit assessment', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePrevious = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-purple-50">
                <div className="animate-pulse text-primary text-lg font-serif">Loading your assessment...</div>
            </div>
        );
    }

    if (isComplete) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-purple-50 p-8">
                <Card className="max-w-2xl w-full p-8 text-center">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle size={40} className="text-green-600" />
                    </div>
                    <h2 className="text-3xl font-serif font-bold text-text mb-4">Assessment Complete!</h2>
                    <p className="text-muted mb-6">
                        Thank you for taking the time to check in with yourself.
                    </p>

                    <div className="bg-primary/5 p-6 rounded-2xl mb-8">
                        <p className="text-sm text-muted mb-2">Your Wellbeing Score</p>
                        <p className="text-5xl font-bold text-primary mb-2">{score}</p>
                        <p className="text-lg font-medium text-text capitalize">
                            {severity === 'excellent' && '🌟 Thriving'}
                            {severity === 'good' && '👍 Managing Well'}
                            {severity === 'fair' && '💪 Some Struggles'}
                            {severity === 'concerning' && '🤝 Need Support'}
                        </p>
                    </div>

                    <div className="flex gap-4 justify-center">
                        <Button onClick={() => navigate('/dashboard')} size="lg">
                            Back to Dashboard
                        </Button>
                    </div>
                </Card>
            </div>
        );
    }

    const currentQuestion = questions[currentIndex];
    const progress = ((currentIndex + 1) / questions.length) * 100;

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary/5 to-purple-50 p-8">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate('/dashboard')}
                        className="mb-4"
                    >
                        <ArrowLeft size={16} className="mr-2" />
                        Back to Dashboard
                    </Button>
                    <h1 className="text-4xl font-serif font-bold text-text mb-2">Daily Wellbeing Check-in</h1>
                    <p className="text-muted">Question {currentIndex + 1} of {questions.length}</p>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                        <div
                            className="bg-primary h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                {/* Question Card */}
                <Card className="p-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <h2 className="text-2xl font-serif font-medium text-text mb-8">
                        {currentQuestion?.text}
                    </h2>

                    <div className="space-y-3">
                        {currentQuestion?.options.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => handleAnswer(option.value)}
                                className={cn(
                                    "w-full text-left p-4 rounded-xl border-2 transition-all duration-200",
                                    "hover:border-primary/50 hover:bg-primary/5",
                                    "focus:outline-none focus:ring-2 focus:ring-primary/50",
                                    answers[currentIndex] === option.value
                                        ? "border-primary bg-primary/10 shadow-md"
                                        : "border-gray-200 bg-white"
                                )}
                            >
                                <span className="text-base text-text">{option.text}</span>
                            </button>
                        ))}
                    </div>

                    {/* Navigation */}
                    <div className="flex justify-between mt-8">
                        <Button
                            variant="ghost"
                            onClick={handlePrevious}
                            disabled={currentIndex === 0}
                        >
                            Previous
                        </Button>

                        {/* Show Submit button on last question if answered */}
                        {currentIndex === questions.length - 1 && answers[currentIndex] !== undefined ? (
                            <Button
                                onClick={() => handleSubmit(answers)}
                                size="lg"
                                className="px-8"
                            >
                                Submit Assessment
                            </Button>
                        ) : (
                            <span className="text-sm text-muted self-center">
                                {answers[currentIndex] !== undefined ? 'Click an option to continue' : 'Select an answer'}
                            </span>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
}
