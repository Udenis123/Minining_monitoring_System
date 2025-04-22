import React from 'react';
import { AlertTriangle, CheckCircle, XCircle, DivideIcon as LucideIcon } from 'lucide-react';

interface StatusCardProps {
  title: string;
  value: string | number;
  status: 'normal' | 'warning' | 'critical';
  trend?: 'up' | 'down';
  icon?: LucideIcon;
}

export function StatusCard({ title, value, status, trend, icon: Icon }: StatusCardProps) {
  const statusConfig = {
    normal: {
      icon: CheckCircle,
      color: 'text-green-500',
      bg: 'bg-green-50',
      border: 'border-green-100'
    },
    warning: {
      icon: AlertTriangle,
      color: 'text-yellow-500',
      bg: 'bg-yellow-50',
      border: 'border-yellow-100'
    },
    critical: {
      icon: XCircle,
      color: 'text-red-500',
      bg: 'bg-red-50',
      border: 'border-red-100'
    },
  };

  const { icon: StatusIcon, color, bg, border } = statusConfig[status];

  return (
    <div className={`p-6 rounded-xl ${bg} border ${border}`}>
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2">
            {Icon && <Icon className={`w-5 h-5 ${color}`} />}
            <h3 className="text-sm font-medium text-gray-500">{title}</h3>
          </div>
          <p className="mt-2 text-2xl font-semibold">{value}</p>
        </div>
        <StatusIcon className={`w-5 h-5 ${color}`} />
      </div>
    </div>
  );
}