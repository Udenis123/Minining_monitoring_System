import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { useAuthStore } from '../store/authStore';
import { mockAlerts, mockMines } from '../data/mockData';
import { Bell, CheckCircle, AlertTriangle, XCircle, Filter } from 'lucide-react';
import { format } from 'date-fns';

export function Alerts() {
  const user = useAuthStore(state => state.user);
  const [selectedMine, setSelectedMine] = useState(user?.mineId || 'all');
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Filter alerts based on user's mine assignment or selected location for admin
  const alerts = user?.role === 'admin' && selectedMine === 'all'
    ? Object.values(mockAlerts).flat()
    : selectedMine
      ? mockAlerts[selectedMine] || []
      : [];

  // Apply filters
  const filteredAlerts = alerts.filter(alert => {
    if (selectedSeverity !== 'all' && alert.type !== selectedSeverity) return false;
    if (selectedStatus !== 'all' && alert.acknowledged === (selectedStatus !== 'active')) return false;
    return true;
  });

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical': return XCircle;
      case 'warning': return AlertTriangle;
      case 'info': return Bell;
      default: return Bell;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'critical': return 'text-red-500 bg-red-50';
      case 'warning': return 'text-yellow-500 bg-yellow-50';
      case 'info': return 'text-blue-500 bg-blue-50';
      default: return 'text-gray-500 bg-gray-50';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="ml-64 p-8">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Alerts</h1>
              <p className="mt-1 text-gray-500">Monitor and manage system alerts</p>
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
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm mb-6">
          <div className="p-6 border-b">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-5 h-5 text-gray-500" />
              <h2 className="text-lg font-semibold">Filters</h2>
            </div>
            <div className="flex gap-4">
              <select
                value={selectedSeverity}
                onChange={(e) => setSelectedSeverity(e.target.value)}
                className="px-4 py-2 border rounded-lg bg-white"
              >
                <option value="all">All Severities</option>
                <option value="critical">Critical</option>
                <option value="warning">Warning</option>
                <option value="info">Info</option>
              </select>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-2 border rounded-lg bg-white"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="acknowledged">Acknowledged</option>
              </select>
            </div>
          </div>

          <div className="p-6">
            <div className="space-y-4">
              {filteredAlerts.map(alert => {
                const AlertIcon = getAlertIcon(alert.type);
                const colorClass = getAlertColor(alert.type);

                return (
                  <div
                    key={alert.id}
                    className="flex items-start gap-4 p-4 rounded-lg border hover:shadow-sm transition-shadow"
                  >
                    <div className={`p-2 rounded-full ${colorClass}`}>
                      <AlertIcon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium">{alert.message}</h3>
                          <div className="mt-1 flex items-center text-sm text-gray-500 gap-2">
                            <span>{alert.location}</span>
                            <span>•</span>
                            <span>{format(alert.timestamp, 'MMM d, yyyy HH:mm')}</span>
                          </div>
                        </div>
                        {!alert.acknowledged && (
                          <button className="px-3 py-1 text-sm bg-gray-100 rounded-full hover:bg-gray-200 flex items-center gap-1">
                            <CheckCircle className="w-4 h-4" />
                            Acknowledge
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Alert Summary</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Total Alerts</span>
                <span className="font-semibold">{alerts.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Critical</span>
                <span className="font-semibold text-red-500">
                  {alerts.filter(a => a.type === 'critical').length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Warning</span>
                <span className="font-semibold text-yellow-500">
                  {alerts.filter(a => a.type === 'warning').length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Info</span>
                <span className="font-semibold text-blue-500">
                  {alerts.filter(a => a.type === 'info').length}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Status</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Active Alerts</span>
                <span className="font-semibold text-red-500">
                  {alerts.filter(a => !a.acknowledged).length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Acknowledged</span>
                <span className="font-semibold text-green-500">
                  {alerts.filter(a => a.acknowledged).length}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Response Time</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Average Response</span>
                <span className="font-semibold">15.3 min</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Critical Response</span>
                <span className="font-semibold">5.2 min</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}