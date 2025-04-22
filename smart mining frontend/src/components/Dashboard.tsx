import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { StatusCard } from './StatusCard';
import { AlertsList } from './AlertsList';
import { useAuthStore } from '../store/authStore';
import { mockSensorData, mockAlerts, mockMiners } from '../data/mockData';
import { Activity, ThermometerSun, Wind, Mountain } from 'lucide-react';

export function Dashboard() {
  const user = useAuthStore(state => state.user);
  const [selectedLocation, setSelectedLocation] = useState('all');
  
  const locations = [
    { id: 'all', name: 'All Locations' },
    { id: 'mine1', name: 'North Shaft Mine' },
    { id: 'mine2', name: 'Deep Core Mine' },
    { id: 'mine3', name: 'Eastern Tunnel' }
  ];

  // Filter data based on user's mine assignment or selected location for admin
  const userMineId = user?.mineId;
  const selectedMineId = user?.role === 'admin' ? selectedLocation : userMineId;
  
  const sensorData = user?.role === 'admin' && selectedLocation === 'all'
    ? Object.values(mockSensorData).flat()
    : selectedMineId
      ? mockSensorData[selectedMineId] || []
      : [];
  
  const alerts = user?.role === 'admin' && selectedLocation === 'all'
    ? Object.values(mockAlerts).flat()
    : selectedMineId
      ? mockAlerts[selectedMineId] || []
      : [];

  const miners = user?.role === 'admin' && selectedLocation === 'all'
    ? Object.values(mockMiners).flat()
    : selectedMineId
      ? mockMiners[selectedMineId] || []
      : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="ml-64 p-8">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Mining Operations Dashboard</h1>
              <p className="mt-1 text-gray-500">
                Welcome, {user?.name} ({user?.role})
              </p>
            </div>
            {user?.role === 'admin' && (
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="px-4 py-2 border rounded-lg bg-white"
              >
                {locations.map(location => (
                  <option key={location.id} value={location.id}>
                    {location.name}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          <div className="lg:col-span-1">
            <StatusCard
              title="Gas Levels"
              value={`${sensorData.find(s => s.type === 'gas')?.value || 0} PPM`}
              status="normal"
              icon={Wind}
            />
          </div>
          <div className="lg:col-span-1">
            <StatusCard
              title="Temperature"
              value={`${sensorData.find(s => s.type === 'temperature')?.value || 0}°C`}
              status="normal"
              icon={ThermometerSun}
            />
          </div>
          <div className="lg:col-span-1">
            <StatusCard
              title="Seismic Activity"
              value={`${(sensorData.find(s => s.type === 'seismic')?.value || 0).toFixed(2)} Hz`}
              status="normal"
              icon={Activity}
            />
          </div>
          <div className="lg:col-span-1">
            <StatusCard
              title="Structural Strain"
              value={`${(sensorData.find(s => s.type === 'strain')?.value || 0).toFixed(2)} MPa`}
              status="normal"
              icon={Mountain}
            />
          </div>
          <div className="lg:col-span-1">
            <StatusCard
              title="Active Miners"
              value={miners.filter(m => m.status === 'active').length}
              status="normal"
            />
          </div>
          <div className="lg:col-span-1">
            <StatusCard
              title="Active Alerts"
              value={alerts.filter(a => !a.acknowledged).length}
              status={alerts.some(a => a.type === 'critical') ? 'critical' : 'normal'}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Mine Overview</h2>
            <img
              src="https://images.unsplash.com/photo-1581093458791-9f3c3250a8b0?auto=format&fit=crop&w=800&q=80"
              alt="Mine Map"
              className="w-full h-64 object-cover rounded-lg"
            />
          </div>
          <AlertsList alerts={alerts} />
        </div>
      </div>
    </div>
  );
}