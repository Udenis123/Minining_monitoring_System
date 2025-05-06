import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import { AlertTriangle, User, Activity } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { mockMines, mockSensorData } from '../data/mockData';

// Fix for default marker icons in React-Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MineMapProps {
  mineId: string;
  selectedSector: string;
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

export function MineMap({ mineId, selectedSector }: MineMapProps) {
  const [currentLocation, setCurrentLocation] = useState<[number, number] | null>(null);
  const mine = mockMines.find(m => m.id === mineId) || mockMines[0];
  const sensorData = mockSensorData[mineId] || [];

  // Update the filtering logic to handle 'all' sectors case
  const filteredSensorData = selectedSector 
    ? sensorData.filter(sensor => sensor.sectorId === selectedSector)
    : sensorData;

  // Group sensors by type and get their status
  const sensorsByType = filteredSensorData.reduce((acc, sensor) => {
    if (!acc[sensor.type]) {
      acc[sensor.type] = {
        type: sensor.type,
        location: sensor.location,
        status: sensor.status
      };
    } else if (sensor.status === 'warning' || sensor.status === 'critical') {
      // Prioritize warning/critical status
      acc[sensor.type].status = sensor.status;
    }
    return acc;
  }, {} as Record<string, { type: string; location: string; status: string }>);

  const sensors = Object.values(sensorsByType);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal':
        return '#10B981';
      case 'warning':
        return '#F59E0B';
      case 'critical':
        return '#EF4444';
      default:
        return '#10B981';
    }
  };

  // Find the selected sector object
  const currentSector = mine.sectors.find(s => s.id === selectedSector);

  return (
    <div className="bg-white p-4 rounded-lg">
      <div className="mb-4">
        <h3 className="font-semibold text-lg">{mine.name} Overview</h3>
        <div className="text-sm text-gray-500 mt-1">
          Depth: {mine.depth}m | Active Personnel: {filteredSensorData.length}
          {currentSector && ` | ${currentSector.name}`}
        </div>
      </div>

      {/* Live GPS Map */}
      <div className="h-96 rounded-lg overflow-hidden border mb-4">
        <MapContainer
          center={[mine.coordinates.lat, mine.coordinates.lng]}
          zoom={14}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* Mine operation area */}
          <Circle
            center={[mine.coordinates.lat, mine.coordinates.lng]}
            radius={500} // Using a default radius of 500m
            pathOptions={{
              color: '#2563EB',
              fillColor: '#3B82F6',
              fillOpacity: 0.2
            }}
          >
            <Popup>
              <div className="p-2">
                <h4 className="font-semibold">{mine.name}</h4>
                <p className="text-sm text-gray-600">Operational Area</p>
                <p className="text-sm text-gray-600">Status: {mine.status}</p>
              </div>
            </Popup>
          </Circle>

          {/* Mine center marker */}
          <Marker position={[mine.coordinates.lat, mine.coordinates.lng]}>
            <Popup>
              <div className="p-2">
                <h4 className="font-semibold">{mine.name}</h4>
                <p className="text-sm text-gray-600">Depth: {mine.depth}m</p>
                <p className="text-sm text-gray-600">Status: {mine.status}</p>
                {currentSector && (
                  <p className="text-sm text-gray-600">
                    Sector: {currentSector.name}
                  </p>
                )}
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
        {sensors.map((sensor, index) => (
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