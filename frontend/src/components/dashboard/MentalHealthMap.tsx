import { useState } from 'react';
import { GoogleMap, useJsApiLoader, MarkerF, InfoWindowF } from '@react-google-maps/api';
import { Card } from '../ui/Card';
import { useAmbience } from '../../context/AmbienceContext';
import { cn } from '../../lib/utils';

// Mock Data for Mental Health Locations
const LOCATIONS = [
    { id: 1, name: "Student Wellness Center", lat: 12.9716, lng: 77.5946, type: "Campus Support" }, // Bangalore coords as example
    { id: 2, name: "City Counseling Services", lat: 12.9750, lng: 77.5990, type: "Clinic" },
    { id: 3, name: "Mindful Space Therapy", lat: 12.9680, lng: 77.5900, type: "Private Practice" },
    { id: 4, name: "Crisis Help Center", lat: 12.9800, lng: 77.5850, type: "Emergency" },
];

const containerStyle = {
  width: '100%',
  height: '100%'
};

export default function MentalHealthMap() {
    const { theme } = useAmbience();
    const position = { lat: 12.9716, lng: 77.5946 };
    const [selectedLoc, setSelectedLoc] = useState<typeof LOCATIONS[0] | null>(null);

    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS || "" // use empty string or undefined if env not set to prevent leaking secrets
    });

    return (
        <Card className={cn(
            "p-0 overflow-hidden h-[400px] border-0 relative shadow-lg transition-all duration-500",
            theme === 'green' ? 'shadow-emerald-900/10' : theme === 'lavender' ? 'shadow-purple-900/10' : 'shadow-rose-900/10'
        )}>
            <div className="absolute top-4 left-4 z-[400] bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl shadow-sm border border-black/5 pointer-events-none">
                <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                    Nearby Support
                </h3>
            </div>

            {isLoaded ? (
                <GoogleMap
                    mapContainerStyle={containerStyle}
                    center={position}
                    zoom={13}
                    options={{
                        disableDefaultUI: true,
                        zoomControl: true,
                    }}
                >
                    {LOCATIONS.map(loc => (
                        <MarkerF
                            key={loc.id}
                            position={{ lat: loc.lat, lng: loc.lng }}
                            onClick={() => setSelectedLoc(loc)}
                        />
                    ))}

                    {selectedLoc && (
                        <InfoWindowF
                            position={{ lat: selectedLoc.lat, lng: selectedLoc.lng }}
                            onCloseClick={() => setSelectedLoc(null)}
                        >
                            <div className="p-1">
                                <h4 className="font-bold text-sm mb-1 text-gray-800">{selectedLoc.name}</h4>
                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                                    {selectedLoc.type}
                                </span>
                            </div>
                        </InfoWindowF>
                    )}
                </GoogleMap>
            ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <span className="text-gray-400 animate-pulse">Loading Map...</span>
                </div>
            )}
        </Card>
    );
}
