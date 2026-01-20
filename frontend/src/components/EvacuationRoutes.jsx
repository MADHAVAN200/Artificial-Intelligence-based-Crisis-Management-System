import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { MapContainer, TileLayer, Polyline, Marker, Popup, Circle } from 'react-leaflet';
import { Home, User, AlertTriangle } from 'lucide-react';

const EvacuationRoutes = ({ scenario }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const userLat = 26.85; // Simulated user location
    const userLon = 80.95;

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await api.getEvacuationRoutes({
                    user_lat: userLat,
                    user_lon: userLon,
                    scenario
                });
                setData(response.data);
            } catch (error) {
                console.error("Error fetching evacuation routes:", error);
            } finally {
                setLoading(false);
            }
        };

        if (scenario) {
            fetchData();
        }
    }, [scenario]);

    if (loading) return <div className="text-center p-4">Calculating safe paths...</div>;
    if (!data) return null;

    return (
        <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg flex items-center">
                <User className="w-5 h-5 mr-3 text-blue-600" />
                <div>
                    <div className="font-semibold text-blue-900">Your Location</div>
                    <div className="text-sm text-blue-700">{userLat}, {userLon}</div>
                </div>
            </div>

            <div className="h-[400px] w-full rounded-lg overflow-hidden border border-gray-300 relative z-0">
                <MapContainer center={[userLat, userLon]} zoom={13} style={{ height: '100%', width: '100%' }}>
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />

                    {/* User Marker */}
                    <Marker position={[userLat, userLon]}>
                        <Popup>You are here</Popup>
                    </Marker>

                    {/* Shelters */}
                    {data.shelters.map((pos, idx) => (
                        <Marker key={`shelter-${idx}`} position={pos}>
                            <Popup>Shelter</Popup>
                        </Marker>
                    ))}

                    {/* Hazards */}
                    {data.hazards.map((h, idx) => (
                        <Circle
                            key={`hazard-${idx}`}
                            center={[h[0], h[1]]}
                            radius={h[2] * 1000}
                            pathOptions={{ color: 'red', fillColor: 'red', fillOpacity: 0.4 }}
                        />
                    ))}

                    {/* Routes */}
                    {data.routes.map((route, idx) => (
                        <Polyline
                            key={`route-${idx}`}
                            positions={route.path}
                            color="green"
                            weight={5}
                            dashArray="10, 10"
                        >
                            <Popup>To {route.shelter_name} ({route.length} km)</Popup>
                        </Polyline>
                    ))}
                </MapContainer>
            </div>

            <div className="space-y-3">
                <h3 className="font-semibold text-lg">Recommended Evacuation Routes</h3>
                {data.routes.map((route, idx) => (
                    <div key={idx} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex justify-between items-center hover:bg-gray-50 transition-colors cursor-pointer">
                        <div className="flex items-center">
                            <div className="bg-green-100 p-2 rounded-full mr-4">
                                <Home className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <div className="font-bold text-gray-800">{route.shelter_name}</div>
                                <div className="text-xs text-gray-500">Capacity: {route.capacity_status}</div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="font-bold text-gray-800">{route.length} km</div>
                            <div className="text-xs text-green-600 font-semibold">Safe Route</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default EvacuationRoutes;
