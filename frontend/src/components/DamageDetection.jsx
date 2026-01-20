import React from 'react';
import { AlertCircle, ArrowRight } from 'lucide-react';

const DamageDetection = ({ satelliteImage, damageOverlay, damageStats, scenario, onRunDetection, isLoading }) => {
    if (!satelliteImage) {
        return (
            <div className="h-96 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
                <AlertCircle size={48} className="mb-4 text-slate-300" />
                <p className="font-medium">No Satellite Imagery Available</p>
                <p className="text-sm mt-2">Please fetch imagery from the sidebar first</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex items-start justify-between">
                <div>
                    <h2 className="text-lg font-bold text-slate-800">AI Damage Assessment</h2>
                    <p className="text-sm text-slate-500">Comparing pre and post-disaster imagery</p>
                </div>
                {!damageOverlay && (
                    <button
                        onClick={onRunDetection}
                        disabled={isLoading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                        {isLoading ? 'Analyzing...' : 'Run Detection Model'}
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Original */}
                <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Original Imagery</h3>
                    <div className="aspect-square rounded-xl overflow-hidden border border-slate-200 shadow-sm relative group">
                        <img src={satelliteImage} alt="Original Satellite" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                    </div>
                </div>

                {/* Damage Overlay */}
                <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Damage Overlay</h3>
                    {damageOverlay ? (
                        <div className="aspect-square rounded-xl overflow-hidden border border-slate-200 shadow-sm relative">
                            {/* Composite view: background image + overlay */}
                            <div className="relative w-full h-full">
                                <img src={satelliteImage} alt="Background" className="absolute inset-0 w-full h-full object-cover" />
                                <img src={damageOverlay} alt="Damage Overlay" className="absolute inset-0 w-full h-full object-cover opacity-80 mix-blend-multiply" />
                            </div>

                            {/* Stats Badge */}
                            <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur px-4 py-3 rounded-lg shadow-lg border border-red-100">
                                <p className="text-xs text-slate-500 uppercase font-bold">Damage Coverage</p>
                                <p className="text-2xl font-bold text-red-600">{damageStats.percentage}%</p>
                            </div>
                        </div>
                    ) : (
                        <div className="aspect-square rounded-xl bg-slate-100 flex flex-col items-center justify-center text-slate-400 border border-slate-200">
                            {isLoading ? (
                                <div className="animate-pulse flex flex-col items-center">
                                    <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-2" />
                                    <span>Processing...</span>
                                </div>
                            ) : (
                                <>
                                    <ArrowRight size={32} className="mb-2 opacity-50" />
                                    <span>Run detection to view analysis</span>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {damageStats && (
                <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                    <h3 className="font-semibold text-slate-800 mb-4">Detailed Impact Analysis</h3>
                    {damageStats.details ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {Object.entries(damageStats.details).map(([key, value], idx) => (
                                <div key={idx} className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                                    <div className="text-xs text-slate-500 uppercase font-semibold mb-1">{key}</div>
                                    <div className="text-xl font-bold text-slate-800">{value}</div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {scenario === 'Simulated Flood' ? (
                                <>
                                    <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
                                        <h4 className="font-semibold text-blue-800 text-sm mb-1">🌊 Flood Extent</h4>
                                        <p className="text-sm text-blue-600">High water levels detected in low-lying residential zones.</p>
                                    </div>
                                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                                        <h4 className="font-semibold text-slate-800 text-sm mb-1">🛣️ Infrastructure</h4>
                                        <p className="text-sm text-slate-600">Major roadways potentially compromised by water logging.</p>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="p-4 bg-red-50 border border-red-100 rounded-lg">
                                        <h4 className="font-semibold text-red-800 text-sm mb-1">🏚️ Structural Damage</h4>
                                        <p className="text-sm text-red-600">Seismic activity caused significant structural stress in Sector 4.</p>
                                    </div>
                                    <div className="p-4 bg-orange-50 border border-orange-100 rounded-lg">
                                        <h4 className="font-semibold text-orange-800 text-sm mb-1">🔥 Secondary Hazards</h4>
                                        <p className="text-sm text-orange-600">Potential fire risks identified near industrial zones.</p>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default DamageDetection;
