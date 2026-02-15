import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

export type Theme = 'green' | 'lavender' | 'pink';

interface AmbienceContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    gradientStyle: { background: string; transition: string; minHeight: string };
    primaryColor: string;
    isFocusMode: boolean;
    setFocusMode: (value: boolean) => void;
}

const AmbienceContext = createContext<AmbienceContextType | undefined>(undefined);

export function AmbienceProvider({ children }: { children: ReactNode }) {
    const [theme, setTheme] = useState<Theme>('green');
    const [isFocusMode, setFocusMode] = useState(false);
    const [bgImage, setBgImage] = useState<string>('');

    // Define gradients (fallback)
    const greenGradient = 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)';
    const lavenderGradient = 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)';
    const pinkGradient = 'linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)';

    const currentGradient = theme === 'green' ? greenGradient : theme === 'lavender' ? lavenderGradient : pinkGradient;

    // Unsplash Integration - DISABLED as per user request to remove background image but keep colors
    /*
    useEffect(() => {
        const fetchUnsplashImage = async () => {
            // ... (code removed/commented)
        };
        if (!isFocusMode) {
             // fetchUnsplashImage(); 
        }
    }, [theme, isFocusMode]);
    */

    const gradientStyle = {
        background: isFocusMode
            ? '#F8F9FA'
            : currentGradient, // Always use gradient, ignore bgImage
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        transition: 'background 0.5s ease-in-out',
        minHeight: '100vh',
    };

    // Dynamic primary color based on theme
    const primaryColor = theme === 'green' ? '#34A853' : theme === 'lavender' ? '#9333ea' : '#ec4899';

    // Update CSS variables for global usage
    useEffect(() => {
        const root = document.documentElement;
        if (theme === 'green') {
            root.style.setProperty('--color-primary', '#34A853');
            root.style.setProperty('--color-primary-rgb', '52, 168, 83');
        } else if (theme === 'lavender') {
            root.style.setProperty('--color-primary', '#9333ea');
            root.style.setProperty('--color-primary-rgb', '147, 51, 234');
        } else {
            root.style.setProperty('--color-primary', '#ec4899');
            root.style.setProperty('--color-primary-rgb', '236, 72, 153');
        }
    }, [theme]);

    return (
        <AmbienceContext.Provider value={{ theme, setTheme, gradientStyle, primaryColor, isFocusMode, setFocusMode }}>
            {children}
        </AmbienceContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAmbience() {
    const context = useContext(AmbienceContext);
    if (context === undefined) {
        throw new Error('useAmbience must be used within an AmbienceProvider');
    }
    return context;
}
