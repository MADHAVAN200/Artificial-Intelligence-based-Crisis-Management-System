import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';

import { api } from './services/api';

function App() {
  const [scenario, setScenario] = useState("Simulated Flood");
  const [satelliteSource, setSatelliteSource] = useState("Sentinel-2");
  const [imageryDate, setImageryDate] = useState(new Date().toISOString().split('T')[0]);
  const [locationInput, setLocationInput] = useState("26.85, 80.95");
  const [analysisOptions, setAnalysisOptions] = useState({
    damage: true,
    social: true
  });
  const [activeTab, setActiveTab] = useState("map");

  // Data State
  const [satelliteImage, setSatelliteImage] = useState(null);
  const [overlayBounds, setOverlayBounds] = useState(null);
  const [damageOverlay, setDamageOverlay] = useState(null);
  const [damageStats, setDamageStats] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleFetchImagery = async () => {
    try {
      const { data } = await api.fetchSatelliteImagery({
        source: satelliteSource,
        date: imageryDate,
        location: locationInput
      });
      setSatelliteImage(data.image);
      setOverlayBounds(data.bounds);
    } catch (error) {
      console.error("Error fetching imagery", error);
      alert("Failed to fetch satellite imagery");
    }
  };

  const handleRunAnalysis = async () => {
    if (!satelliteImage) {
      alert("Please fetch satellite imagery first!");
      return;
    }

    setIsAnalyzing(true);
    try {
      if (analysisOptions.damage) {
        const { data } = await api.detectDamage({
          image: satelliteImage,
          scenario: scenario
        });
        setDamageOverlay(data.overlay);
        setDamageStats({ percentage: data.percentage, details: data.details });
        setActiveTab('damage'); // Switch to damage tab
      }
      // Add other analysis logic here
    } catch (error) {
      console.error("Error running analysis", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Override Sidebar's fetch button logic. 
  // We need to pass handleFetchImagery to logic inside Sidebar or create a new prop there.
  // Sidebar currently calls 'onRunAnalysis' for the big button.
  // The fetch button inside Sidebar is just a button. We need to hook it up.


  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans text-slate-900">
      <Sidebar
        scenario={scenario} setScenario={setScenario}
        satelliteSource={satelliteSource} setSatelliteSource={setSatelliteSource}
        imageryDate={imageryDate} setImageryDate={setImageryDate}
        locationInput={locationInput} setLocationInput={setLocationInput}
        analysisOptions={analysisOptions} setAnalysisOptions={setAnalysisOptions}
        onRunAnalysis={handleRunAnalysis}
        onFetchImagery={handleFetchImagery}
      />

      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <div className="absolute inset-0 bg-grid-slate-200/50 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] pointer-events-none" />

        <div className="flex-1 overflow-y-auto z-10">
          <header className="px-8 py-6 border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-20">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Mission Control</h2>
                <p className="text-slate-500 text-sm mt-1 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  System Operational • {scenario}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="px-3 py-1 bg-red-50 text-red-600 text-xs font-semibold rounded-full border border-red-100 flex items-center gap-1">
                  LIVE INCIDENT
                </div>
              </div>
            </div>
          </header>

          <div className="p-8">
            <Dashboard
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              scenario={scenario}
              satelliteImage={satelliteImage}
              overlayBounds={overlayBounds}
              damageOverlay={damageOverlay}
              damageStats={damageStats}
              onRunDetection={handleRunAnalysis}
              isAnalyzing={isAnalyzing}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
