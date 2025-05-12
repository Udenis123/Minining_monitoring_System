import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { useAuthStore } from '../store/authStore';
import { mockMines } from '../data/mockData';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, HeatMapGrid } from 'recharts';
import { AlertTriangle, ThermometerSun, Activity, Mountain, Wind, Brain, Calendar, Filter, Download } from 'lucide-react';
import { format, addDays, addHours } from 'date-fns';

export function PredictiveData() {
  const user = useAuthStore(state => state.user);
  const [selectedMine, setSelectedMine] = useState(user?.mineId || 'all');
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedZone, setSelectedZone] = useState('all');

  const zones = ['all', 'Zone A', 'Zone B', 'Zone C', 'Zone D'];
  const timeRanges = [
    { id: '24h', name: 'Next 24 Hours' },
    { id: '7d', name: 'Next 7 Days' },
    { id: '30d', name: 'Next 30 Days' }
  ];

  // Generate predictive data for risk cards
  const riskPredictions = {
    gas: {
      level: 'High',
      nextEvent: 'Methane levels expected to exceed 25% in 6 hours',
      confidence: 85,
      trend: 'increasing'
    },
    seismic: {
      level: 'Medium',
      nextEvent: 'Minor seismic activity predicted in Zone B within 48 hours',
      confidence: 78,
      trend: 'stable'
    },
    structural: {
      level: 'Low',
      nextEvent: 'No significant structural issues predicted in next 7 days',
      confidence: 92,
      trend: 'stable'
    },
    temperature: {
      level: 'Critical',
      nextEvent: 'Temperature spike expected in Zone C within 12 hours',
      confidence: 88,
      trend: 'increasing'
    }
  };

  // Generate forecast data
  const generateForecastData = (days: number) => {
    return Array.from({ length: days }, (_, i) => {
      const date = addDays(new Date(), i);
      return {
        date: format(date, 'MMM dd'),
        methane: 15 + Math.sin(i / 2) * 5 + Math.random() * 2,
        co2: 8 + Math.cos(i / 3) * 3 + Math.random() * 1.5,
        o2: 20.9 - Math.sin(i / 4) * 1 + Math.random() * 0.5,
        temperature: 25 + Math.sin(i / 2) * 3 + Math.random() * 1
      };
    });
  };

  // Generate seismic forecast data
  const generateSeismicData = (days: number) => {
    return Array.from({ length: days }, (_, i) => {
      const date = addDays(new Date(), i);
      return {
        date: format(date, 'MMM dd'),
        magnitude: Math.random() * 2 + Math.sin(i / 5) * 0.5,
        risk: Math.random() * 100
      };
    });
  };

  // Generate structural stress data
  const generateStressData = (hours: number) => {
    return Array.from({ length: hours }, (_, i) => {
      const time = addHours(new Date(), i);
      return {
        time: format(time, 'HH:mm'),
        stress: 45 + Math.sin(i / 12) * 15 + Math.random() * 5,
        threshold: 75
      };
    });
  };

  const getRiskColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="ml-64 p-8">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Predictive Analytics</h1>
              <p className="mt-1 text-gray-500">AI-powered predictions and risk analysis</p>
            </div>
            <div className="flex gap-4">
              {user?.role === 'admin' && (
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
              <select
                value={selectedZone}
                onChange={(e) => setSelectedZone(e.target.value)}
                className="px-4 py-2 border rounded-lg bg-white"
              >
                {zones.map(zone => (
                  <option key={zone} value={zone}>
                    {zone === 'all' ? 'All Zones' : zone}
                  </option>
                ))}
              </select>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                <Download className="w-4 h-4" />
                Export Predictions
              </button>
            </div>
          </div>
        </div>

        {/* Risk Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {Object.entries(riskPredictions).map(([key, data]) => (
            <div key={key} className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold capitalize">{key} Risk</h3>
                <span className={`px-3 py-1 rounded-full text-sm ${getRiskColor(data.level)}`}>
                  {data.level}
                </span>
              </div>
              <p className="text-gray-600 mb-4">{data.nextEvent}</p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">AI Confidence</span>
                <span className="font-semibold">{data.confidence}%</span>
              </div>
            </div>
          ))}
        </div>

        {/* Gas & Temperature Forecast */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-lg font-semibold mb-6">Gas & Temperature Forecast</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={generateForecastData(timeRange === '24h' ? 24 : timeRange === '7d' ? 7 : 30)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="methane" name="Methane (%)" stroke="#2563eb" />
                <Line yAxisId="left" type="monotone" dataKey="co2" name="CO2 (%)" stroke="#7c3aed" />
                <Line yAxisId="left" type="monotone" dataKey="o2" name="O2 (%)" stroke="#059669" />
                <Line yAxisId="right" type="monotone" dataKey="temperature" name="Temperature (°C)" stroke="#dc2626" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Seismic Activity Forecast */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-lg font-semibold mb-6">Seismic Activity Forecast</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={generateSeismicData(timeRange === '24h' ? 24 : timeRange === '7d' ? 7 : 30)}>
                <defs>
                  <linearGradient id="seismicGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0.01}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="magnitude" name="Magnitude" stroke="#7c3aed" fill="url(#seismicGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Structural Stress Analysis */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-lg font-semibold mb-6">Structural Stress Prediction</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={generateStressData(timeRange === '24h' ? 24 : timeRange === '7d' ? 168 : 720)}>
                <defs>
                  <linearGradient id="stressGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.01}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="stress" name="Structural Stress (%)" stroke="#ef4444" fill="url(#stressGradient)" />
                <Line type="monotone" dataKey="threshold" name="Critical Threshold" stroke="#dc2626" strokeDasharray="5 5" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Recommendations */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-6">AI Recommendations</h2>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
              <div className="flex items-center gap-2 text-blue-700 mb-2">
                <Brain className="w-5 h-5" />
                <span className="font-medium">Ventilation System</span>
              </div>
              <p className="text-blue-600">Increase ventilation in Zone C by 20% within the next 6 hours to prevent gas buildup.</p>
            </div>
            <div className="p-4 bg-yellow-50 border border-yellow-100 rounded-lg">
              <div className="flex items-center gap-2 text-yellow-700 mb-2">
                <AlertTriangle className="w-5 h-5" />
                <span className="font-medium">Structural Support</span>
              </div>
              <p className="text-yellow-600">Schedule inspection of support beams in Zone B within 48 hours.</p>
            </div>
            <div className="p-4 bg-green-50 border border-green-100 rounded-lg">
              <div className="flex items-center gap-2 text-green-700 mb-2">
                <Activity className="w-5 h-5" />
                <span className="font-medium">Equipment Maintenance</span>
              </div>
              <p className="text-green-600">Optimal time for routine maintenance of drilling equipment in Zone A is next Tuesday.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}