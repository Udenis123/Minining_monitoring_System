import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import { AlertTriangle, User, Activity } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in React-Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MineMapProps {
  mineId: string;
  width?: number;
  height?: number;
}

// Component to handle location updates
function LocationUpdater({ onLocationUpdate }: { onLocationUpdate: (lat: number, lng: number) => void }) {
  const map = useMap();

  useEffect(() => {
    map.locate({ watch: true, enableHighAccuracy: true });

    map.on('locationfound', (e) => {
      onLocationUpdate(e.latlng.lat, e.latlng.lng);
      map.setView(e.latlng, map.getZoom());
    });

    return () => {
      map.stopLocate();
    };
  }, [map, onLocationUpdate]);

  return null;
}

// Mine locations with additional data
const mineLocations: Record<string, {
  lat: number;
  lng: number;
  name: string;
  radius: number;
  depth: number;
  sensors: Array<{
    type: string;
    location: string;
    status: 'normal' | 'warning' | 'danger';
  }>;
  personnel: number;
}> = {
  'mine1': {
    lat: 51.5074,
    lng: -0.1278,
    name: 'North Shaft Mine',
    radius: 500,
    depth: 450,
    sensors: [
      { type: 'gas', location: 'Main Shaft', status: 'normal' },
      { type: 'temperature', location: 'Level 1', status: 'warning' },
      { type: 'seismic', location: 'Deep Level', status: 'normal' }
    ],
    personnel: 24
  },
  'mine2': {
    lat: 51.5174,
    lng: -0.1378,
    name: 'Deep Core Mine',
    radius: 750,
    depth: 800,
    sensors: [
      { type: 'gas', location: 'Ventilation Shaft', status: 'danger' },
      { type: 'temperature', location: 'Level 2', status: 'normal' },
      { type: 'seismic', location: 'Core Area', status: 'warning' }
    ],
    personnel: 32
  },
  'mine3': {
    lat: 51.5274,
    lng: -0.1478,
    name: 'Eastern Tunnel',
    radius: 300,
    depth: 250,
    sensors: [
      { type: 'gas', location: 'Main Tunnel', status: 'normal' },
      { type: 'temperature', location: 'Work Face', status: 'normal' },
      { type: 'seismic', location: 'Support Area', status: 'normal' }
    ],
    personnel: 18
  }
};

export function MineMap({ mineId }: MineMapProps) {
  const [currentLocation, setCurrentLocation] = useState<[number, number] | null>(null);
  const mineLocation = mineLocations[mineId] || mineLocations['mine1'];

  const getStatusColor = (status: 'normal' | 'warning' | 'danger') => {
    switch (status) {
      case 'normal':
        return '#10B981';
      case 'warning':
        return '#F59E0B';
      case 'danger':
        return '#EF4444';
      default:
        return '#10B981';
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg">
      <div className="mb-4">
        <h3 className="font-semibold text-lg">{mineLocation.name} Overview</h3>
        <div className="text-sm text-gray-500 mt-1">
          Depth: {mineLocation.depth}m | Active Personnel: {mineLocation.personnel}
        </div>
      </div>

      {/* Live GPS Map */}
      <div className="h-96 rounded-lg overflow-hidden border mb-4">
        <MapContainer
          center={[mineLocation.lat, mineLocation.lng]}
          zoom={14}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* Mine operation area */}
          <Circle
            center={[mineLocation.lat, mineLocation.lng]}
            radius={mineLocation.radius}
            pathOptions={{
              color: '#2563EB',
              fillColor: '#3B82F6',
              fillOpacity: 0.2
            }}
          >
            <Popup>
              <div className="p-2">
                <h4 className="font-semibold">{mineLocation.name}</h4>
                <p className="text-sm text-gray-600">Operational Area</p>
                <p className="text-sm text-gray-600">Radius: {mineLocation.radius}m</p>
              </div>
            </Popup>
          </Circle>

          {/* Mine center marker */}
          <Marker position={[mineLocation.lat, mineLocation.lng]}>
            <Popup>
              <div className="p-2">
                <h4 className="font-semibold">{mineLocation.name}</h4>
                <p className="text-sm text-gray-600">Depth: {mineLocation.depth}m</p>
                <p className="text-sm text-gray-600">Personnel: {mineLocation.personnel}</p>
              </div>
            </Popup>
          </Marker>

          {/* Current location marker */}
          {currentLocation && (
            <Marker position={currentLocation}>
              <Popup>
                <div className="p-2">
                  <h4 className="font-semibold">Your Location</h4>
                  <p className="text-sm text-gray-600">
                    Lat: {currentLocation[0].toFixed(4)}°<br />
                    Lng: {currentLocation[1].toFixed(4)}°
                  </p>
                </div>
              </Popup>
            </Marker>
          )}

          <LocationUpdater onLocationUpdate={(lat, lng) => setCurrentLocation([lat, lng])} />
        </MapContainer>
      </div>

      {/* Sensor Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {mineLocation.sensors.map((sensor, index) => (
          <div
            key={index}
            className="p-4 rounded-lg border"
            style={{ borderColor: getStatusColor(sensor.status) }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium capitalize">{sensor.type} Sensor</span>
              <span
                className={`px-2 py-1 rounded-full text-sm ${
                  sensor.status === 'normal' ? 'bg-green-100 text-green-800' :
                  sensor.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}
              >
                {sensor.status}
              </span>
            </div>
            <p className="text-sm text-gray-500">{sensor.location}</p>
          </div>
        ))}
      </div>
    </div>
  );
}