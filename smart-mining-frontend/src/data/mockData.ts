import { User, Mine, SensorData, Alert, MinerData, SensorConfig, Sector, SectorAccess } from '../types';

const mockSensorConfigs: SensorConfig[] = [
  {
    id: 'sensor-config-1',
    type: 'gas',
    location: 'Main Shaft',
    coordinates: { lat: 51.5074, lng: -0.1278 },
    status: 'active',
    installationDate: new Date('2024-01-15'),
    lastCalibration: new Date('2024-03-01'),
    specifications: {
      model: 'GasAlert Max XT II',
      range: '0-100 PPM',
      accuracy: '±2%',
      manufacturer: 'BW Technologies'
    }
  },
  {
    id: 'sensor-config-2',
    type: 'temperature',
    location: 'Processing Area',
    coordinates: { lat: 51.5075, lng: -0.1279 },
    status: 'active',
    installationDate: new Date('2024-01-15'),
    lastCalibration: new Date('2024-03-01'),
    specifications: {
      model: 'Temp-3000',
      range: '-40°C to 120°C',
      accuracy: '±0.5°C',
      manufacturer: 'TempTech'
    }
  },
  {
    id: 'sensor-config-3',
    type: 'seismic',
    location: 'Main Shaft',
    coordinates: { lat: 51.5076, lng: -0.1280 },
    status: 'active',
    installationDate: new Date('2024-01-15'),
    lastCalibration: new Date('2024-03-01'),
    specifications: {
      model: 'Seismic-5000',
      range: '0-10 Hz',
      accuracy: '±0.1 Hz',
      manufacturer: 'SeismicTech'
    }
  },
  {
    id: 'sensor-config-4',
    type: 'strain',
    location: 'Processing Area',
    coordinates: { lat: 51.5077, lng: -0.1281 },
    status: 'active',
    installationDate: new Date('2024-01-15'),
    lastCalibration: new Date('2024-03-01'),
    specifications: {
      model: 'Strain-2000',
      range: '0-5 MPa',
      accuracy: '±0.01 MPa',
      manufacturer: 'StrainTech'
    }
  }
];

