import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Smartphone, Signal, MapPin } from 'lucide-react';

const SMSFallback = ({ scenario }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await api.getSMSMessages(scenario);
                setData(response.data);
            } catch (error) {
                console.error("Error fetching SMS data:", error);
            } finally {
                setLoading(false);
            }
        };

        if (scenario) {
            fetchData();
        }
    }, [scenario]);

    if (loading) return <div className="text-center p-4">Loading SMS gateway data...</div>;
    if (!data) return null;

    return (
        <div className="space-y-6">
            <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
                <h4 className="text-sm font-semibold uppercase text-gray-500 mb-3">Network Status (Offline Areas)</h4>
                <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center">
                        <Signal className={`w-5 h-5 mr-3 ${parseInt(data.stats.processing_rate) > 90 ? 'text-green-500' : 'text-yellow-500'}`} />
                        <div>
                            <div className="text-2xl font-bold">{data.stats.processing_rate}</div>
                            <div className="text-xs text-gray-500">Processing Rate</div>
                        </div>
                    </div>
                    <div className="flex items-center">
                        <Smartphone className="w-5 h-5 mr-3 text-blue-500" />
                        <div>
                            <div className="text-2xl font-bold">{data.stats.active_towers}</div>
                            <div className="text-xs text-gray-500">Active Towers</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="font-semibold text-lg">Incoming SMS Reports</h3>
                {data.messages.map((msg, idx) => (
                    <div key={idx} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 border-l-4 border-l-orange-400">
                        <div className="flex justify-between items-start mb-2">
                            <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">ID: SMS-{1000 + idx}</span>
                            <span className="text-xs text-gray-400">{msg.timestamp}</span>
                        </div>
                        <p className="text-gray-800 font-medium mb-2">{msg.message}</p>
                        <div className="flex gap-2 text-xs">
                            <span className="flex items-center text-gray-500">
                                <MapPin className="w-3 h-3 mr-1" />
                                {msg.location}
                            </span>
                            <span className="bg-orange-100 text-orange-800 px-2 py-0.5 rounded">Priority: {msg.priority}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SMSFallback;
