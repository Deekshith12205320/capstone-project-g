const JAMENDO_CLIENT_ID = '2b958285';
const JAMENDO_API_BASE = 'https://api.jamendo.com/v3.0';

export interface JamendoTrack {
    id: string;
    name: string;
    artist_name: string;
    album_name: string;
    image: string;
    audio: string;
    duration: number;
    joindate: string;
}

export const searchJamendoTracks = async (query: string, sort: string = 'relevance'): Promise<JamendoTrack[]> => {
    try {
        let orderParam = 'relevance'; // Jamendo default is usually relevance when searching
        // Map our simple drop down options to Jamendo API order options
        if (sort === 'name') orderParam = 'name_asc';
        if (sort === 'artist') orderParam = 'artist_name_asc';

        const response = await fetch(
            `${JAMENDO_API_BASE}/tracks/?client_id=${JAMENDO_CLIENT_ID}&format=jsonpretty&limit=20&search=${encodeURIComponent(query)}&order=${orderParam}`
        );
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data.results || [];
    } catch (error) {
        console.error("Error searching Jamendo API:", error);
        return [];
    }
};

export const fetchPopularJamendoTracks = async (): Promise<JamendoTrack[]> => {
    try {
        const response = await fetch(
            `${JAMENDO_API_BASE}/tracks/?client_id=${JAMENDO_CLIENT_ID}&format=jsonpretty&limit=10&order=popularity_total`
        );
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data.results || [];
    } catch (error) {
        console.error("Error fetching popular tracks from Jamendo API:", error);
        return [];
    }
};