const mockSectors: Sector[] = [
  {
    id: 'sector-1',
    name: 'Sector A',
    status: 'active',
    level: 1,
    sensors: [
      {
        id: 'sensor-config-1',
        type: 'gas',
        location: 'Main Shaft',
        coordinates: { lat: 51.5074, lng: -0.1278 },
        status: 'active',
        installationDate: new Date('2024-01-15'),
        lastCalibration: new Date('2024-03-01'),
        specifications: {
          model: 'GasAlert Max XT II',
          range: '0-100 PPM',
          accuracy: '±2%',
          manufacturer: 'BW Technologies'
        }
      },
      {
        id: 'sensor-config-2',
        type: 'temperature',
        location: 'Processing Area',
        coordinates: { lat: 51.5075, lng: -0.1279 },
        status: 'active',
        installationDate: new Date('2024-01-15'),
        lastCalibration: new Date('2024-03-01'),
        specifications: {
          model: 'Temp-3000',
          range: '-40°C to 120°C',
          accuracy: '±0.5°C',
          manufacturer: 'TempTech'
        }
      },
      {
        id: 'sensor-config-3',
        type: 'seismic',
        location: 'Main Shaft',
        coordinates: { lat: 51.5076, lng: -0.1280 },
        status: 'active',
        installationDate: new Date('2024-01-15'),
        lastCalibration: new Date('2024-03-01'),
        specifications: {
          model: 'Seismic-5000',
          range: '0-10 Hz',
          accuracy: '±0.1 Hz',
          manufacturer: 'SeismicTech'
        }
      },
      {
        id: 'sensor-config-4',
        type: 'strain',
        location: 'Processing Area',
        coordinates: { lat: 51.5077, lng: -0.1281 },
        status: 'active',
        installationDate: new Date('2024-01-15'),
        lastCalibration: new Date('2024-03-01'),
        specifications: {
          model: 'Strain-2000',
          range: '0-5 MPa',
          accuracy: '±0.01 MPa',
          manufacturer: 'StrainTech'
        }
      }
    ]
  },
  {
    id: 'sector-2',
    name: 'Sector B',
    status: 'maintenance',
    level: 2,
    sensors: [
      {
        id: 'sensor-config-5',
        type: 'gas',
        location: 'Main Shaft',
        coordinates: { lat: 51.5074, lng: -0.1278 },
        status: 'active',
        installationDate: new Date('2024-01-15'),
        lastCalibration: new Date('2024-03-01'),
        specifications: {
          model: 'GasAlert Max XT II',
          range: '0-100 PPM',
          accuracy: '±2%',
          manufacturer: 'BW Technologies'
        }
      },
      {
        id: 'sensor-config-6',
        type: 'temperature',
        location: 'Processing Area',
        coordinates: { lat: 51.5075, lng: -0.1279 },
        status: 'active',
        installationDate: new Date('2024-01-15'),
        lastCalibration: new Date('2024-03-01'),
        specifications: {
          model: 'Temp-3000',
          range: '-40°C to 120°C',
          accuracy: '±0.5°C',
          manufacturer: 'TempTech'
        }
      },
      {
        id: 'sensor-config-7',
        type: 'seismic',
        location: 'Main Shaft',
        coordinates: { lat: 51.5076, lng: -0.1280 },
        status: 'active',
        installationDate: new Date('2024-01-15'),
        lastCalibration: new Date('2024-03-01'),
        specifications: {
          model: 'Seismic-5000',
          range: '0-10 Hz',
          accuracy: '±0.1 Hz',
          manufacturer: 'SeismicTech'
        }
      },
      {
        id: 'sensor-config-8',
        type: 'strain',
        location: 'Processing Area',
        coordinates: { lat: 51.5077, lng: -0.1281 },
        status: 'active',
        installationDate: new Date('2024-01-15'),
        lastCalibration: new Date('2024-03-01'),
        specifications: {
          model: 'Strain-2000',
          range: '0-5 MPa',
          accuracy: '±0.01 MPa',
          manufacturer: 'StrainTech'
        }
      }
    ]
  },
  {
    id: 'sector-3',
    name: 'Sector C',
    status: 'active',
    level: 3,
    sensors: [
      {
        id: 'sensor-config-9',
        type: 'gas',
        location: 'Main Shaft',
        coordinates: { lat: 51.5074, lng: -0.1278 },
        status: 'active',
        installationDate: new Date('2024-01-15'),
        lastCalibration: new Date('2024-03-01'),
        specifications: {
          model: 'GasAlert Max XT II',
          range: '0-100 PPM',
          accuracy: '±2%',
          manufacturer: 'BW Technologies'
        }
      },
      {
        id: 'sensor-config-10',
        type: 'temperature',
        location: 'Processing Area',
        coordinates: { lat: 51.5075, lng: -0.1279 },
        status: 'active',
        installationDate: new Date('2024-01-15'),
        lastCalibration: new Date('2024-03-01'),
        specifications: {
          model: 'Temp-3000',
          range: '-40°C to 120°C',
          accuracy: '±0.5°C',
          manufacturer: 'TempTech'
        }
      },
      {
        id: 'sensor-config-11',
        type: 'seismic',
        location: 'Main Shaft',
        coordinates: { lat: 51.5076, lng: -0.1280 },
        status: 'active',
        installationDate: new Date('2024-01-15'),
        lastCalibration: new Date('2024-03-01'),
        specifications: {
          model: 'Seismic-5000',
          range: '0-10 Hz',
          accuracy: '±0.1 Hz',
          manufacturer: 'SeismicTech'
        }
      },
      {
        id: 'sensor-config-12',
        type: 'strain',
        location: 'Processing Area',
        coordinates: { lat: 51.5077, lng: -0.1281 },
        status: 'inactive',
        installationDate: new Date('2024-01-15'),
        lastCalibration: new Date('2024-03-01'),
        specifications: {
          model: 'Strain-2000',
          range: '0-5 MPa',
          accuracy: '±0.01 MPa',
          manufacturer: 'StrainTech'
        }
      }
    ]
  }
];

export const mockMines: Mine[] = [
  {
    id: 'mine1',
    name: 'North Shaft Mine',
    location: 'Sector A',
    status: 'active',
    areaNumber: 'NA-001',
    coordinates: { lat: 51.5074, lng: -0.1278 },
    sectors: [mockSectors[0], mockSectors[1]],
    depth: 450,
    description: 'Primary mining operation with advanced ventilation systems'
  },
  {
    id: 'mine2',
    name: 'Deep Core Mine',
    location: 'Sector B',
    status: 'maintenance',
    areaNumber: 'NA-002',
    coordinates: { lat: 51.5174, lng: -0.1378 },
    sectors: [mockSectors[1], mockSectors[2]],
    depth: 800,
    description: 'Deep mining operation with specialized equipment'
  },
  {
    id: 'mine3',
    name: 'Eastern Tunnel',
    location: 'Sector C',
    status: 'active',
    areaNumber: 'NA-003',
    coordinates: { lat: 51.5274, lng: -0.1478 },
    sectors: [mockSectors[2]],
    depth: 250,
    description: 'Tunnel mining operation with advanced safety systems'
  },
  {
    id: 'mine4',
    name: 'Kigali Tunnel',
    location: 'Sector A',
    status: 'active',
    areaNumber: 'NA-001',
    coordinates: { lat: 51.5074, lng: -0.1278 },
    sectors: [mockSectors[0], mockSectors[1]],
    depth: 410,
    description: 'Primary mining operation with advanced ventilation systems'
  }
 
];

