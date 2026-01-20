import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { MapContainer, TileLayer, Polyline, Marker, Popup, Circle } from 'react-leaflet';
import { ArrowRight, Clock, AlertTriangle } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const RoutingOptimization = ({ scenario }) => {
    const [routes, setRoutes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await api.getRoutes({ scenario });
                setRoutes(response.data);
            } catch (error) {
                console.error("Error fetching routes:", error);
            } finally {
                setLoading(false);
            }
        };

        if (scenario) {
            fetchData();
        }
    }, [scenario]);

    if (loading) return <div className="text-center p-4">Optimizing supply routes...</div>;

    const colors = ['blue', 'green', 'purple'];

    return (
        <div className="space-y-6">
            <div className="h-[400px] w-full rounded-lg overflow-hidden border border-gray-300 relative z-0">
                <MapContainer center={[26.85, 80.95]} zoom={12} style={{ height: '100%', width: '100%' }}>
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    {routes.map((route, idx) => (
                        <React.Fragment key={idx}>
                            <Polyline
                                positions={route.path}
                                color={colors[idx % colors.length]}
                                weight={4}
                                opacity={0.8}
                            >
                                <Popup>
                                    <div className="font-semibold">{route.id}</div>
                                    <div>Status: {route.status}</div>
                                </Popup>
                            </Polyline>
                            {/* Start Marker */}
                            <Marker position={route.path[0]}>
                                <Popup>Start: {route.start}</Popup>
                            </Marker>
                            {/* End Marker */}
                            <Marker position={route.path[route.path.length - 1]}>
                                <Popup>End: {route.end}</Popup>
                            </Marker>
                        </React.Fragment>
                    ))}
                </MapContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {routes.map((route, idx) => (
                    <div key={idx} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex justify-between items-center mb-3">
                            <h4 className="font-bold text-gray-800 uppercase">{route.id}</h4>
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${route.status === 'Clear' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {route.status}
                            </span>
                        </div>
                        <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                            <span>{route.start}</span>
                            <ArrowRight className="w-4 h-4" />
                            <span>{route.end}</span>
                        </div>
                        <div className="flex gap-4 text-xs text-gray-500 mt-3 pt-3 border-t border-gray-100">
                            <span className="flex items-center">
                                <RouteIcon className="w-3 h-3 mr-1" />
                                {route.distance}
                            </span>
                            <span className="flex items-center">
                                <Clock className="w-3 h-3 mr-1" />
                                {route.time}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const RouteIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="6" cy="19" r="3"></circle><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H18"></path><path d="M18 5L21 8 18 11"></path></svg>
)

export default RoutingOptimization;
