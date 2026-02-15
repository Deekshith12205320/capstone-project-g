import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Card } from '../ui/Card';
import { useAmbience } from '../../context/AmbienceContext';
import { cn } from '../../lib/utils';
// Fix for default marker icon in React-Leaflet
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Mock Data for Mental Health Locations
const LOCATIONS = [
    { id: 1, name: "Student Wellness Center", lat: 12.9716, lng: 77.5946, type: "Campus Support" }, // Bangalore coords as example
    { id: 2, name: "City Counseling Services", lat: 12.9750, lng: 77.5990, type: "Clinic" },
    { id: 3, name: "Mindful Space Therapy", lat: 12.9680, lng: 77.5900, type: "Private Practice" },
    { id: 4, name: "Crisis Help Center", lat: 12.9800, lng: 77.5850, type: "Emergency" },
];

export default function MentalHealthMap() {
    const { theme } = useAmbience();
    // Default center (Bangalore for this example, or user's detected location)
    const position: [number, number] = [12.9716, 77.5946];

    return (
        <Card className={cn(
            "p-0 overflow-hidden h-[400px] border-0 relative shadow-lg transition-all duration-500",
            theme === 'green' ? 'shadow-emerald-900/10' : theme === 'lavender' ? 'shadow-purple-900/10' : 'shadow-rose-900/10'
        )}>
            <div className="absolute top-4 left-4 z-[400] bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl shadow-sm border border-black/5">
                <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                    Nearby Support
                </h3>
            </div>

            <MapContainer center={position} zoom={13} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {LOCATIONS.map(loc => (
                    <Marker key={loc.id} position={[loc.lat, loc.lng]}>
                        <Popup>
                            <div className="p-1">
                                <h4 className="font-bold text-sm mb-1">{loc.name}</h4>
                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                                    {loc.type}
                                </span>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </Card>
    );
}
