import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { AlertTriangle, ThermometerSun, Wind, Mountain, Download, Filter, Calendar, FileText, AlertCircle, X } from 'lucide-react';

// Mock data generator based on sector and time range
const generateMockData = (sector: string, timeRange: string) => {
  const hours = timeRange === '24h' ? 24 : timeRange === '7d' ? 168 : 720;
  const dataPoints = timeRange === '24h' ? 24 : timeRange === '7d' ? 7 : 30;
  
  const baseValues = {
    'sector-a': { methane: 25, co2: 18, o2: 20, temperature: 28 },
    'sector-b': { methane: 22, co2: 15, o2: 21, temperature: 26 },
    'sector-c': { methane: 28, co2: 20, o2: 19, temperature: 30 },
    'sector-d': { methane: 24, co2: 16, o2: 20, temperature: 27 }
  };

  const base = sector === 'all' ? baseValues['sector-a'] : baseValues[sector] || baseValues['sector-a'];

  return {
    gas: {
      risk: sector === 'sector-c' ? 'high' : 'moderate',
      nextEvent: `Methane levels in ${sector === 'all' ? 'Sector C' : sector.replace('-', ' ').toUpperCase()} require attention within ${timeRange === '24h' ? '6 hours' : '48 hours'}`,
      confidence: 85 + Math.random() * 10,
      trend: Array.from({ length: dataPoints }, (_, i) => ({
        day: timeRange === '24h' ? `${i}:00` : `Day ${i + 1}`,
        methane: base.methane + Math.random() * 5,
        co2: base.co2 + Math.random() * 3,
        o2: base.o2 + Math.random() * 2,
        temperature: base.temperature + Math.random() * 4
      }))
    },
    seismic: {
      risk: sector === 'sector-b' ? 'high' : 'low',
      nextEvent: `Seismic activity predicted in ${sector === 'all' ? 'multiple sectors' : sector.replace('-', ' ').toUpperCase()}`,
      confidence: 75 + Math.random() * 15,
      trend: Array.from({ length: dataPoints }, (_, i) => ({
        day: timeRange === '24h' ? `${i}:00` : `Day ${i + 1}`,
        magnitude: (Math.random() * 2) + (sector === 'sector-b' ? 1 : 0),
        depth: 100 + Math.random() * 50,
        intensity: Math.random() * 5
      }))
    },
    structural: {
      risk: sector === 'sector-d' ? 'critical' : 'moderate',
      nextEvent: `Structural stress detected in ${sector === 'all' ? 'Sector D' : sector.replace('-', ' ').toUpperCase()}`,
      confidence: 90 + Math.random() * 8,
      trend: Array.from({ length: dataPoints }, (_, i) => ({
        day: timeRange === '24h' ? `${i}:00` : `Day ${i + 1}`,
        stress: 30 + Math.random() * 20 + (sector === 'sector-d' ? 10 : 0)
      }))
    },
    temperature: {
      risk: sector === 'sector-c' ? 'critical' : 'moderate',
      nextEvent: `Temperature anomaly predicted in ${sector === 'all' ? 'Sector C' : sector.replace('-', ' ').toUpperCase()}`,
      confidence: 88 + Math.random() * 7,
      trend: Array.from({ length: dataPoints }, (_, i) => ({
        day: timeRange === '24h' ? `${i}:00` : `Day ${i + 1}`,
        value: base.temperature + Math.random() * 8
      }))
    }
  };
};

