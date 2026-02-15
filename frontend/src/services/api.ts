// Use VITE_API_URL if provided (Render), otherwise fallback to /api (Vercel/Local with proxy)
let apiUrl = import.meta.env.VITE_API_URL || '/api';

// Render's 'host' property usually returns just the domain (e.g. app.onrender.com)
// So we ensure it starts with https:// if it's not a relative path
if (apiUrl !== '/api' && !apiUrl.startsWith('http')) {
    apiUrl = `https://${apiUrl}`;
}

const API_URL = apiUrl;


export interface Question {
    id: string;
    text: string;
    options: { text: string; value: number }[];
}

export interface ChatResponse {
    reply?: string;
    crisis?: boolean;
    flags?: string[];
    suggestion?: {
        message: string;
        options: { label: string; type: string }[];
    };
    assessment?: boolean;
    type?: string;
    message?: string;
    questions?: Question[];
    assessmentComplete?: boolean;
    score?: number;
    severity?: string;
    emergency?: {
        message: string;
        contacts: { name: string; phone: string; availability: string }[];
    };
}

function getAuthHeader(): Record<string, string> {
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
}

export async function login(email: string, password: string): Promise<any> {
    const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Login failed');
    }
    return response.json();
}

export async function register(name: string, email: string, password: string, additionalData?: Partial<UserProfile>): Promise<any> {
    const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, ...additionalData })
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Registration failed');
    }
    return response.json();
}

export async function sendMessage(text: string): Promise<ChatResponse> {
    try {
        const response = await fetch(`${API_URL}/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeader()
            },
            body: JSON.stringify({ text }),
        });

        if (!response.ok) {
            if (response.status === 401) {
                // handle unauthorized
            }
            throw new Error('Network response was not ok');
        }

        return await response.json();
    } catch (error) {
        console.error('Error sending message:', error);
        throw error;
    }
}

export async function startAssessment(type: string): Promise<ChatResponse> {
    try {
        const response = await fetch(`${API_URL}/assessments/${type}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeader()
            },
        });

        if (!response.ok) throw new Error('Failed to start assessment');

        const data = await response.json();

        // Map backend response to ChatResponse format
        return {
            assessment: true,
            type: type,
            questions: data.items.map((item: any, index: number) => ({
                id: index.toString(), // or item.id if available
                text: item.question,
                options: data.scale.map((scalePoint: any) => ({
                    text: scalePoint.label,
                    value: scalePoint.value
                }))
            }))
        };
    } catch (error) {
        console.error('Error starting assessment:', error);
        throw error;
    }
}

export async function submitAssessment(type: string, answers: Record<string, number>): Promise<ChatResponse> {
    try {
        // Convert record to array of values for backend
        // Assuming keys are '0', '1', '2' indices from the questions array
        const answersArray = Object.keys(answers).sort().map(k => answers[k]);

        const response = await fetch(`${API_URL}/assessments/submit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeader()
            },
            body: JSON.stringify({ type, answers: answersArray }),
        });

        if (!response.ok) throw new Error('Failed to submit assessment');

        const data = await response.json();

        // Return result as a chat reply
        return {
            reply: `Assessment complete. Your score is ${data.score}. Severity: ${data.severity}.`,
            assessmentComplete: true,
            score: data.score,
            severity: data.severity
        };
    } catch (error) {
        console.error('Error submitting assessment:', error);
        throw error;
    }
}
// ... existing exports ...

// ... existing exports ...

export interface HistoryMessage {
    id: number;
    role: 'user' | 'ai';
    content: string;
    timestamp: string;
    is_crisis: number;
}

export interface AssessmentResult {
    id: number;
    type: string;
    score: number;
    severity: string;
    answers: Record<string, number>;
    insight: string;
    timestamp: string;
}

export async function fetchHistory(): Promise<HistoryMessage[]> {
    try {
        const response = await fetch(`${API_URL}/chat/history`, {
            headers: getAuthHeader()
        });
        if (!response.ok) throw new Error('Failed to fetch history');
        return await response.json();
    } catch (error) {
        console.error('Error fetching history:', error);
        return [];
    }
}

export async function clearHistory(): Promise<void> {
    try {
        const response = await fetch(`${API_URL}/chat/history`, {
            method: 'DELETE',
            headers: getAuthHeader()
        });
        if (!response.ok) throw new Error('Failed to clear history');
    } catch (error) {
        console.error('Error clearing history:', error);
        throw error;
    }
}

export async function fetchAssessments(): Promise<AssessmentResult[]> {
    try {
        const response = await fetch(`${API_URL}/chat/assessments`, {
            headers: getAuthHeader()
        });
        if (!response.ok) throw new Error('Failed to fetch assessments');
        return await response.json();
    } catch (error) {
        console.error('Error fetching assessments:', error);
        return [];
    }
}

export interface UserProfile {
    id: number | string;
    name: string;
    email: string;
    location: string;
    bio: string;
    role: string;
    hobbies: string | string[];
    likes: string | string[];
    dislikes: string | string[];
    contact_name: string;
    contact_phone: string;
}

export async function fetchUserProfile(): Promise<UserProfile> {
    try {
        const response = await fetch(`${API_URL}/auth/profile`, {
            headers: getAuthHeader()
        });
        if (!response.ok) throw new Error('Failed to fetch profile');
        return await response.json();
    } catch (error) {
        console.error('Error fetching profile:', error);
        return {
            id: 1,
            name: 'User',
            email: 'user@example.com',
            location: '',
            bio: '',
            role: '',
            hobbies: [],
            likes: [],
            dislikes: [],
            contact_name: '',
            contact_phone: ''
        };
    }
}

export async function updateUserProfile(profile: Partial<UserProfile>): Promise<boolean> {
    try {
        const response = await fetch(`${API_URL}/auth/profile`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeader()
            },
            body: JSON.stringify(profile)
        });
        return response.ok;
    } catch (error) {
        console.error('Error updating profile:', error);
        return false;
    }
}
