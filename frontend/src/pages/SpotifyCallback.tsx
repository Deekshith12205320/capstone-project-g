import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SpotifyCallback() {
    const navigate = useNavigate();

    useEffect(() => {
        // Check for hash parameters (Implicit Grant Flow)
        const hash = window.location.hash;
        if (hash) {
            const params = new URLSearchParams(hash.substring(1)); // Remove the #
            const accessToken = params.get('access_token');
            const error = params.get('error');

            if (accessToken) {
                // Save to localStorage
                localStorage.setItem('spotify_access_token', accessToken);
                // Expiry is usually 3600s
                const expiry = new Date().getTime() + 3600 * 1000;
                localStorage.setItem('spotify_token_expiry', expiry.toString());

                console.log('[Spotify] Token received and saved.');
                navigate('/dashboard');
            } else if (error) {
                console.error('[Spotify] Auth error:', error);
                navigate('/dashboard?error=spotify_auth_failed');
            }
        } else {
            // Fallback or error
            navigate('/dashboard');
        }
    }, [navigate]);

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
            <div className="text-center">
                <h2 className="text-2xl font-bold mb-4">Connecting to Spotify...</h2>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
            </div>
        </div>
    );
}
