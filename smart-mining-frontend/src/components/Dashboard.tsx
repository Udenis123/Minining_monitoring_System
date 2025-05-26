import React, { useState, useEffect, useCallback } from "react";
import { Sidebar } from "./Sidebar";
import { StatusCard } from "./StatusCard";
import { AlertsList } from "./AlertsList";
import { useAuthStore } from "../store/authStore";
import {
  mockSensorData,
  mockAlerts,
  mockMiners,
  mockMines,
} from "../data/mockData";
import {
  Activity,
  ThermometerSun,
  Wind,
  Mountain,
  AlertTriangle,
} from "lucide-react";
import mineService from "../services/mineService";
import { Mine, Sector } from "../types";

// Add interfaces for map configuration
interface Tunnel {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  width: number;
}

interface Sensor {
  x: number;
  y: number;
  type: string;
}

interface Miner {
  x: number;
  y: number;
}

interface Alert {
  x: number;
  y: number;
}

interface MapConfig {
  mainShaft: { x: number; y: number; length: number };
  tunnels: Tunnel[];
  sensors: Sensor[];
  miners: Miner[];
  alerts: Alert[];
}

interface MineMapConfigs {
  mine1: MapConfig;
  mine2: MapConfig;
  mine3: MapConfig;
  mine4: MapConfig;
  all: MapConfig;
  [key: string]: MapConfig; // Index signature
}

// Add interface for dynamic sensor data
interface DynamicSensorData {
  id: string;
  type: string;
  value: number;
  status: "normal" | "warning" | "critical";
  location: string;
  timestamp: Date;
  mine: string;
}

// Use different names to avoid conflicts with imported types
interface AlertData {
  id: string;
  type: "warning" | "critical" | "info";
  message: string;
  timestamp: Date;
  acknowledged: boolean;
  location: string;
  mine?: string;
  mineId?: string;
  sectorId?: string;
  x?: number;
  y?: number;
}

interface MinerInfo {
  id: string;
  name: string;
  status: "active" | "rest" | "emergency" | "inactive";
  role: string;
  location: string;
  lastUpdate: Date;
  mineId?: string;
  sectorId?: string;
}

// Add interface for dashboard metrics
interface DashboardMetrics {
  gas: { value: number; status: "normal" | "warning" | "critical" };
  temperature: { value: number; status: "normal" | "warning" | "critical" };
  seismic: { value: number; status: "normal" | "warning" | "critical" };
  strain: { value: number; status: "normal" | "warning" | "critical" };
  miners: {
    active: number;
    total: number;
    status: "normal" | "warning" | "critical";
  };
  alerts: {
    active: number;
    total: number;
    status: "normal" | "warning" | "critical";
  };
}

// Add interfaces for random alerts
interface RandomAlert {
  id: string;
  type: "warning" | "critical" | "info";
  message: string;
  timestamp: Date;
  acknowledged: boolean;
  location: string;
  sensor?: string;
}

