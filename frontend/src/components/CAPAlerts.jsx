import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { MapContainer, TileLayer, Polygon, Circle, Popup } from 'react-leaflet';
import { AlertOctagon, Info, ShieldAlert } from 'lucide-react';

const CAPAlerts = ({ scenario }) => {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await api.getCAPAlerts(scenario);
                setAlerts(response.data);
            } catch (error) {
                console.error("Error fetching CAP alerts:", error);
            } finally {
                setLoading(false);
            }
        };

        if (scenario) {
            fetchData();
        }
    }, [scenario]);

    if (loading) return <div className="text-center p-4">Fetching official alerts...</div>;

    return (
        <div className="space-y-6">

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-4 overflow-y-auto max-h-[600px] pr-2">
                    {alerts.length === 0 && <div className="text-gray-500">No active alerts.</div>}

                    {alerts.map((alert, idx) => (
                        <div key={idx} className={`p-4 rounded-lg shadow-sm border-l-4 ${alert.info.severity === 'Severe' || alert.info.severity === 'Extreme' ? 'bg-red-50 border-red-500 border-t border-r border-b border-red-100' : 'bg-orange-50 border-orange-500 border-t border-r border-b border-orange-100'}`}>
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="font-bold text-gray-900">{alert.info.event}</h4>
                                <span className="text-xs font-mono text-gray-500">{alert.sent.split('T')[1].split('+')[0]}</span>
                            </div>
                            <div className="flex items-center text-xs font-semibold uppercase mb-3">
                                <ShieldAlert className="w-4 h-4 mr-1" />
                                {alert.sender}
                            </div>

                            <p className="text-sm text-gray-800 mb-3">{alert.info.description}</p>

                            <div className="bg-white/50 p-2 rounded text-xs text-gray-700 italic">
                                <Info className="w-3 h-3 inline mr-1" />
                                {alert.info.instruction}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="lg:col-span-2 h-[500px] rounded-lg overflow-hidden border border-gray-300 relative z-0">
                    <MapContainer center={[26.85, 80.95]} zoom={9} style={{ height: '100%', width: '100%' }}>
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        />
                        {alerts.map((alert, idx) => {
                            const color = alert.info.severity === 'Extreme' ? 'red' : 'orange';

                            return (
                                <React.Fragment key={idx}>
                                    {alert.info.area.polygon && (
                                        <Polygon
                                            positions={alert.info.area.polygon}
                                            pathOptions={{ color: color, fillColor: color, fillOpacity: 0.3 }}
                                        >
                                            <Popup>
                                                <strong>{alert.info.headline}</strong><br />
                                                Severity: {alert.info.severity}
                                            </Popup>
                                        </Polygon>
                                    )}
                                    {alert.info.area.circle && (
                                        <Circle
                                            center={alert.info.area.circle[0]}
                                            radius={alert.info.area.circle[1] * 1000}
                                            pathOptions={{ color: color, fillColor: color, fillOpacity: 0.3 }}
                                        >
                                            <Popup>
                                                <strong>{alert.info.headline}</strong><br />
                                                Severity: {alert.info.severity}
                                            </Popup>
                                        </Circle>
                                    )}
                                </React.Fragment>
                            )
                        })}
                    </MapContainer>
                </div>
            </div>
        </div>
    );
};

export default CAPAlerts;