const mockSectorAccess: SectorAccess[] = [
  {
    mineId: 'mine1',
    sectorId: 'sector-1',
    permissions: ['view_sector', 'view_sector_sensors', 'view_sector_alerts']
  },
  {
    mineId: 'mine1',
    sectorId: 'sector-2',
    permissions: ['view_sector', 'manage_sector_sensors', 'manage_sector_alerts']
  }
];

 export const mockUsers: User[] = [
  {
    id: 'admin1',
    email: 'admin@mine.com',
    name: 'Admin User',
    role: 'admin',
    permissions: ['view_all_mines', 'manage_users', 'manage_sensors', 'manage_alerts', 'view_reports', 'view_sensors'],
    sectorAccess: [],
    password: 'admin123',
  },
  {
    id: 'super1',
    email: 'supervisor@mine.com',
    name: 'John Supervisor',
    role: 'supervisor',
    mineId: 'mine1',
    permissions: ['view_sensors', 'manage_alerts', 'view_reports'],
    sectorAccess: mockSectorAccess,
    password: 'supervisor123',
  },
  {
    id: 'miner1',
    email: 'miner@mine.com',
    name: 'Mike Miner',
    role: 'miner',
    mineId: 'mine1',
    permissions: ['view_alerts'],
    sectorAccess: [mockSectorAccess[0]], // Only access to sector-1
    password: 'miner123',
  },
];

