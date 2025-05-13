export interface SensorData {
  id: string;
  type: "gas" | "geological" | "temperature" | "seismic" | "strain";
  value: number;
  unit: string;
  timestamp: Date;
  status: "normal" | "warning" | "critical";
  location: string;
  mineId: string;
  sectorId: string;
}

export interface TimeSeriesDataPoint {
  time: Date;
  value: number;
  status?: "normal" | "warning" | "critical";
}

export interface TimeSeriesData {
  sensorId: string;
  sensorType: "gas" | "geological" | "temperature" | "seismic" | "strain";
  unit: string;
  mineId: string;
  sectorId: string;
  hourlyData: TimeSeriesDataPoint[];
  minuteData: TimeSeriesDataPoint[];
}

export interface MinerData {
  id: string;
  name: string;
  role: string;
  location: string;
  status: "active" | "inactive" | "emergency";
  lastUpdate: Date;
  mineId: string;
  sectorId: string;
}

export interface Alert {
  id: string;
  type: "info" | "warning" | "critical";
  message: string;
  timestamp: Date;
  location: string;
  acknowledged: boolean;
  mineId: string;
  sectorId: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "supervisor" | "analyst" | "miner";
  role_id?: string;
  mineId?: string;
  permissions: Permission[];
  sectorAccess: SectorAccess[];
  password: string;
}

export interface SectorAccess {
  mineId: string;
  sectorId: string;
  permissions: SectorPermission[];
}

export interface Mine {
  id: string;
  name: string;
  location: string;
  status: "active" | "maintenance" | "emergency";
  areaNumber: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  sectors: Sector[];
  depth: number;
  description: string;
}

export interface Sector {
  id: string;
  name: string;
  level: number;
  status: "active" | "maintenance" | "emergency";
  sensors: SensorConfig[];
}

export interface SensorConfig {
  id: string;
  type: "gas" | "geological" | "temperature" | "seismic" | "strain";
  location: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  status: "active" | "inactive" | "maintenance";
  installationDate: Date;
  lastCalibration: Date;
  specifications: {
    model: string;
    range: string;
    accuracy: string;
    manufacturer: string;
  };
}

export type Permission =
  | "view_all_mines"
  | "manage_users"
  | "view_sensors"
  | "manage_sensors"
  | "view_reports"
  | "view_predective_data";

export type SectorPermission =
  | "view_sector"
  | "manage_sector"
  | "view_sector_sensors"
  | "manage_sector_sensors"
  | "view_sector_alerts"
  | "manage_sector_alerts"
  | "view_sector_reports";

export interface Role {
  name: string;
  permissions: string[]; // Adjust the type as needed
}