export function Dashboard() {
  const user = useAuthStore((state) => state.user);
  const [selectedLocation, setSelectedLocation] = useState<string>("all");
  const [selectedSector, setSelectedSector] = useState<string>("all");
  const [mines, setMines] = useState<Mine[]>([]);
  const [loading, setLoading] = useState(true);
  const [dynamicSensorData, setDynamicSensorData] = useState<
    DynamicSensorData[]
  >([]);
  const [dynamicAlerts, setDynamicAlerts] =
    useState<Record<string, any[]>>(mockAlerts);
  const [dynamicMiners, setDynamicMiners] =
    useState<Record<string, any[]>>(mockMiners);
  const [sectorChangeCounter, setSectorChangeCounter] = useState(0);
  const [dashboardMetrics, setDashboardMetrics] = useState<DashboardMetrics>({
    gas: { value: 20, status: "normal" },
    temperature: { value: 24, status: "normal" },
    seismic: { value: 0.8, status: "normal" },
    strain: { value: 2.5, status: "normal" },
    miners: { active: 15, total: 20, status: "normal" },
    alerts: { active: 0, total: 0, status: "normal" },
  });
  const [recentAlerts, setRecentAlerts] = useState<RandomAlert[]>([]);

  // Function to generate random sensor values for different sensor types
  const generateRandomSensorValue = (type: string) => {
    // Define normal ranges for each sensor type
    const ranges = {
      gas: { min: 5, max: 50, critical: 80, warning: 40 },
      temperature: { min: 18, max: 28, critical: 35, warning: 30 },
      seismic: { min: 0.1, max: 1.5, critical: 4, warning: 2.5 },
      strain: { min: 0.5, max: 5, critical: 12, warning: 8 },
    };

    const range = ranges[type as keyof typeof ranges];

    // Generate a random value within the range
    // Occasionally generate warning or critical values (10% chance for each)
    const rand = Math.random();
    let value;
    let status: "normal" | "warning" | "critical" = "normal";

    if (rand < 0.05) {
      // 5% chance for critical value
      value = range.critical + Math.random() * range.critical * 0.2;
      status = "critical";
    } else if (rand < 0.15) {
      // 10% chance for warning value
      value =
        range.warning + Math.random() * (range.critical - range.warning) * 0.8;
      status = "warning";
    } else {
      // 85% chance for normal value
      value = range.min + Math.random() * (range.warning - range.min) * 0.9;
    }

    return { value, status };
  };

  // Function to generate a complete set of random sensor data
  const generateRandomSensorData = useCallback(() => {
    const sensorTypes = ["gas", "temperature", "seismic", "strain"];
    const locations = [
      "Main Shaft",
      "North Tunnel",
      "East Tunnel",
      "West Tunnel",
      "Level 1",
      "Level 2",
      "Level 3",
      "Deep Core",
      "Entrance",
    ];
    const mineIds = ["mine1", "mine2", "mine3", "mine4"];

    const newSensorData: DynamicSensorData[] = [];

    // Generate 20-30 random sensors
    const sensorCount = 20 + Math.floor(Math.random() * 10);

    for (let i = 0; i < sensorCount; i++) {
      const type = sensorTypes[Math.floor(Math.random() * sensorTypes.length)];
      const location = locations[Math.floor(Math.random() * locations.length)];
      const mine = mineIds[Math.floor(Math.random() * mineIds.length)];
      const { value, status } = generateRandomSensorValue(type);

      newSensorData.push({
        id: `sensor-${i}-${Math.random().toString(36).substring(2, 8)}`,
        type,
        value,
        status,
        location,
        timestamp: new Date(),
        mine,
      });
    }

    return newSensorData;
  }, []);

  // Function to generate alerts based on sensor data
  const generateAlertsFromSensors = useCallback(
    (sensors: DynamicSensorData[]) => {
      const newAlerts: Record<string, any[]> = {};

      // Find critical and warning sensors
      const criticalSensors = sensors.filter((s) => s.status === "critical");
      const warningSensors = sensors.filter((s) => s.status === "warning");

      // Group by mine
      [...criticalSensors, ...warningSensors].forEach((sensor) => {
        if (!newAlerts[sensor.mine]) {
          newAlerts[sensor.mine] = [];
        }

        if (sensor.status === "critical") {
          newAlerts[sensor.mine].push({
            id: `alert-${Math.random().toString(36).substring(2, 8)}`,
            type: "critical",
            message: `Critical ${sensor.type} levels detected in ${sensor.location}`,
            timestamp: new Date(),
            acknowledged: false,
            location: sensor.location,
          });
        } else {
          newAlerts[sensor.mine].push({
            id: `alert-${Math.random().toString(36).substring(2, 8)}`,
            type: "warning",
            message: `Elevated ${sensor.type} levels in ${sensor.location}`,
            timestamp: new Date(),
            acknowledged: Math.random() > 0.7, // 30% chance of being acknowledged
            location: sensor.location,
          });
        }
      });

      return newAlerts;
    },
    []
  );

  // Function to generate random miner data
  const generateRandomMiners = useCallback(() => {
    const newMiners: Record<string, any[]> = {};
    const mineIds = ["mine1", "mine2", "mine3", "mine4"];
    const roles = [
      "Driller",
      "Engineer",
      "Supervisor",
      "Technician",
      "Geologist",
    ];
    const locations = [
      "Main Shaft",
      "North Tunnel",
      "East Tunnel",
      "West Tunnel",
      "Level 1",
      "Level 2",
      "Level 3",
      "Deep Core",
      "Entrance",
    ];

    mineIds.forEach((mineId) => {
      const minerCount = 5 + Math.floor(Math.random() * 15); // 5-20 miners per mine
      newMiners[mineId] = [];

      for (let i = 0; i < minerCount; i++) {
        const status =
          Math.random() < 0.8
            ? "active"
            : Math.random() < 0.9
            ? "rest"
            : "emergency";
        newMiners[mineId].push({
          id: `miner-${mineId}-${i}`,
          name: `Miner ${i + 1}`,
          role: roles[Math.floor(Math.random() * roles.length)],
          status,
          location: locations[Math.floor(Math.random() * locations.length)],
          lastUpdate: new Date(),
        });
      }
    });

    return newMiners;
  }, []);

  // Function to generate random metrics for the dashboard
  const generateRandomDashboardMetrics = useCallback(() => {
    // Define normal ranges and thresholds for each metric
    const ranges = {
      gas: { min: 5, max: 50, critical: 80, warning: 40 },
      temperature: { min: 18, max: 28, critical: 35, warning: 30 },
      seismic: { min: 0.1, max: 1.5, critical: 4, warning: 2.5 },
      strain: { min: 0.5, max: 5, critical: 12, warning: 8 },
    };

    // Generate random values with a chance of warning/critical values
    const generateValue = (type: keyof typeof ranges) => {
      const range = ranges[type];
      const rand = Math.random();
      let value;
      let status: "normal" | "warning" | "critical" = "normal";

      if (rand < 0.05) {
        // 5% chance for critical value
        value = range.critical + Math.random() * range.critical * 0.2;
        status = "critical";
      } else if (rand < 0.15) {
        // 10% chance for warning value
        value =
          range.warning +
          Math.random() * (range.critical - range.warning) * 0.8;
        status = "warning";
      } else {
        // 85% chance for normal value
        value = range.min + Math.random() * (range.warning - range.min) * 0.9;
      }

      return { value, status };
    };

    // Generate random miner counts
    const totalMiners = 10 + Math.floor(Math.random() * 30); // 10-40 miners
    const activeMiners = Math.floor(totalMiners * (0.7 + Math.random() * 0.3)); // 70-100% active
    const emergencyMiners =
      Math.random() < 0.1 ? Math.floor(Math.random() * 3) + 1 : 0; // 10% chance of emergency
    const minerStatus: "normal" | "warning" | "critical" =
      emergencyMiners > 0 ? "critical" : "normal";

    // Generate random alert counts
    const totalAlerts = Math.floor(Math.random() * 10);
    const activeAlerts = Math.floor(totalAlerts * (0.6 + Math.random() * 0.4)); // 60-100% active
    const criticalAlerts =
      Math.random() < 0.15 ? Math.floor(Math.random() * 3) + 1 : 0; // 15% chance of critical alerts
    const alertStatus: "normal" | "warning" | "critical" =
      criticalAlerts > 0 ? "critical" : activeAlerts > 0 ? "warning" : "normal";

    return {
      gas: generateValue("gas"),
      temperature: generateValue("temperature"),
      seismic: generateValue("seismic"),
      strain: generateValue("strain"),
      miners: {
        active: activeMiners,
        total: totalMiners,
        status: minerStatus,
      },
      alerts: {
        active: activeAlerts,
        total: totalAlerts,
        status: alertStatus,
      },
    };
  }, []);

  // Function to generate random alerts
  const generateRandomAlerts = useCallback(() => {
    const alertTypes: ("warning" | "critical" | "info")[] = [
      "warning",
      "critical",
      "info",
    ];
    const alertCount = Math.floor(Math.random() * 8) + 2; // 2-10 alerts
    const locations = [
      "Main Shaft",
      "North Tunnel",
      "East Tunnel",
      "West Tunnel",
      "Level 1",
      "Level 2",
      "Level 3",
      "Deep Core",
      "Entrance",
    ];
    const sensorTypes = ["gas", "temperature", "seismic", "strain"];

    const alertMessages = {
      gas: [
        "Elevated methane levels detected",
        "CO2 concentration above threshold",
        "Oxygen levels decreasing",
        "Hazardous gas buildup detected",
      ],
      temperature: [
        "Temperature spike detected",
        "High heat reading in sector",
        "Temperature exceeding safe limits",
        "Rapid temperature increase detected",
      ],
      seismic: [
        "Abnormal seismic activity detected",
        "Minor tremors detected",
        "Seismic instability increasing",
        "Structural vibration detected",
      ],
      strain: [
        "Structural stress detected",
        "Support beam strain increasing",
        "Wall pressure exceeding threshold",
        "Ceiling support strain detected",
      ],
      info: [
        "Routine maintenance scheduled",
        "Shift change in progress",
        "New safety protocol active",
        "System calibration complete",
      ],
    };

    // Generate random timestamp within the last 24 hours
    const getRandomTimestamp = () => {
      const now = new Date();
      const hoursAgo = Math.random() * 24;
      return new Date(now.getTime() - hoursAgo * 60 * 60 * 1000);
    };

    const newAlerts: RandomAlert[] = [];

    for (let i = 0; i < alertCount; i++) {
      const type = alertTypes[Math.floor(Math.random() * alertTypes.length)];
      const location = locations[Math.floor(Math.random() * locations.length)];
      const sensorType =
        sensorTypes[Math.floor(Math.random() * sensorTypes.length)];

      // Select message based on sensor type or info
      let messageSource =
        type === "info"
          ? alertMessages.info
          : alertMessages[sensorType as keyof typeof alertMessages];
      const message =
        messageSource[Math.floor(Math.random() * messageSource.length)];

      newAlerts.push({
        id: `alert-${Math.random().toString(36).substring(2, 8)}`,
        type,
        message,
        timestamp: getRandomTimestamp(),
        acknowledged: Math.random() > 0.7, // 30% chance of being acknowledged
        location,
        sensor: type !== "info" ? sensorType : undefined,
      });
    }

    // Sort by timestamp, most recent first
    return newAlerts.sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    );
  }, []);

  // Generate new random data when sector changes
  useEffect(() => {
    const newMetrics = generateRandomDashboardMetrics();
    setDashboardMetrics(newMetrics);

    // Generate new random alerts
    const newAlerts = generateRandomAlerts();
    setRecentAlerts(newAlerts);

    // Also update the other random data
    const newSensorData = generateRandomSensorData();
    setDynamicSensorData(newSensorData);

    const newAlertsData = generateAlertsFromSensors(newSensorData);
    setDynamicAlerts(newAlertsData);

    const newMiners = generateRandomMiners();
    setDynamicMiners(newMiners);
  }, [
    selectedSector,
    sectorChangeCounter,
    generateRandomDashboardMetrics,
    generateRandomSensorData,
    generateAlertsFromSensors,
    generateRandomMiners,
    generateRandomAlerts,
  ]);

  // Fetch mines from backend
  useEffect(() => {
    const fetchMines = async () => {
      try {
        setLoading(true);
        const data = await mineService.getAllMines();
        setMines(data || []);

        // If we have mines, select the first one by default
        if (data && data.length > 0) {
          setSelectedLocation(data[0].id);

          // If the first mine has sectors, select the first sector
          if (data[0].sectors && data[0].sectors.length > 0) {
            setSelectedSector(data[0].sectors[0].id);
          }
        }
      } catch (error) {
        console.error("Error fetching mines:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMines();
  }, []);

  // Handle location change
  const handleLocationChange = (locationId: string) => {
    setSelectedLocation(locationId);

    // If "All Locations" is selected, reset sector to "All Sectors"
    if (locationId === "all") {
      setSelectedSector("all");
      return;
    }

    // Find the selected mine
    const selectedMine = mines.find((mine) => mine.id === locationId);

    // If the mine has sectors, select the first one
    if (
      selectedMine &&
      selectedMine.sectors &&
      selectedMine.sectors.length > 0
    ) {
      setSelectedSector(selectedMine.sectors[0].id);
    } else {
      // If no sectors, set to "All Sectors"
      setSelectedSector("all");
    }

    // Regenerate random data
    setSectorChangeCounter((prev) => prev + 1);
  };

  // Handle sector change
  const handleSectorChange = (sectorId: string) => {
    setSelectedSector(sectorId);
    // Regenerate random data
    setSectorChangeCounter((prev) => prev + 1);
  };

  // Get selected mine data for the map
  const selectedMine =
    selectedLocation !== "all"
      ? mines.find((mine) => mine.id === selectedLocation) ||
        mockMines.find((mine) => mine.id === selectedLocation)
      : null;

  // Get sectors from the selected mine
  const sectors = selectedMine?.sectors || [];

  // Get the selected sector object
  const activeSector =
    selectedSector !== "all"
      ? sectors.find((sector) => sector.id === selectedSector)
      : null;

  // Filter sensor data based on selected location and sector
  const filteredSensorData = dynamicSensorData.filter((sensor) => {
    if (selectedLocation === "all") return true;
    if (sensor.mine !== selectedLocation) return false;
    if (selectedSector === "all") return true;

    // This is a simplification - in a real app, you'd have proper sector IDs in your sensor data
    return sensor.location
      .toLowerCase()
      .includes(activeSector?.name.toLowerCase() || "");
  });

  // Use filtered sensor data
  const sensorData = filteredSensorData;

  // Update alerts and miners filtering based on sector
  const alerts =
    selectedLocation === "all"
      ? Object.values(dynamicAlerts).flat()
      : selectedSector === "all"
      ? dynamicAlerts[selectedLocation] || []
      : (dynamicAlerts[selectedLocation] || []).filter((alert) =>
          alert.location
            .toLowerCase()
            .includes(activeSector?.name.toLowerCase() || "")
        );

  const miners =
    selectedLocation === "all"
      ? Object.values(dynamicMiners).flat()
      : selectedSector === "all"
      ? dynamicMiners[selectedLocation] || []
      : (dynamicMiners[selectedLocation] || []).filter((miner) =>
          miner.location
            .toLowerCase()
            .includes(activeSector?.name.toLowerCase() || "")
        );

  // Map configurations per mine
  const mineMapConfigs: MineMapConfigs = {
    mine1: {
      mainShaft: { x: 400, y: 50, length: 500 },
      tunnels: [
        { x1: 400, y1: 150, x2: 650, y2: 150, width: 14 }, // East 1
        { x1: 400, y1: 300, x2: 600, y2: 300, width: 14 }, // East 2
        { x1: 400, y1: 200, x2: 150, y2: 200, width: 14 }, // West 1
        { x1: 400, y1: 350, x2: 200, y2: 350, width: 14 }, // West 2
      ],
      sensors: [
        { x: 550, y: 150, type: "gas" },
        { x: 500, y: 300, type: "temperature" },
        { x: 250, y: 200, type: "seismic" },
        { x: 300, y: 350, type: "strain" },
      ],
      miners: [
        { x: 480, y: 150 },
        { x: 450, y: 300 },
        { x: 300, y: 200 },
      ],
      alerts: sensorData
        .filter((s) => s.status === "warning" || s.status === "critical")
        .map((s) => {
          // Map sensor location to coordinates based on type
          if (s.type === "gas") return { x: 550, y: 150 };
          if (s.type === "temperature") return { x: 500, y: 300 };
          if (s.type === "seismic") return { x: 250, y: 200 };
          if (s.type === "strain") return { x: 300, y: 350 };
          return { x: 400, y: 200 };
        }),
    },
    mine2: {
      mainShaft: { x: 400, y: 50, length: 500 },
      tunnels: [
        { x1: 400, y1: 150, x2: 700, y2: 150, width: 16 }, // East 1
        { x1: 400, y1: 300, x2: 650, y2: 300, width: 16 }, // East 2
        { x1: 400, y1: 450, x2: 680, y2: 450, width: 16 }, // East 3
        { x1: 400, y1: 200, x2: 100, y2: 200, width: 14 }, // West 1
        { x1: 400, y1: 350, x2: 150, y2: 350, width: 14 }, // West 2
        { x1: 400, y1: 500, x2: 200, y2: 500, width: 14 }, // West 3
      ],
      sensors: [
        { x: 600, y: 150, type: "gas" },
        { x: 550, y: 300, type: "temperature" },
        { x: 580, y: 450, type: "seismic" },
        { x: 200, y: 200, type: "strain" },
        { x: 250, y: 350, type: "gas" },
        { x: 300, y: 500, type: "temperature" },
      ],
      miners: [
        { x: 500, y: 150 },
        { x: 520, y: 300 },
        { x: 300, y: 350 },
        { x: 400, y: 250 },
      ],
      alerts: sensorData
        .filter((s) => s.status === "warning" || s.status === "critical")
        .map((s) => {
          if (s.type === "gas") return { x: 600, y: 150 };
          if (s.type === "temperature") return { x: 550, y: 300 };
          return { x: 400, y: 200 };
        }),
    },
    mine3: {
      mainShaft: { x: 400, y: 50, length: 500 },
      tunnels: [
        { x1: 400, y1: 150, x2: 650, y2: 150, width: 14 }, // East 1
        { x1: 400, y1: 250, x2: 600, y2: 250, width: 14 }, // East 2
        { x1: 400, y1: 350, x2: 620, y2: 350, width: 14 }, // East 3
        { x1: 400, y1: 200, x2: 200, y2: 200, width: 14 }, // West 1
        { x1: 400, y1: 300, x2: 250, y2: 300, width: 14 }, // West 2
      ],
      sensors: [
        { x: 550, y: 150, type: "gas" },
        { x: 520, y: 250, type: "temperature" },
        { x: 560, y: 350, type: "seismic" },
        { x: 280, y: 200, type: "strain" },
        { x: 320, y: 300, type: "gas" },
      ],
      miners: [
        { x: 500, y: 150 },
        { x: 450, y: 250 },
        { x: 350, y: 300 },
      ],
      alerts: sensorData
        .filter((s) => s.status === "warning" || s.status === "critical")
        .map((s) => {
          if (s.type === "gas") return { x: 550, y: 150 };
          return { x: 400, y: 200 };
        }),
    },
    mine4: {
      mainShaft: { x: 400, y: 50, length: 500 },
      tunnels: [
        { x1: 400, y1: 150, x2: 700, y2: 150, width: 14 }, // East 1
        { x1: 400, y1: 300, x2: 650, y2: 300, width: 14 }, // East 2
        { x1: 400, y1: 450, x2: 680, y2: 450, width: 14 }, // East 3
        { x1: 400, y1: 200, x2: 100, y2: 200, width: 14 }, // West 1
        { x1: 400, y1: 350, x2: 150, y2: 350, width: 14 }, // West 2
      ],
      sensors: [
        { x: 550, y: 150, type: "gas" },
        { x: 600, y: 300, type: "temperature" },
        { x: 620, y: 450, type: "seismic" },
        { x: 200, y: 200, type: "strain" },
        { x: 250, y: 350, type: "gas" },
      ],
      miners: [
        { x: 480, y: 150 },
        { x: 520, y: 300 },
        { x: 300, y: 350 },
        { x: 400, y: 250 },
      ],
      alerts: sensorData
        .filter((s) => s.status === "warning" || s.status === "critical")
        .map((s) => {
          if (s.type === "gas" && s.location === "Level 1")
            return { x: 550, y: 150 };
          if (s.type === "temperature") return { x: 600, y: 300 };
          return { x: 400, y: 200 };
        }),
    },
    // Default map for "All Locations" view
    all: {
      mainShaft: { x: 400, y: 50, length: 500 },
      tunnels: [
        { x1: 400, y1: 150, x2: 700, y2: 150, width: 14 }, // East 1
        { x1: 400, y1: 300, x2: 650, y2: 300, width: 14 }, // East 2
        { x1: 400, y1: 450, x2: 680, y2: 450, width: 14 }, // East 3
        { x1: 400, y1: 200, x2: 100, y2: 200, width: 14 }, // West 1
        { x1: 400, y1: 350, x2: 150, y2: 350, width: 14 }, // West 2
        { x1: 400, y1: 500, x2: 180, y2: 500, width: 14 }, // West 3
      ],
      sensors: [
        { x: 550, y: 150, type: "gas" },
        { x: 600, y: 300, type: "temperature" },
        { x: 620, y: 450, type: "seismic" },
        { x: 200, y: 200, type: "strain" },
        { x: 250, y: 350, type: "gas" },
        { x: 300, y: 500, type: "temperature" },
      ],
      miners: [
        { x: 480, y: 150 },
        { x: 520, y: 300 },
        { x: 300, y: 350 },
        { x: 400, y: 250 },
      ],
      alerts: alerts.map((a, i) => {
        // For all locations view, place alerts in various positions
        const positions = [
          { x: 650, y: 450 },
          { x: 550, y: 150 },
          { x: 200, y: 200 },
        ];
        return positions[i % positions.length];
      }),
    },
  };

  // Get the current map configuration based on selected location
  const currentMapConfig: MapConfig =
    mineMapConfigs[selectedLocation as keyof MineMapConfigs] ||
    mineMapConfigs.all;

  // Update alert locations in map config based on dynamic sensor data
  if (
    sensorData.some((s) => s.status === "critical" || s.status === "warning")
  ) {
    // Find critical or warning sensors
    const alertSensors = sensorData.filter(
      (s) => s.status === "critical" || s.status === "warning"
    );

    // Update alerts in map config with positions based on sensor types
    if (alertSensors.length > 0 && currentMapConfig.alerts) {
      // This is a simplification - in a real app, you'd have proper coordinates for each sensor
      // Here we're just using the existing alert positions from the map config
      const alertPositions = [...currentMapConfig.alerts];

      // Limit the number of alerts to the available positions
      const alertCount = Math.min(alertSensors.length, alertPositions.length);

      // Use only the first alertCount positions
      currentMapConfig.alerts = alertPositions.slice(0, alertCount);
    }
  }

  // Helper function to get sensor status for cards
  const getSensorStatus = (type: string) => {
    const typeSensors = sensorData.filter((s) => s.type === type);
    if (typeSensors.some((s) => s.status === "critical")) return "critical";
    if (typeSensors.some((s) => s.status === "warning")) return "warning";
    return "normal";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="ml-64 p-8">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Mining Operations Dashboard
              </h1>
              <p className="mt-1 text-gray-500">Welcome, {user?.name}</p>
            </div>
            {loading ? (
              <div className="flex space-x-4">
                <div className="w-40 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
                <div className="w-40 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <select
                  value={selectedLocation}
                  onChange={(e) => handleLocationChange(e.target.value)}
                  className="px-4 py-2 border rounded-lg bg-white"
                  disabled={mines.length === 0}
                >
                  <option value="all">All Locations</option>
                  {mines.map((mine) => (
                    <option key={mine.id} value={mine.id}>
                      {mine.name}
                    </option>
                  ))}
                </select>

                {selectedMine && (
                  <select
                    value={selectedSector}
                    onChange={(e) => handleSectorChange(e.target.value)}
                    className="px-4 py-2 border rounded-lg bg-white"
                    disabled={
                      !selectedMine?.sectors ||
                      selectedMine.sectors.length === 0
                    }
                  >
                    <option value="all">All Sectors</option>
                    {sectors.map((sector) => (
                      <option key={sector.id} value={sector.id}>
                        {sector.name} (Level {sector.level})
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm p-4 h-24">
                <div className="w-full h-full bg-gray-200 rounded-lg animate-pulse"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
            <div className="lg:col-span-1">
              <StatusCard
                title="Gas Levels"
                value={`${dashboardMetrics.gas.value.toFixed(1)} PPM`}
                status={dashboardMetrics.gas.status}
                icon={Wind}
              />
            </div>
            <div className="lg:col-span-1">
              <StatusCard
                title="Temperature"
                value={`${dashboardMetrics.temperature.value.toFixed(1)}°C`}
                status={dashboardMetrics.temperature.status}
                icon={ThermometerSun}
              />
            </div>
            <div className="lg:col-span-1">
              <StatusCard
                title="Seismic Activity"
                value={`${dashboardMetrics.seismic.value.toFixed(2)} Hz`}
                status={dashboardMetrics.seismic.status}
                icon={Activity}
              />
            </div>
            <div className="lg:col-span-1">
              <StatusCard
                title="Structural Strain"
                value={`${dashboardMetrics.strain.value.toFixed(2)} MPa`}
                status={dashboardMetrics.strain.status}
                icon={Mountain}
              />
            </div>
            <div className="lg:col-span-1">
              <StatusCard
                title="Active Miners"
                value={dashboardMetrics.miners.active}
                status={dashboardMetrics.miners.status}
              />
            </div>
            <div className="lg:col-span-1">
              <StatusCard
                title="Active Alerts"
                value={dashboardMetrics.alerts.active}
                status={dashboardMetrics.alerts.status}
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Mining Map</h2>
              {selectedMine && (
                <div className="text-sm text-gray-500">
                  {selectedMine.name}
                  {activeSector
                    ? ` - ${activeSector.name} (Level ${activeSector.level})`
                    : ""}
                  - Depth: {selectedMine.depth}m
                </div>
              )}
            </div>
            <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden">
              <div className="absolute inset-0 bg-gray-800 bg-opacity-5 z-0">
                <svg
                  width="100%"
                  height="100%"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <pattern
                      id="grid"
                      width="20"
                      height="20"
                      patternUnits="userSpaceOnUse"
                    >
                      <path
                        d="M 20 0 L 0 0 0 20"
                        fill="none"
                        stroke="rgba(0,0,0,0.1)"
                        strokeWidth="0.5"
                      />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>
              </div>

              {/* Map Tunnels */}
              <div className="absolute inset-0 z-10 p-4">
                <svg
                  width="100%"
                  height="100%"
                  viewBox="0 0 800 600"
                  preserveAspectRatio="xMidYMid meet"
                >
                  {/* Main shaft */}
                  <path
                    d={`M${currentMapConfig.mainShaft.x},${
                      currentMapConfig.mainShaft.y
                    } L${currentMapConfig.mainShaft.x},${
                      currentMapConfig.mainShaft.y +
                      currentMapConfig.mainShaft.length
                    }`}
                    stroke="#555"
                    strokeWidth="20"
                    fill="none"
                  />

                  {/* Tunnels based on current configuration */}
                  {currentMapConfig.tunnels.map(
                    (tunnel: Tunnel, index: number) => (
                      <path
                        key={index}
                        d={`M${tunnel.x1},${tunnel.y1} L${tunnel.x2},${tunnel.y2}`}
                        stroke="#555"
                        strokeWidth={tunnel.width}
                        fill="none"
                      />
                    )
                  )}

                  {/* Sensors */}
                  {currentMapConfig.sensors.map(
                    (sensor: Sensor, index: number) => (
                      <circle
                        key={`sensor-${index}`}
                        cx={sensor.x}
                        cy={sensor.y}
                        r="8"
                        fill={
                          sensor.type === "gas"
                            ? "#3b82f6"
                            : sensor.type === "temperature"
                            ? "#f59e0b"
                            : sensor.type === "seismic"
                            ? "#dc2626"
                            : "#10b981"
                        }
                      />
                    )
                  )}

                  {/* Miners */}
                  {currentMapConfig.miners.map(
                    (miner: Miner, index: number) => (
                      <circle
                        key={`miner-${index}`}
                        cx={miner.x}
                        cy={miner.y}
                        r="6"
                        fill="#22c55e"
                      />
                    )
                  )}

                  {/* Alert locations */}
                  {currentMapConfig.alerts.map(
                    (alert: Alert, index: number) => (
                      <g
                        key={`alert-${index}`}
                        transform={`translate(${alert.x},${alert.y})`}
                      >
                        <circle r="12" fill="#ef4444" fillOpacity="0.3">
                          <animate
                            attributeName="r"
                            values="12;18;12"
                            dur="1.5s"
                            repeatCount="indefinite"
                          />
                        </circle>
                        <circle r="6" fill="#ef4444" />
                      </g>
                    )
                  )}
                </svg>
              </div>

              {/* Legend */}
              <div className="absolute bottom-2 right-2 bg-white bg-opacity-80 rounded-md p-2 text-xs z-20">
                <div className="flex items-center mb-1">
                  <div className="w-3 h-3 rounded-full bg-gray-600 mr-1"></div>
                  <span>Tunnels</span>
                </div>
                <div className="flex items-center mb-1">
                  <div className="w-3 h-3 rounded-full bg-blue-500 mr-1"></div>
                  <span>Sensors</span>
                </div>
                <div className="flex items-center mb-1">
                  <div className="w-3 h-3 rounded-full bg-green-500 mr-1"></div>
                  <span>Miners</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-red-500 mr-1"></div>
                  <span>Alert</span>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Recent Alerts</h2>
              <div className="text-sm text-gray-500">
                {dashboardMetrics.alerts.active} active alerts
              </div>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-gray-100 h-16 rounded-lg animate-pulse"
                  ></div>
                ))}
              </div>
            ) : recentAlerts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No alerts to display
              </div>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {recentAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-3 rounded-lg border flex items-start ${
                      alert.type === "critical"
                        ? "bg-red-50 border-red-200"
                        : alert.type === "warning"
                        ? "bg-yellow-50 border-yellow-200"
                        : "bg-blue-50 border-blue-200"
                    } ${alert.acknowledged ? "opacity-60" : ""}`}
                  >
                    <div
                      className={`rounded-full p-2 mr-3 flex-shrink-0 ${
                        alert.type === "critical"
                          ? "bg-red-100 text-red-600"
                          : alert.type === "warning"
                          ? "bg-yellow-100 text-yellow-600"
                          : "bg-blue-100 text-blue-600"
                      }`}
                    >
                      {alert.type === "critical" ? (
                        <AlertTriangle className="w-4 h-4" />
                      ) : alert.type === "warning" ? (
                        <AlertTriangle className="w-4 h-4" />
                      ) : (
                        <Activity className="w-4 h-4" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h3
                          className={`text-sm font-medium ${
                            alert.type === "critical"
                              ? "text-red-800"
                              : alert.type === "warning"
                              ? "text-yellow-800"
                              : "text-blue-800"
                          }`}
                        >
                          {alert.message}
                        </h3>
                        <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                          {formatTimeAgo(alert.timestamp)}
                        </span>
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        {alert.location}
                        {alert.sensor && ` • ${alert.sensor} sensor`}
                        {alert.acknowledged && " • acknowledged"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to format timestamps as "time ago"
function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
}
