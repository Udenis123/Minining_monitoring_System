import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { useAuthStore } from '../store/authStore';
import { mockSensorData, mockMines } from '../data/mockData';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Activity, ThermometerSun, Wind, Mountain, Filter } from 'lucide-react';

export function SensorMonitoring() {
  const user = useAuthStore(state => state.user);
  const [selectedMine, setSelectedMine] = useState(user?.mineId || 'all');
  const [selectedSector, setSelectedSector] = useState('all');
  const [trailData, setTrailData] = useState<{ [key: string]: { time: string; value: number }[] }>({});
  const [livePoint, setLivePoint] = useState<{ [key: string]: { time: string; value: number } }>({});

  const sectors = {
    'all': 'All Sectors',
    'sector-1': 'Sector A',
    'sector-2': 'Sector B',
    'sector-3': 'Sector C'
  };

  const sensorTypes = [
    { id: 'gas', name: 'Gas Levels', icon: Wind, unit: 'PPM', color: '#2563eb', sectorId: 'sector-1' },
    { id: 'temperature', name: 'Temperature', icon: ThermometerSun, unit: '°C', color: '#f59e0b', sectorId: 'sector-1' },
    { id: 'seismic', name: 'Seismic Activity', icon: Activity, unit: 'Hz', color: '#dc2626', sectorId: 'sector-1' },
    { id: 'strain', name: 'Structural Strain', icon: Mountain, unit: 'MPa', color: '#10b981', sectorId: 'sector-1' },
    { id: 'gas', name: 'Gas Levels', icon: Wind, unit: 'PPM', color: '#2563eb', sectorId: 'sector-2' },
    { id: 'temperature', name: 'Temperature', icon: ThermometerSun, unit: '°C', color: '#f59e0b', sectorId: 'sector-2' },
    { id: 'seismic', name: 'Seismic Activity', icon: Activity, unit: 'Hz', color: '#dc2626', sectorId: 'sector-2' },
    { id: 'strain', name: 'Structural Strain', icon: Mountain, unit: 'MPa', color: '#10b981', sectorId: 'sector-2' },
    { id: 'gas', name: 'Gas Levels', icon: Wind, unit: 'PPM', color: '#2563eb', sectorId: 'sector-3' },
    { id: 'temperature', name: 'Temperature', icon: ThermometerSun, unit: '°C', color: '#f59e0b', sectorId: 'sector-3' },
    { id: 'seismic', name: 'Seismic Activity', icon: Activity, unit: 'Hz', color: '#dc2626', sectorId: 'sector-3' },
    { id: 'strain', name: 'Structural Strain', icon: Mountain, unit: 'MPa', color: '#10b981', sectorId: 'sector-3' }
  ];

  // Generate historical data with more realistic patterns
  const generateHistoricalData = (type: string, hours: number = 24) => {
    const baseValue = type === 'gas' ? 25 : 
                     type === 'temperature' ? 28 :
                     type === 'seismic' ? 0.5 :
                     type === 'strain' ? 2 : 0;

    const variance = type === 'gas' ? 10 : 
                    type === 'temperature' ? 5 :
                    type === 'seismic' ? 0.3 :
                    type === 'strain' ? 0.5 : 0;

    return Array.from({ length: hours }, (_, i) => {
      const time = new Date();
      time.setHours(time.getHours() - (hours - i));
      
      // Add some periodic variation
      const periodicComponent = Math.sin(i / 6) * variance * 0.5;
      // Add some random noise
      const randomComponent = (Math.random() - 0.5) * variance * 0.3;
      // Add a trend component
      const trendComponent = (i / hours) * variance * 0.2;
      
      return {
        time: time.toLocaleTimeString(),
        value: baseValue + periodicComponent + randomComponent + trendComponent
      };
    });
  };

  useEffect(() => {
    const intervals: number[] = [];

    sensorTypes.forEach(sensor => {
      const interval = setInterval(() => {
        setLivePoint(prevPoint => {
          const newDataPoint = {
            time: new Date().toLocaleTimeString(),
            value: generateHistoricalData(sensor.id, 1)[0].value
          };
          // Update trail data with the new live point
          setTrailData(prevData => {
            const updatedTrail = [...(prevData[sensor.id] || []), newDataPoint].slice(-300); // Keep last 300 points (5 minutes of data)
            return { ...prevData, [sensor.id]: updatedTrail };
          });
          return { ...prevPoint, [sensor.id]: newDataPoint };
        });
      }, 1000); // Update every second

      intervals.push(interval);
    });

    return () => intervals.forEach(interval => clearInterval(interval));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="ml-64 p-8">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Sensor Monitoring</h1>
              <p className="mt-1 text-gray-500">Real-time sensor data and analytics</p>
            </div>
            <div className="flex gap-4">
              {user?.role === 'admin' && (
                <>
                  <select
                    value={selectedMine}
                    onChange={(e) => setSelectedMine(e.target.value)}
                    className="px-4 py-2 border rounded-lg bg-white"
                  >
                    <option value="all">All Mines</option>
                    {mockMines.map(mine => (
                      <option key={mine.id} value={mine.id}>
                        {mine.name}
                      </option>
                    ))}
                  </select>
                  <select
                    value={selectedSector}
                    onChange={(e) => setSelectedSector(e.target.value)}
                    className="px-4 py-2 border rounded-lg bg-white"
                  >
                    {Object.entries(sectors).map(([id, name]) => (
                      <option key={id} value={id}>
                        {name}
                      </option>
                    ))}
                  </select>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sensorTypes
            .filter(sensor => selectedSector === 'all' || sensor.sectorId === selectedSector) // Filter sensors by sector
            .map(sensor => {
              const data = [...(trailData[sensor.id] || []), livePoint[sensor.id]].filter(Boolean);
              const currentValue = livePoint[sensor.id]?.value || 0;
              const avgValue = data.reduce((acc, curr) => acc + curr.value, 0) / data.length;
              const maxValue = Math.max(...data.map(d => d.value));

              return (
                <div key={sensor.id} className="bg-white p-6 rounded-xl shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <sensor.icon className="w-6 h-6" style={{ color: sensor.color }} />
                      <h2 className="text-lg font-semibold">{sensor.name}</h2>
                    </div>
                    <div className="text-2xl font-bold" style={{ color: sensor.color }}>
                      {currentValue.toFixed(2)} {sensor.unit}
                    </div>
                  </div>

                  <div className="h-64 mb-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis 
                          dataKey="time"
                          tick={{ fontSize: 12 }}
                          tickFormatter={(time) => time.split(':').slice(0, 2).join(':')}
                        />
                        <YAxis 
                          tick={{ fontSize: 12 }}
                          domain={['auto', 'auto']}
                        />
                        <Tooltip
                          contentStyle={{ 
                            backgroundColor: 'white',
                            border: '1px solid #e5e7eb',
                            borderRadius: '0.5rem'
                          }}
                          formatter={(value: number) => [`${value.toFixed(2)} ${sensor.unit}`, sensor.name]}
                        />
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke={sensor.color}
                          strokeWidth={2}
                          dot={false}
                          activeDot={{ r: 4 }}
                          isAnimationActive={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-gray-500">Current</div>
                      <div className="font-semibold mt-1">
                        {currentValue.toFixed(2)} {sensor.unit}
                      </div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-gray-500">Average</div>
                      <div className="font-semibold mt-1">
                        {avgValue.toFixed(2)} {sensor.unit}
                      </div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-gray-500">Peak</div>
                      <div className="font-semibold mt-1">
                        {maxValue.toFixed(2)} {sensor.unit}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}