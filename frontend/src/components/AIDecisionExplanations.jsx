import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Activity, AlertTriangle, Route, BarChart2 } from 'lucide-react';

const AIDecisionExplanations = ({ scenario }) => {
    const [explanations, setExplanations] = useState(null);

    useEffect(() => {
        const fetchExplanations = async () => {
            try {
                const response = await api.getAIExplanations(scenario);
                setExplanations(response.data);
            } catch (error) {
                console.error("Error fetching AI explanations:", error);
            }
        };

        if (scenario) {
            fetchExplanations();
        }
    }, [scenario]);

    if (!explanations) return null;

    return (
        <div className="bg-white rounded-lg shadow p-6 mb-8 border border-gray-200">
            <h2 className="text-xl font-bold mb-4 flex items-center text-gray-800">
                <Activity className="w-5 h-5 mr-2 text-blue-600" />
                AI Decision Explanations
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-blue-50 p-4 rounded-md border-l-4 border-blue-500">
                    <h3 className="font-semibold text-blue-800 flex items-center mb-2">
                        <BarChart2 className="w-4 h-4 mr-2" />
                        Damage Assessment Factors
                    </h3>
                    <ul className="text-sm space-y-1 text-blue-900">
                        <li><strong>Severity:</strong> {explanations.damage_assessment.severity}</li>
                        <li><strong>Reasoning:</strong> {explanations.damage_assessment.reasoning}</li>
                        <li><strong>Confidence:</strong> {explanations.damage_assessment.confidence}</li>
                    </ul>
                </div>

                <div className="bg-green-50 p-4 rounded-md border-l-4 border-green-500">
                    <h3 className="font-semibold text-green-800 flex items-center mb-2">
                        <Activity className="w-4 h-4 mr-2" />
                        Resource Allocation
                    </h3>
                    <ul className="text-sm space-y-1 text-green-900">
                        <li><strong>Priority:</strong> {explanations.resource_allocation.priority}</li>
                        <li><strong>Reasoning:</strong> {explanations.resource_allocation.reasoning}</li>
                        <li><strong>Action:</strong> {explanations.resource_allocation.action}</li>
                    </ul>
                </div>

                <div className="bg-yellow-50 p-4 rounded-md border-l-4 border-yellow-500">
                    <h3 className="font-semibold text-yellow-800 flex items-center mb-2">
                        <Route className="w-4 h-4 mr-2" />
                        Routing Optimization
                    </h3>
                    <ul className="text-sm space-y-1 text-yellow-900">
                        <li><strong>Status:</strong> {explanations.routing.status}</li>
                        <li><strong>Reasoning:</strong> {explanations.routing.reasoning}</li>
                        <li><strong>Impact:</strong> {explanations.routing.impact}</li>
                    </ul>
                </div>

                <div className="bg-purple-50 p-4 rounded-md border-l-4 border-purple-500">
                    <h3 className="font-semibold text-purple-800 flex items-center mb-2">
                        <AlertTriangle className="w-4 h-4 mr-2" />
                        Predictive Analysis
                    </h3>
                    <ul className="text-sm space-y-1 text-purple-900">
                        <li><strong>Forecast (24h):</strong> {explanations.prediction.next_24h}</li>
                        <li><strong>Affected Population:</strong> {explanations.prediction.affected_population}</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default AIDecisionExplanations;