export const mockSensorData: Record<string, SensorData[]> = {
  mine1: [
    {
      id: 'sensor1',
      type: 'gas',
      value: 23,
      unit: 'PPM',
      timestamp: new Date(),
      status: 'normal',
      location: 'Level 1',
      mineId: 'mine1',
      sectorId: 'sector-1'
    },
    {
      id: 'sensor2',
      type: 'temperature',
      value: 24.5,
      unit: '°C',
      timestamp: new Date(),
      status: 'normal',
      location: 'Level 2',
      mineId: 'mine1',
      sectorId: 'sector-1'
    },
    {
      id: 'sensor3',
      type: 'seismic',
      value: 0.5,
      unit: 'Hz',
      timestamp: new Date(),
      status: 'normal',
      location: 'Level 1',
      mineId: 'mine1',
      sectorId: 'sector-1'
    },
    {
      id: 'sensor4',
      type: 'strain',
      value: 2,
      unit: 'MPa',
      timestamp: new Date(),
      status: 'normal',
      location: 'Level 2',
      mineId: 'mine1',
      sectorId: 'sector-1'
    },
    {
      id: 'sensor5',
      type: 'gas',
      value: 45,
      unit: 'PPM',
      timestamp: new Date(),
      status: 'warning',
      location: 'Level 1',
      mineId: 'mine1',
      sectorId: 'sector-2'
    },
    {
      id: 'sensor6',
      type: 'temperature',
      value: 28,
      unit: '°C',
      timestamp: new Date(),
      status: 'normal',
      location: 'Level 2',
      mineId: 'mine1',
      sectorId: 'sector-2'
    },
    {
      id: 'sensor7',
      type: 'seismic',
      value: 0.7,
      unit: 'Hz',
      timestamp: new Date(),
      status: 'normal',
      location: 'Level 1',
      mineId: 'mine1',
      sectorId: 'sector-2'
    },
    {
      id: 'sensor8',
      type: 'strain',
      value: 1.5,
      unit: 'MPa',
      timestamp: new Date(),
      status: 'normal',
      location: 'Level 2',
      mineId: 'mine1',
      sectorId: 'sector-2'
    },
    {
      id: 'sensor9',
      type: 'gas',
      value: 35,
      unit: 'PPM',
      timestamp: new Date(),
      status: 'normal',
      location: 'Level 1',
      mineId: 'mine1',
      sectorId: 'sector-3'
    },
    {
      id: 'sensor10',
      type: 'temperature',
      value: 30,
      unit: '°C',
      timestamp: new Date(),
      status: 'normal',
      location: 'Level 2',
      mineId: 'mine1',
      sectorId: 'sector-3'
    },
    {
      id: 'sensor11',
      type: 'seismic',
      value: 0.6,
      unit: 'Hz',
      timestamp: new Date(),
      status: 'normal',
      location: 'Level 1',
      mineId: 'mine1',
      sectorId: 'sector-3'
    },
    {
      id: 'sensor12',
      type: 'strain',
      value: 1.8,
      unit: 'MPa',
      timestamp: new Date(),
      status: 'normal',
      location: 'Level 2',
      mineId: 'mine1',
      sectorId: 'sector-3'
    }
  ],
  mine2: [
    {
      id: 'sensor13',
      type: 'gas',
      value: 50,
      unit: 'PPM',
      timestamp: new Date(),
      status: 'warning',
      location: 'Level 1',
      mineId: 'mine2',
      sectorId: 'sector-1'
    },
    {
      id: 'sensor14',
      type: 'temperature',
      value: 32,
      unit: '°C',
      timestamp: new Date(),
      status: 'normal',
      location: 'Level 2',
      mineId: 'mine2',
      sectorId: 'sector-1'
    },
    {
      id: 'sensor15',
      type: 'seismic',
      value: 0.8,
      unit: 'Hz',
      timestamp: new Date(),
      status: 'normal',
      location: 'Level 1',
      mineId: 'mine2',
      sectorId: 'sector-1'
    },
    {
      id: 'sensor16',
      type: 'strain',
      value: 2.2,
      unit: 'MPa',
      timestamp: new Date(),
      status: 'normal',
      location: 'Level 2',
      mineId: 'mine2',
      sectorId: 'sector-1'
    },
    {
      id: 'sensor17',
      type: 'gas',
      value: 40,
      unit: 'PPM',
      timestamp: new Date(),
      status: 'normal',
      location: 'Level 1',
      mineId: 'mine2',
      sectorId: 'sector-2'
    },
    {
      id: 'sensor18',
      type: 'temperature',
      value: 29,
      unit: '°C',
      timestamp: new Date(),
      status: 'normal',
      location: 'Level 2',
      mineId: 'mine2',
      sectorId: 'sector-2'
    },
    {
      id: 'sensor19',
      type: 'seismic',
      value: 0.9,
      unit: 'Hz',
      timestamp: new Date(),
      status: 'normal',
      location: 'Level 1',
      mineId: 'mine2',
      sectorId: 'sector-2'
    },
    {
      id: 'sensor20',
      type: 'strain',
      value: 1.9,
      unit: 'MPa',
      timestamp: new Date(),
      status: 'normal',
      location: 'Level 2',
      mineId: 'mine2',
      sectorId: 'sector-2'
    },
    {
      id: 'sensor21',
      type: 'gas',
      value: 38,
      unit: 'PPM',
      timestamp: new Date(),
      status: 'normal',
      location: 'Level 1',
      mineId: 'mine2',
      sectorId: 'sector-3'
    },
    {
      id: 'sensor22',
      type: 'temperature',
      value: 31,
      unit: '°C',
      timestamp: new Date(),
      status: 'normal',
      location: 'Level 2',
      mineId: 'mine2',
      sectorId: 'sector-3'
    },
    {
      id: 'sensor23',
      type: 'seismic',
      value: 0.7,
      unit: 'Hz',
      timestamp: new Date(),
      status: 'normal',
      location: 'Level 1',
      mineId: 'mine2',
      sectorId: 'sector-3'
    },
    {
      id: 'sensor24',
      type: 'strain',
      value: 2.1,
      unit: 'MPa',
      timestamp: new Date(),
      status: 'normal',
      location: 'Level 2',
      mineId: 'mine2',
      sectorId: 'sector-3'
    }
  ],
  mine3: [
    {
      id: 'sensor25',
      type: 'gas',
      value: 42,
      unit: 'PPM',
      timestamp: new Date(),
      status: 'normal',
      location: 'Level 1',
      mineId: 'mine3',
      sectorId: 'sector-1'
    },
    {
      id: 'sensor26',
      type: 'temperature',
      value: 33,
      unit: '°C',
      timestamp: new Date(),
      status: 'normal',
      location: 'Level 2',
      mineId: 'mine3',
      sectorId: 'sector-1'
    },
    {
      id: 'sensor27',
      type: 'seismic',
      value: 0.6,
      unit: 'Hz',
      timestamp: new Date(),
      status: 'normal',
      location: 'Level 1',
      mineId: 'mine3',
      sectorId: 'sector-1'
    },
    {
      id: 'sensor28',
      type: 'strain',
      value: 2.0,
      unit: 'MPa',
      timestamp: new Date(),
      status: 'normal',
      location: 'Level 2',
      mineId: 'mine3',
      sectorId: 'sector-1'
    },
    {
      id: 'sensor29',
      type: 'gas',
      value: 44,
      unit: 'PPM',
      timestamp: new Date(),
      status: 'normal',
      location: 'Level 1',
      mineId: 'mine3',
      sectorId: 'sector-2'
    },
    {
      id: 'sensor30',
      type: 'temperature',
      value: 34,
      unit: '°C',
      timestamp: new Date(),
      status: 'normal',
      location: 'Level 2',
      mineId: 'mine3',
      sectorId: 'sector-2'
    },
    {
      id: 'sensor31',
      type: 'seismic',
      value: 0.7,
      unit: 'Hz',
      timestamp: new Date(),
      status: 'normal',
      location: 'Level 1',
      mineId: 'mine3',
      sectorId: 'sector-2'
    },
    {
      id: 'sensor32',
      type: 'strain',
      value: 2.1,
      unit: 'MPa',
      timestamp: new Date(),
      status: 'normal',
      location: 'Level 2',
      mineId: 'mine3',
      sectorId: 'sector-2'
    },
    {
      id: 'sensor33',
      type: 'gas',
      value: 46,
      unit: 'PPM',
      timestamp: new Date(),
      status: 'normal',
      location: 'Level 1',
      mineId: 'mine3',
      sectorId: 'sector-3'
    },
    {
      id: 'sensor34',
      type: 'temperature',
      value: 35,
      unit: '°C',
      timestamp: new Date(),
      status: 'normal',
      location: 'Level 2',
      mineId: 'mine3',
      sectorId: 'sector-3'
    },
    {
      id: 'sensor35',
      type: 'seismic',
      value: 0.8,
      unit: 'Hz',
      timestamp: new Date(),
      status: 'normal',
      location: 'Level 1',
      mineId: 'mine3',
      sectorId: 'sector-3'
    },
    {
      id: 'sensor36',
      type: 'strain',
      value: 2.2,
      unit: 'MPa',
      timestamp: new Date(),
      status: 'normal',
      location: 'Level 2',
      mineId: 'mine3',
      sectorId: 'sector-3'
    }
  ],
  mine4: [
    {
      id: 'sensor1',
      type: 'gas',
      value: 23,
      unit: 'PPM',
      timestamp: new Date(),
      status: 'normal',
      location: 'Level 1',
      mineId: 'mine4',
      sectorId: 'sector-1'
    },
    {
      id: 'sensor2',
      type: 'temperature',
      value: 24.5,
      unit: '°C',
      timestamp: new Date(),
      status: 'normal',
      location: 'Level 2',
      mineId: 'mine4',
      sectorId: 'sector-1'
    },
    {
      id: 'sensor3',
      type: 'seismic',
      value: 0.5,
      unit: 'Hz',
      timestamp: new Date(),
      status: 'normal',
      location: 'Level 1',
      mineId: 'mine4',
      sectorId: 'sector-1'
    },
    {
      id: 'sensor4',
      type: 'strain',
      value: 2,
      unit: 'MPa',
      timestamp: new Date(),
      status: 'normal',
      location: 'Level 2',
      mineId: 'mine4',
      sectorId: 'sector-1'
    },
    {
      id: 'sensor5',
      type: 'gas',
      value: 45,
      unit: 'PPM',
      timestamp: new Date(),
      status: 'warning',
      location: 'Level 1',
      mineId: 'mine4',
      sectorId: 'sector-2'
    },
    {
      id: 'sensor6',
      type: 'temperature',
      value: 28,
      unit: '°C',
      timestamp: new Date(),
      status: 'normal',
      location: 'Level 2',
      mineId: 'mine4',
      sectorId: 'sector-2'
    },
    {
      id: 'sensor7',
      type: 'seismic',
      value: 0.7,
      unit: 'Hz',
      timestamp: new Date(),
      status: 'normal',
      location: 'Level 1',
      mineId: 'mine4',
      sectorId: 'sector-2'
    },
    {
      id: 'sensor8',
      type: 'strain',
      value: 1.5,
      unit: 'MPa',
      timestamp: new Date(),
      status: 'normal',
      location: 'Level 2',
      mineId: 'mine4',
      sectorId: 'sector-2'
    },
    {
      id: 'sensor9',
      type: 'gas',
      value: 35,
      unit: 'PPM',
      timestamp: new Date(),
      status: 'normal',
      location: 'Level 1',
      mineId: 'mine4',
      sectorId: 'sector-3'
    },
    {
      id: 'sensor10',
      type: 'temperature',
      value: 30,
      unit: '°C',
      timestamp: new Date(),
      status: 'normal',
      location: 'Level 2',
      mineId: 'mine4',
      sectorId: 'sector-3'
    },
    {
      id: 'sensor11',
      type: 'seismic',
      value: 0.6,
      unit: 'Hz',
      timestamp: new Date(),
      status: 'normal',
      location: 'Level 1',
      mineId: 'mine4',
      sectorId: 'sector-3'
    },
    {
      id: 'sensor12',
      type: 'strain',
      value: 1.8,
      unit: 'MPa',
      timestamp: new Date(),
      status: 'normal',
      location: 'Level 2',
      mineId: 'mine4',
      sectorId: 'sector-3'
    },
    {
      id: 'sensor13',
      type: 'gas',
      value: 23,
      unit: 'PPM',
      timestamp: new Date(),
      status: 'normal',
      location: 'Level 1',
      mineId: 'mine4',
      sectorId: 'sector-1'
    },
    {
      id: 'sensor14',
      type: 'temperature',
      value: 24.5,
      unit: '°C',
      timestamp: new Date(),
      status: 'normal',
      location: 'Level 2',
      mineId: 'mine4',
      sectorId: 'sector-1'
    }
  ],
};

