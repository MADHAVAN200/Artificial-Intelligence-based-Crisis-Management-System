import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, ImageOverlay, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { api } from '../services/api';

// Fix Leaflet icon issue
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Component to handle map view updates
function MapUpdater({ center, zoom }) {
    const map = useMap();
    useEffect(() => {
        map.setView(center, zoom);
    }, [center, zoom, map]);
    return null;
}

const CrisisMap = ({ scenario, satelliteSource, imageryDate, locationInput, overlayImage, overlayBounds }) => {
    const [mapCenter, setMapCenter] = useState([26.85, 80.95]);
    const [zoom, setZoom] = useState(10);
    const [priorityZones, setPriorityZones] = useState([]);

    useEffect(() => {
        // Simulate priority zones based on scenario
        const generateZones = () => {
            const zones = [];
            for (let i = 0; i < 5; i++) {
                zones.push({
                    id: i,
                    lat: 26.9 + (Math.random() * 0.2 - 0.1),
                    lon: 80.95 + (Math.random() * 0.2 - 0.1),
                    severity: Math.floor(Math.random() * 30) + 70
                });
            }
            setPriorityZones(zones);
        };
        generateZones();
    }, [scenario]);

    return (
        <div className="relative h-[600px] w-full rounded-xl overflow-hidden shadow-sm border border-slate-200 z-0">
            <MapContainer
                center={mapCenter}
                zoom={zoom}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={true}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <MapUpdater center={mapCenter} zoom={zoom} />

                {/* Priority Zones */}
                {priorityZones.map((zone) => (
                    <CircleMarker
                        key={zone.id}
                        center={[zone.lat, zone.lon]}
                        pathOptions={{
                            color: zone.severity > 85 ? 'red' : 'orange',
                            fillColor: zone.severity > 85 ? 'red' : 'orange',
                            fillOpacity: 0.6
                        }}
                        radius={10}
                    >
                        <Popup>
                            <div className="text-center">
                                <h3 className="font-bold text-sm">Zone {zone.id}</h3>
                                <p className="text-xs">Severity: {zone.severity}</p>
                            </div>
                        </Popup>
                    </CircleMarker>
                ))}

                {/* Satellite Overlay */}
                {overlayImage && overlayBounds && (
                    <ImageOverlay
                        url={overlayImage}
                        bounds={[
                            [overlayBounds[0], overlayBounds[1]], // lat, lon
                            [overlayBounds[2], overlayBounds[3]]  // lat, lon
                        ]}
                        opacity={0.7}
                    />
                )}
            </MapContainer>

            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-md max-w-xs z-[1000]">
                <h4 className="text-xs font-bold uppercase text-slate-500 mb-2">Priority Legend</h4>
                <div className="flex items-center gap-2 mb-1">
                    <div className="w-3 h-3 rounded-full bg-red-500 opacity-80" />
                    <span className="text-xs">Critical (Sev. &gt; 85)</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-orange-500 opacity-80" />
                    <span className="text-xs">High (Sev. &gt; 70)</span>
                </div>
            </div>
        </div>
    );
};

export default CrisisMap;