const getRiskColor = (risk: string) => {
  switch (risk) {
    case 'low':
      return 'bg-green-100 text-green-800';
    case 'moderate':
      return 'bg-yellow-100 text-yellow-800';
    case 'high':
      return 'bg-orange-100 text-orange-800';
    case 'critical':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export function PredictiveAnalytics() {
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedSector, setSelectedSector] = useState('all');
  const [showSeismicReport, setShowSeismicReport] = useState(false);

  // Generate data based on selected sector and time range
  const predictions = generateMockData(selectedSector, timeRange);

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="ml-64 p-8">
        {/* Breadcrumbs */}
        <div className="text-sm text-gray-500 mb-4">
          Dashboard / Predictive Data
        </div>

        {/* Page Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Predictive Analytics & AI Forecasting</h1>
              <p className="mt-1 text-gray-500">AI-powered predictions and risk analysis</p>
            </div>
            <div className="flex gap-4">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-4 py-2 border rounded-lg bg-white"
              >
                <option value="24h">Next 24 Hours</option>
                <option value="7d">Next 7 Days</option>
                <option value="30d">Next 30 Days</option>
              </select>
              <select
                value={selectedSector}
                onChange={(e) => setSelectedSector(e.target.value)}
                className="px-4 py-2 border rounded-lg bg-white"
              >
                <option value="all">All Sectors</option>
                <option value="sector-a">Sector A</option>
                <option value="sector-b">Sector B</option>
                <option value="sector-c">Sector C</option>
                <option value="sector-d">Sector D</option>
              </select>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                <Download className="w-4 h-4" />
                Export Report
              </button>
            </div>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {Object.entries(predictions).map(([key, data]) => (
            <div key={key} className={`bg-white p-6 rounded-xl shadow-sm border-l-4 ${
              data.risk === 'critical' ? 'border-red-500' :
              data.risk === 'high' ? 'border-orange-500' :
              data.risk === 'moderate' ? 'border-yellow-500' :
              'border-green-500'
            }`}>
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold capitalize">{key} Risk</h3>
                <span className={`px-3 py-1 rounded-full text-sm ${getRiskColor(data.risk)}`}>
                  {data.risk.toUpperCase()}
                </span>
              </div>
              <p className="text-gray-600 mb-4">{data.nextEvent}</p>
              <div className="flex items-center text-sm text-gray-500">
                <AlertCircle className="w-4 h-4 mr-2" />
                AI Confidence: {data.confidence.toFixed(1)}%
              </div>
            </div>
          ))}
        </div>

        {/* Gas & Temperature Forecast */}
        <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
          <h2 className="text-xl font-semibold mb-6">AI Prediction: Gas & Temperature Trends</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={predictions.gas.trend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="methane" stroke="#2563eb" name="Methane (%)" />
                <Line type="monotone" dataKey="co2" stroke="#7c3aed" name="CO2 (%)" />
                <Line type="monotone" dataKey="o2" stroke="#059669" name="O2 (%)" />
                <Line type="monotone" dataKey="temperature" stroke="#dc2626" name="Temperature (°C)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-yellow-500 mr-2" />
              <span className="text-yellow-700">
                Alert: Elevated gas levels detected in {selectedSector === 'all' ? 'multiple sectors' : selectedSector.replace('-', ' ').toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Seismic Activity & Structural Integrity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-xl font-semibold mb-6">AI Prediction: Seismic Risks</h2>
            <div className="h-64 mb-6">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={predictions.seismic.trend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="magnitude" stroke="#7c3aed" fill="#7c3aed" fillOpacity={0.2} name="Magnitude" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <button
              onClick={() => setShowSeismicReport(true)}
              className="w-full bg-purple-50 text-purple-700 py-2 rounded-lg hover:bg-purple-100 transition-colors flex items-center justify-center"
            >
              <FileText className="w-4 h-4 mr-2" />
              View Detailed Seismic Report
            </button>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-xl font-semibold mb-6">AI Prediction: Structural Risk Analysis</h2>
            <div className="h-64 mb-6">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={predictions.structural.trend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="stress" stroke="#dc2626" name="Structural Stress" />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
                <span className="text-red-700">
                  {selectedSector === 'all' ? 'Multiple sectors show' : selectedSector.replace('-', ' ').toUpperCase() + ' shows'} structural stress patterns
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* AI Recommendations */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-xl font-semibold mb-6">AI Recommendations</h2>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-start">
                <div className="bg-blue-100 p-2 rounded-full mr-4">
                  <Wind className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-blue-900">Ventilation Adjustment</h3>
                  <p className="text-blue-700 mt-1">
                    Increase ventilation in {selectedSector === 'all' ? 'Sectors C and D' : selectedSector.replace('-', ' ').toUpperCase()} to reduce gas accumulation
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="flex items-start">
                <div className="bg-purple-100 p-2 rounded-full mr-4">
                  <Mountain className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-medium text-purple-900">Structural Support</h3>
                  <p className="text-purple-700 mt-1">
                    Schedule support beam inspection in {selectedSector === 'all' ? 'all sectors' : selectedSector.replace('-', ' ').toUpperCase()}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-orange-50 rounded-lg">
              <div className="flex items-start">
                <div className="bg-orange-100 p-2 rounded-full mr-4">
                  <ThermometerSun className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-medium text-orange-900">Temperature Management</h3>
                  <p className="text-orange-700 mt-1">
                    Monitor cooling systems in {selectedSector === 'all' ? 'Sectors A and C' : selectedSector.replace('-', ' ').toUpperCase()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Seismic Report Modal */}
        {showSeismicReport && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Detailed Seismic Analysis Report</h2>
                <button onClick={() => setShowSeismicReport(false)}>
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-purple-900 mb-2">Executive Summary</h3>
                  <p className="text-purple-800">
                    Analysis of seismic data from {selectedSector === 'all' ? 'all sectors' : selectedSector.replace('-', ' ').toUpperCase()} 
                    shows {predictions.seismic.risk} risk levels with {predictions.seismic.confidence.toFixed(1)}% confidence.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold mb-4">Seismic Activity Breakdown</h3>
                  <div className="bg-white border rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Magnitude</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Depth</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Intensity</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risk Level</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {predictions.seismic.trend.map((reading, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{reading.day}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{reading.magnitude.toFixed(2)} ML</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{reading.depth.toFixed(1)} m</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{reading.intensity.toFixed(1)}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                reading.magnitude > 2 ? 'bg-red-100 text-red-800' :
                                reading.magnitude > 1 ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {reading.magnitude > 2 ? 'High' : reading.magnitude > 1 ? 'Moderate' : 'Low'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Key Findings</h4>
                    <ul className="list-disc list-inside space-y-2 text-sm text-gray-600">
                      <li>Peak activity observed during early morning hours</li>
                      <li>Correlation with mining operations detected</li>
                      <li>Seasonal patterns identified</li>
                      <li>Ground stability remains within safety parameters</li>
                    </ul>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Recommendations</h4>
                    <ul className="list-disc list-inside space-y-2 text-sm text-gray-600">
                      <li>Increase monitoring frequency in high-risk areas</li>
                      <li>Review and update emergency response protocols</li>
                      <li>Conduct detailed structural integrity assessments</li>
                      <li>Update seismic monitoring equipment calibration</li>
                    </ul>
                  </div>
                </div>

                <div className="flex justify-end mt-6">
                  <button
                    onClick={() => setShowSeismicReport(false)}
                    className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 mr-3"
                  >
                    Close
                  </button>
                  <button className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 flex items-center">
                    <Download className="w-4 h-4 mr-2" />
                    Download Full Report
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}