export const mockAlerts: Record<string, Alert[]> = {
  mine1: [
    {
      id: '1',
      type: 'warning',
      message: 'Elevated gas levels in Level 2',
      timestamp: new Date(),
      location: 'Level 2',
      acknowledged: false,
      mineId: 'mine1',
      sectorId: 'sector-2'
    },
  ],
  mine2: [
    {
      id: '2',
      type: 'critical',
      message: 'Critical temperature levels',
      timestamp: new Date(),
      location: 'Main Shaft',
      acknowledged: false,
      mineId: 'mine2',
      sectorId: 'sector-1'
    },
  ],
  mine3: [
    {
      id: '3',
      type: 'info',
      message: 'Routine maintenance required',
      timestamp: new Date(),
      location: 'Level 1',
      acknowledged: true,
      mineId: 'mine3',
      sectorId: 'sector-1'
    },
  ],
};

export const mockMiners: Record<string, MinerData[]> = {
  mine1: [
    {
      id: 'miner1',
      name: 'John Doe',
      role: 'Driller',
      location: 'Level 1',
      status: 'active',
      lastUpdate: new Date(),
      mineId: 'mine1',
      sectorId: 'mine1-sector-1'
    },
  ],
  mine2: [
    {
      id: 'miner2',
      name: 'Jane Smith',
      role: 'Supervisor',
      location: 'Level 2',
      status: 'active',
      lastUpdate: new Date(),
      mineId: 'mine2',
      sectorId: 'mine2-sector-2'
    },
  ],
  mine3: [
    {
      id: 'miner3',
      name: 'Bob Wilson',
      role: 'Engineer',
      location: 'Level 1',
      status: 'active',
      lastUpdate: new Date(),
      mineId: 'mine3',
      sectorId: 'mine3-sector-1'
    },
  ],
  mine4: [
    {
      id: 'miner4',
      name: 'Jane Smith',
      role: 'Supervisor',
      location: 'Level 1',
      status: 'active',
      lastUpdate: new Date(),
      mineId: 'mine4',
      sectorId: 'mine4-sector-1'
    },
  ],
};

