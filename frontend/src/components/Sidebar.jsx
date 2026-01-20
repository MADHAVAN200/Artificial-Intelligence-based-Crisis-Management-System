import React from 'react';
import { Settings, Map, AlertTriangle, Radio, Upload, Calendar, MapPin, Play } from 'lucide-react';

const Sidebar = ({
    scenario, setScenario,
    satelliteSource, setSatelliteSource,
    imageryDate, setImageryDate,
    locationInput, setLocationInput,
    analysisOptions, setAnalysisOptions,
    onRunAnalysis,
    onFetchImagery
}) => {
    return (
        <div className="w-80 bg-slate-900 text-white h-screen flex flex-col border-r border-slate-700 overflow-y-auto">
            <div className="p-6 border-b border-slate-700">
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                    AICMS Dashboard
                </h1>
                <p className="text-xs text-slate-400 mt-1">AI Humanitarian Coordination</p>
            </div>

            <div className="p-6 space-y-8">
                {/* Scenario Selection */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-blue-400 uppercase text-xs font-semibold tracking-wider">
                        <AlertTriangle size={14} />
                        <span>Disaster Scenario</span>
                    </div>
                    <select
                        value={scenario}
                        onChange={(e) => setScenario(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    >
                        <option>Simulated Flood</option>
                        <option>Simulated Earthquake</option>
                    </select>
                </div>

                {/* Satellite Source */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-blue-400 uppercase text-xs font-semibold tracking-wider">
                        <Radio size={14} />
                        <span>Satellite Source</span>
                    </div>
                    <select
                        value={satelliteSource}
                        onChange={(e) => setSatelliteSource(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                        <option>Upload Custom</option>
                        <option>Sentinel-2</option>
                        <option>NASA GIBS</option>
                        <option>Maxar Open Data</option>
                    </select>

                    {satelliteSource === "Upload Custom" ? (
                        <div className="border-2 border-dashed border-slate-700 rounded-lg p-4 text-center hover:border-blue-500 transition-colors cursor-pointer">
                            <Upload className="mx-auto text-slate-500 mb-2" size={20} />
                            <p className="text-xs text-slate-400">Click to upload imagery</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <div className="relative">
                                <Calendar className="absolute left-3 top-2.5 text-slate-500" size={16} />
                                <input
                                    type="date"
                                    value={imageryDate}
                                    onChange={(e) => setImageryDate(e.target.value)}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-2.5 text-slate-500" size={16} />
                                <input
                                    type="text"
                                    value={locationInput}
                                    onChange={(e) => setLocationInput(e.target.value)}
                                    placeholder="Lat, Lon"
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            <button
                                onClick={onFetchImagery}
                                className="w-full bg-slate-800 hover:bg-slate-700 text-blue-400 text-sm py-2 rounded-lg transition-colors border border-blue-900/30"
                            >
                                Fetch Imagery
                            </button>
                        </div>
                    )}
                </div>

                {/* Analysis Options */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-blue-400 uppercase text-xs font-semibold tracking-wider">
                        <Settings size={14} />
                        <span>Analysis Options</span>
                    </div>
                    <div className="space-y-3">
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${analysisOptions.damage ? 'bg-blue-500 border-blue-500' : 'border-slate-600 bg-slate-800'} `}>
                                {analysisOptions.damage && <div className="w-2 h-2 bg-white rounded-full" />}
                            </div>
                            <input
                                type="checkbox"
                                className="hidden"
                                checked={analysisOptions.damage}
                                onChange={(e) => setAnalysisOptions({ ...analysisOptions, damage: e.target.checked })}
                            />
                            <span className="text-sm text-slate-300 group-hover:text-white transition-colors">Damage Detection</span>
                        </label>

                        <label className="flex items-center gap-3 cursor-pointer group">
                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${analysisOptions.social ? 'bg-blue-500 border-blue-500' : 'border-slate-600 bg-slate-800'} `}>
                                {analysisOptions.social && <div className="w-2 h-2 bg-white rounded-full" />}
                            </div>
                            <input
                                type="checkbox"
                                className="hidden"
                                checked={analysisOptions.social}
                                onChange={(e) => setAnalysisOptions({ ...analysisOptions, social: e.target.checked })}
                            />
                            <span className="text-sm text-slate-300 group-hover:text-white transition-colors">Social Media Analysis</span>
                        </label>
                    </div>
                </div>
            </div>

            <div className="mt-auto p-6 border-t border-slate-700">
                <button
                    onClick={onRunAnalysis}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold py-3 rounded-xl shadow-lg shadow-blue-900/30 flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02]"
                >
                    <Play size={18} fill="currentColor" />
                    Run Analysis
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
