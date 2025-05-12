import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { useAuthStore } from '../store/authStore';
import { mockSensorData, mockAlerts, mockMiners } from '../data/mockData';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { Download, Filter, Calendar } from 'lucide-react';

export function Reports() {
  const user = useAuthStore(state => state.user);
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [timeRange, setTimeRange] = useState('24h');
  
  const locations = [
    { id: 'all', name: 'All Locations' },
    { id: 'mine1', name: 'North Shaft Mine' },
    { id: 'mine2', name: 'Deep Core Mine' },
    { id: 'mine3', name: 'Eastern Tunnel' }
  ];

  const timeRanges = [
    { id: '24h', name: 'Last 24 Hours' },
    { id: '7d', name: 'Last 7 Days' },
    { id: '30d', name: 'Last 30 Days' },
    { id: '90d', name: 'Last 90 Days' }
  ];

  // Filter data based on user's mine assignment or selected location for admin
  const userMineId = user?.mineId;
  const selectedMineId = user?.role === 'admin' ? selectedLocation : userMineId;
  
  const alerts = user?.role === 'admin' && selectedLocation === 'all'
    ? Object.values(mockAlerts).flat()
    : selectedMineId
      ? mockAlerts[selectedMineId] || []
      : [];

  const sensorData = user?.role === 'admin' && selectedLocation === 'all'
    ? Object.values(mockSensorData).flat()
    : selectedMineId
      ? mockSensorData[selectedMineId] || []
      : [];

  // Generate analytics data
  const alertsByType = [
    { name: 'Critical', value: alerts.filter(a => a.type === 'critical').length },
    { name: 'Warning', value: alerts.filter(a => a.type === 'warning').length },
    { name: 'Info', value: alerts.filter(a => a.type === 'info').length }
  ];

  const sensorStatusData = [
    { name: 'Normal', value: sensorData.filter(s => s.status === 'normal').length },
    { name: 'Warning', value: sensorData.filter(s => s.status === 'warning').length },
    { name: 'Critical', value: sensorData.filter(s => s.status === 'critical').length }
  ];

  // Generate historical trend data
  const generateTrendData = () => {
    const hours = timeRange === '24h' ? 24 : 
                 timeRange === '7d' ? 168 :
                 timeRange === '30d' ? 720 : 2160;
    
    return Array.from({ length: 12 }, (_, i) => ({
      time: `${Math.floor(i * hours / 12)}h`,
      gas: Math.random() * 50,
      temperature: Math.random() * 40,
      seismic: Math.random() * 2,
      strain: Math.random() * 5
    }));
  };

  const trendData = generateTrendData();

  const COLORS = ['#2563eb', '#f59e0b', '#dc2626', '#10b981'];

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="ml-64 p-8">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Analytics Reports</h1>
              <p className="mt-1 text-gray-500">Comprehensive mining operation analytics</p>
            </div>
            <div className="flex gap-4">
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
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-4 py-2 border rounded-lg bg-white"
              >
                {timeRanges.map(range => (
                  <option key={range.id} value={range.id}>
                    {range.name}
                  </option>
                ))}
              </select>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                <Download className="w-4 h-4" />
                Export Report
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Alert Distribution</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={alertsByType}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {alertsByType.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Sensor Status Overview</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sensorStatusData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#2563eb" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
          <h2 className="text-lg font-semibold mb-4">Sensor Readings Trend</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="gas" stroke="#2563eb" name="Gas Levels (PPM)" />
                <Line type="monotone" dataKey="temperature" stroke="#f59e0b" name="Temperature (°C)" />
                <Line type="monotone" dataKey="seismic" stroke="#dc2626" name="Seismic Activity (Hz)" />
                <Line type="monotone" dataKey="strain" stroke="#10b981" name="Structural Strain (MPa)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Alert Summary</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Total Alerts</span>
                <span className="font-semibold">{alerts.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Critical Alerts</span>
                <span className="font-semibold text-red-500">
                  {alerts.filter(a => a.type === 'critical').length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Warning Alerts</span>
                <span className="font-semibold text-yellow-500">
                  {alerts.filter(a => a.type === 'warning').length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Info Alerts</span>
                <span className="font-semibold text-blue-500">
                  {alerts.filter(a => a.type === 'info').length}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Sensor Health</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Total Sensors</span>
                <span className="font-semibold">{sensorData.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Active Sensors</span>
                <span className="font-semibold text-green-500">
                  {sensorData.filter(s => s.status === 'normal').length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Warning Status</span>
                <span className="font-semibold text-yellow-500">
                  {sensorData.filter(s => s.status === 'warning').length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Critical Status</span>
                <span className="font-semibold text-red-500">
                  {sensorData.filter(s => s.status === 'critical').length}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Key Metrics</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Average Gas Level</span>
                <span className="font-semibold">
                  {(sensorData
                    .filter(s => s.type === 'gas')
                    .reduce((acc, curr) => acc + curr.value, 0) / 
                    sensorData.filter(s => s.type === 'gas').length || 0
                  ).toFixed(2)} PPM
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Average Temperature</span>
                <span className="font-semibold">
                  {(sensorData
                    .filter(s => s.type === 'temperature')
                    .reduce((acc, curr) => acc + curr.value, 0) / 
                    sensorData.filter(s => s.type === 'temperature').length || 0
                  ).toFixed(2)}°C
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Alert Response Time</span>
                <span className="font-semibold">15.3 min</span>
              </div>
              <div className="flex justify-between items-center">
                <span>System Uptime</span>
                <span className="font-semibold">99.9%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}