export const mockSensorTypes = [
  {
    id: 'gas',
    name: 'Gas Levels',
    icon: 'Wind',
    unit: 'PPM',
    color: '#2563eb',
    thresholds: {
      warning: 45,
      critical: 60
    },
    sectorSpecific: [
      { id: 'gas', name: 'Gas Levels', icon: 'Wind', unit: 'PPM', color: '#2563eb', sectorId: 'mine1-sector-1', mineId: 'mine1' },
      { id: 'gas', name: 'Gas Levels', icon: 'Wind', unit: 'PPM', color: '#2563eb', sectorId: 'mine1-sector-2', mineId: 'mine1' },
      { id: 'gas', name: 'Gas Levels', icon: 'Wind', unit: 'PPM', color: '#2563eb', sectorId: 'mine1-sector-3', mineId: 'mine1' },
      { id: 'gas', name: 'Gas Levels', icon: 'Wind', unit: 'PPM', color: '#2563eb', sectorId: 'mine2-sector-1', mineId: 'mine2' },
      { id: 'gas', name: 'Gas Levels', icon: 'Wind', unit: 'PPM', color: '#2563eb', sectorId: 'mine2-sector-2', mineId: 'mine2' },
      { id: 'gas', name: 'Gas Levels', icon: 'Wind', unit: 'PPM', color: '#2563eb', sectorId: 'mine2-sector-3', mineId: 'mine2' },
      { id: 'gas', name: 'Gas Levels', icon: 'Wind', unit: 'PPM', color: '#2563eb', sectorId: 'mine3-sector-1', mineId: 'mine3' },
      { id: 'gas', name: 'Gas Levels', icon: 'Wind', unit: 'PPM', color: '#2563eb', sectorId: 'mine3-sector-2', mineId: 'mine3' },
      { id: 'gas', name: 'Gas Levels', icon: 'Wind', unit: 'PPM', color: '#2563eb', sectorId: 'mine3-sector-3', mineId: 'mine3' },
      { id: 'gas', name: 'Gas Levels', icon: 'Wind', unit: 'PPM', color: '#2563eb', sectorId: 'mine4-sector-1', mineId: 'mine4' },
      { id: 'gas', name: 'Gas Levels', icon: 'Wind', unit: 'PPM', color: '#2563eb', sectorId: 'mine4-sector-2', mineId: 'mine4' },
      { id: 'gas', name: 'Gas Levels', icon: 'Wind', unit: 'PPM', color: '#2563eb', sectorId: 'mine4-sector-3', mineId: 'mine4' }
    ]
  },
  {
    id: 'temperature',
    name: 'Temperature',
    icon: 'ThermometerSun',
    unit: '°C',
    color: '#f59e0b',
    thresholds: {
      warning: 35,
      critical: 40
    },
    sectorSpecific: [
      { id: 'temperature', name: 'Temperature', icon: 'ThermometerSun', unit: '°C', color: '#f59e0b', sectorId: 'mine1-sector-1', mineId: 'mine1' },
      { id: 'temperature', name: 'Temperature', icon: 'ThermometerSun', unit: '°C', color: '#f59e0b', sectorId: 'mine1-sector-2', mineId: 'mine1' },
      { id: 'temperature', name: 'Temperature', icon: 'ThermometerSun', unit: '°C', color: '#f59e0b', sectorId: 'mine1-sector-3', mineId: 'mine1' },
      { id: 'temperature', name: 'Temperature', icon: 'ThermometerSun', unit: '°C', color: '#f59e0b', sectorId: 'mine2-sector-1', mineId: 'mine2' },
      { id: 'temperature', name: 'Temperature', icon: 'ThermometerSun', unit: '°C', color: '#f59e0b', sectorId: 'mine2-sector-2', mineId: 'mine2' },
      { id: 'temperature', name: 'Temperature', icon: 'ThermometerSun', unit: '°C', color: '#f59e0b', sectorId: 'mine2-sector-3', mineId: 'mine2' },
      { id: 'temperature', name: 'Temperature', icon: 'ThermometerSun', unit: '°C', color: '#f59e0b', sectorId: 'mine3-sector-1', mineId: 'mine3' },
      { id: 'temperature', name: 'Temperature', icon: 'ThermometerSun', unit: '°C', color: '#f59e0b', sectorId: 'mine3-sector-2', mineId: 'mine3' },
      { id: 'temperature', name: 'Temperature', icon: 'ThermometerSun', unit: '°C', color: '#f59e0b', sectorId: 'mine3-sector-3', mineId: 'mine3' },
      { id: 'temperature', name: 'Temperature', icon: 'ThermometerSun', unit: '°C', color: '#f59e0b', sectorId: 'mine4-sector-1', mineId: 'mine4' },
      { id: 'temperature', name: 'Temperature', icon: 'ThermometerSun', unit: '°C', color: '#f59e0b', sectorId: 'mine4-sector-2', mineId: 'mine4' },
      { id: 'temperature', name: 'Temperature', icon: 'ThermometerSun', unit: '°C', color: '#f59e0b', sectorId: 'mine4-sector-3', mineId: 'mine4' }
    ]
  },
  {
    id: 'seismic',
    name: 'Seismic Activity',
    icon: 'Activity',
    unit: 'Hz',
    color: '#dc2626',
    thresholds: {
      warning: 0.7,
      critical: 0.9
    },
    sectorSpecific: [
      { id: 'seismic', name: 'Seismic Activity', icon: 'Activity', unit: 'Hz', color: '#dc2626', sectorId: 'mine1-sector-1', mineId: 'mine1' },
      { id: 'seismic', name: 'Seismic Activity', icon: 'Activity', unit: 'Hz', color: '#dc2626', sectorId: 'mine1-sector-2', mineId: 'mine1' },
      { id: 'seismic', name: 'Seismic Activity', icon: 'Activity', unit: 'Hz', color: '#dc2626', sectorId: 'mine1-sector-3', mineId: 'mine1' },
      { id: 'seismic', name: 'Seismic Activity', icon: 'Activity', unit: 'Hz', color: '#dc2626', sectorId: 'mine2-sector-1', mineId: 'mine2' },
      { id: 'seismic', name: 'Seismic Activity', icon: 'Activity', unit: 'Hz', color: '#dc2626', sectorId: 'mine2-sector-2', mineId: 'mine2' },
      { id: 'seismic', name: 'Seismic Activity', icon: 'Activity', unit: 'Hz', color: '#dc2626', sectorId: 'mine2-sector-3', mineId: 'mine2' },
      { id: 'seismic', name: 'Seismic Activity', icon: 'Activity', unit: 'Hz', color: '#dc2626', sectorId: 'mine3-sector-1', mineId: 'mine3' },
      { id: 'seismic', name: 'Seismic Activity', icon: 'Activity', unit: 'Hz', color: '#dc2626', sectorId: 'mine3-sector-2', mineId: 'mine3' },
      { id: 'seismic', name: 'Seismic Activity', icon: 'Activity', unit: 'Hz', color: '#dc2626', sectorId: 'mine3-sector-3', mineId: 'mine3' },
      { id: 'seismic', name: 'Seismic Activity', icon: 'Activity', unit: 'Hz', color: '#dc2626', sectorId: 'mine4-sector-1', mineId: 'mine4' },
      { id: 'seismic', name: 'Seismic Activity', icon: 'Activity', unit: 'Hz', color: '#dc2626', sectorId: 'mine4-sector-2', mineId: 'mine4' },
      { id: 'seismic', name: 'Seismic Activity', icon: 'Activity', unit: 'Hz', color: '#dc2626', sectorId: 'mine4-sector-3', mineId: 'mine4' }
    ]
  },
  {
    id: 'strain',
    name: 'Structural Strain',
    icon: 'Mountain',
    unit: 'MPa',
    color: '#10b981',
    thresholds: {
      warning: 2.5,
      critical: 3
    },
    sectorSpecific: [
      { id: 'strain', name: 'Structural Strain', icon: 'Mountain', unit: 'MPa', color: '#10b981', sectorId: 'mine1-sector-1', mineId: 'mine1' },
      { id: 'strain', name: 'Structural Strain', icon: 'Mountain', unit: 'MPa', color: '#10b981', sectorId: 'mine1-sector-2', mineId: 'mine1' },
      { id: 'strain', name: 'Structural Strain', icon: 'Mountain', unit: 'MPa', color: '#10b981', sectorId: 'mine1-sector-3', mineId: 'mine1' },
      { id: 'strain', name: 'Structural Strain', icon: 'Mountain', unit: 'MPa', color: '#10b981', sectorId: 'mine2-sector-1', mineId: 'mine2' },
      { id: 'strain', name: 'Structural Strain', icon: 'Mountain', unit: 'MPa', color: '#10b981', sectorId: 'mine2-sector-2', mineId: 'mine2' },
      { id: 'strain', name: 'Structural Strain', icon: 'Mountain', unit: 'MPa', color: '#10b981', sectorId: 'mine2-sector-3', mineId: 'mine2' },
      { id: 'strain', name: 'Structural Strain', icon: 'Mountain', unit: 'MPa', color: '#10b981', sectorId: 'mine3-sector-1', mineId: 'mine3' },
      { id: 'strain', name: 'Structural Strain', icon: 'Mountain', unit: 'MPa', color: '#10b981', sectorId: 'mine3-sector-2', mineId: 'mine3' },
      { id: 'strain', name: 'Structural Strain', icon: 'Mountain', unit: 'MPa', color: '#10b981', sectorId: 'mine3-sector-3', mineId: 'mine3' },
      { id: 'strain', name: 'Structural Strain', icon: 'Mountain', unit: 'MPa', color: '#10b981', sectorId: 'mine4-sector-1', mineId: 'mine4' },
      { id: 'strain', name: 'Structural Strain', icon: 'Mountain', unit: 'MPa', color: '#10b981', sectorId: 'mine4-sector-2', mineId: 'mine4' },
      { id: 'strain', name: 'Structural Strain', icon: 'Mountain', unit: 'MPa', color: '#10b981', sectorId: 'mine4-sector-3', mineId: 'mine4' }
    ]
  }
];

export const sectorLabels = {
  'all': 'All Sectors',
  'mine1-sector-1': 'North Shaft - Sector A',
  'mine1-sector-2': 'North Shaft - Sector B',
  'mine1-sector-3': 'North Shaft - Sector C',
  'mine2-sector-1': 'Deep Core - Sector A',
  'mine2-sector-2': 'Deep Core - Sector B',
  'mine2-sector-3': 'Deep Core - Sector C',
  'mine3-sector-1': 'Eastern Tunnel - Sector A',
  'mine3-sector-2': 'Eastern Tunnel - Sector B',
  'mine3-sector-3': 'Eastern Tunnel - Sector C',
  'mine4-sector-1': 'Kigali Tunnel - Sector A',
  'mine4-sector-2': 'Kigali Tunnel - Sector B',
  'mine4-sector-3': 'Kigali Tunnel - Sector C'
};