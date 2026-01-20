import React from 'react';
import { Map, Zap, MessageSquare, Radio, Bell, Navigation, Car, Home } from 'lucide-react';
import CrisisMap from './CrisisMap';
import DamageDetection from './DamageDetection';
import SocialMediaAnalysis from './SocialMediaAnalysis';
import SMSFallback from './SMSFallback';
import CAPAlerts from './CAPAlerts';
import RoutingOptimization from './RoutingOptimization';
import EvacuationRoutes from './EvacuationRoutes';
import ShelterLocator from './ShelterLocator';
import AIDecisionExplanations from './AIDecisionExplanations';

const tabs = [
    { id: 'map', label: 'Crisis Map', icon: Map },
    { id: 'damage', label: 'Damage Detection', icon: Zap },
    { id: 'social', label: 'Social Media', icon: MessageSquare },
    { id: 'sms', label: 'SMS Fallback', icon: Radio },
    { id: 'alerts', label: 'CAP Alerts', icon: Bell },
    { id: 'routing', label: 'Routing', icon: Navigation },
    { id: 'evac', label: 'Evacuation', icon: Car },
    { id: 'shelter', label: 'Shelters', icon: Home },
];

const Dashboard = ({ activeTab, setActiveTab, scenario, satelliteImage, overlayBounds, damageOverlay, damageStats, onRunDetection, isAnalyzing }) => {
    return (
        <div className="space-y-6">

            <AIDecisionExplanations scenario={scenario} />

            {/* Tabs */}
            <div className="flex items-center gap-1 border-b border-slate-200 overflow-x-auto pb-1">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`
                flex items-center gap-2 px-4 py-2.5 rounded-t-lg text-sm font-medium transition-all whitespace-nowrap
                ${isActive
                                    ? 'bg-white text-blue-600 border-b-2 border-blue-600 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                                }
              `}
                        >
                            <Icon size={16} />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Content Area */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 min-h-[500px]">
                {activeTab === 'map' && (
                    <CrisisMap
                        scenario={scenario}
                        overlayImage={satelliteImage}
                        overlayBounds={overlayBounds}
                    />
                )}
                {activeTab === 'damage' && (
                    <DamageDetection
                        satelliteImage={satelliteImage}
                        damageOverlay={damageOverlay}
                        damageStats={damageStats}
                        scenario={scenario}
                        onRunDetection={onRunDetection}
                        isLoading={isAnalyzing}
                    />
                )}
                {activeTab === 'social' && <SocialMediaAnalysis scenario={scenario} />}
                {activeTab === 'sms' && <SMSFallback scenario={scenario} />}
                {activeTab === 'alerts' && <CAPAlerts scenario={scenario} />}
                {activeTab === 'routing' && <RoutingOptimization scenario={scenario} />}
                {activeTab === 'evac' && <EvacuationRoutes scenario={scenario} />}
                {activeTab === 'shelter' && <ShelterLocator />}
            </div>
        </div>
    );
};

export default Dashboard;

