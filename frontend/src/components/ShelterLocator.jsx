import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Home, Users, CheckCircle, XCircle } from 'lucide-react';

const ShelterLocator = () => {
    const [shelters, setShelters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState({ food: false, medical: false });

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await api.getShelters();
                setShelters(response.data);
            } catch (error) {
                console.error("Error fetching shelters:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const filteredShelters = shelters.filter(s => {
        if (filter.food && s.resources.food !== 'Adequate') return false;
        if (filter.medical && s.resources.medical !== 'Adequate') return false;
        return true;
    });

    if (loading) return <div className="text-center p-4">Locating safe havens...</div>;

    return (
        <div className="space-y-6">

            {/* Filters */}
            <div className="flex gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <span className="font-semibold text-gray-700 self-center">Requirements:</span>
                <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={filter.food}
                        onChange={e => setFilter({ ...filter, food: e.target.checked })}
                        className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span>Food Supply</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={filter.medical}
                        onChange={e => setFilter({ ...filter, medical: e.target.checked })}
                        className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span>Medical Aid</span>
                </label>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 h-[500px] rounded-lg overflow-hidden border border-gray-300 relative z-0">
                    <MapContainer center={[26.85, 80.95]} zoom={12} style={{ height: '100%', width: '100%' }}>
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        />
                        {filteredShelters.map((s, idx) => (
                            <Marker key={idx} position={s.location}>
                                <Popup>
                                    <div className="font-bold">{s.name}</div>
                                    <div>Status: {s.status}</div>
                                    <div>Capacity: {s.occupancy}/{s.capacity}</div>
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                </div>

                <div className="space-y-4 overflow-y-auto h-[500px] pr-2">
                    {filteredShelters.map((s, idx) => {
                        const occupancyRate = (s.occupancy / s.capacity) * 100;
                        let statusColor = 'bg-green-100 text-green-800';
                        if (occupancyRate > 90) statusColor = 'bg-red-100 text-red-800';
                        else if (occupancyRate > 70) statusColor = 'bg-yellow-100 text-yellow-800';

                        return (
                            <div key={idx} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-bold text-gray-800">{s.name}</h4>
                                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${statusColor}`}>
                                        {s.status}
                                    </span>
                                </div>

                                <div className="flex items-center text-sm text-gray-600 mb-3">
                                    <Users className="w-4 h-4 mr-2" />
                                    <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                                        <div className={`h-2 rounded-full ${occupancyRate > 90 ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: `${occupancyRate}%` }}></div>
                                    </div>
                                    <span className="whitespace-nowrap">{s.occupancy} / {s.capacity}</span>
                                </div>

                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    <ResourceItem label="Food" status={s.resources.food} />
                                    <ResourceItem label="Water" status={s.resources.water} />
                                    <ResourceItem label="Medical" status={s.resources.medical} />
                                </div>
                            </div>
                        );
                    })}
                    {filteredShelters.length === 0 && (
                        <div className="text-center text-gray-500 py-10">No shelters match your criteria.</div>
                    )}
                </div>
            </div>
        </div>
    );
};

const ResourceItem = ({ label, status }) => (
    <div className="flex items-center justify-between bg-gray-50 px-2 py-1.5 rounded">
        <span className="text-gray-600">{label}</span>
        {status === 'Adequate' ? (
            <CheckCircle className="w-4 h-4 text-green-500" />
        ) : (
            <XCircle className="w-4 h-4 text-orange-500" />
        )}
    </div>
);

export default ShelterLocator;
