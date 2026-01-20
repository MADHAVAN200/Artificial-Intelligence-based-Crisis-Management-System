import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { MessageCircle, MapPin, AlertCircle } from 'lucide-react';

const SocialMediaAnalysis = ({ scenario }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await api.getSocialMedia(scenario);
                setData(response.data);
            } catch (error) {
                console.error("Error fetching social media data:", error);
            } finally {
                setLoading(false);
            }
        };

        if (scenario) {
            fetchData();
        }
    }, [scenario]);

    if (loading) return <div className="text-center p-4">Analyzing social signals...</div>;
    if (!data) return null;

    // Simple aggregation for chart (simulated)
    const needsCount = data.reduce((acc, curr) => {
        acc[curr.need] = (acc[curr.need] || 0) + 1;
        return acc;
    }, {});

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                    <h3 className="font-semibold text-lg flex items-center">
                        <MessageCircle className="w-5 h-5 mr-2 text-blue-500" />
                        Detected Distress Calls
                    </h3>
                    {data.map((post, idx) => (
                        <div key={idx} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                            <p className="text-gray-800 mb-3 italic">"{post.text}"</p>
                            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                <span className="flex items-center bg-gray-100 px-2 py-1 rounded">
                                    <MapPin className="w-4 h-4 mr-1 text-gray-500" />
                                    {post.location}
                                </span>
                                <span className="flex items-center bg-red-50 text-red-700 px-2 py-1 rounded border border-red-100">
                                    <AlertCircle className="w-4 h-4 mr-1" />
                                    Need: {post.need}
                                </span>
                                <span className="text-xs self-center ml-auto text-gray-400">{post.timestamp}</span>
                            </div>
                        </div>
                    ))}
                </div>

                <div>
                    <h3 className="font-semibold text-lg mb-4">Needs Assessment</h3>
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                        <div className="space-y-3">
                            {Object.entries(needsCount).map(([need, count]) => (
                                <div key={need}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span>{need}</span>
                                        <span className="font-medium">{count} mentions</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-blue-600 h-2 rounded-full"
                                            style={{ width: `${(count / data.length) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SocialMediaAnalysis;
