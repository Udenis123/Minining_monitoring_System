import React from 'react';
import { format } from 'date-fns';
import { Alert } from '../types';
import { AlertTriangle, Bell, XCircle } from 'lucide-react';

interface AlertsListProps {
  alerts: Alert[];
}

export function AlertsList({ alerts }: AlertsListProps) {
  const alertConfig = {
    info: {
      icon: Bell,
      color: 'text-blue-500',
      bg: 'bg-blue-50',
    },
    warning: {
      icon: AlertTriangle,
      color: 'text-yellow-500',
      bg: 'bg-yellow-50',
    },
    critical: {
      icon: XCircle,
      color: 'text-red-500',
      bg: 'bg-red-50',
    },
  };

  return (
    <div className="bg-white rounded-xl shadow-sm">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Recent Alerts</h2>
      </div>
      <div className="divide-y">
        {alerts.map((alert) => {
          const { icon: Icon, color, bg } = alertConfig[alert.type];
          return (
            <div key={alert.id} className="p-4 flex items-start space-x-4">
              <div className={`p-2 rounded-full ${bg}`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <div className="flex-1">
                <p className="font-medium">{alert.message}</p>
                <div className="mt-1 flex items-center text-sm text-gray-500">
                  <span>{alert.location}</span>
                  <span className="mx-2">•</span>
                  <span>{format(alert.timestamp, 'HH:mm')}</span>
                </div>
              </div>
              {!alert.acknowledged && (
                <button className="px-3 py-1 text-sm bg-gray-100 rounded-full hover:bg-gray-200">
                  Acknowledge
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}