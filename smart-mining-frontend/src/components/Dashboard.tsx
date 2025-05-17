import React, { useState, useEffect } from "react";
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

export function Dashboard() {
  const user = useAuthStore((state) => state.user);
  const [selectedLocation, setSelectedLocation] = useState("all");

  const locations = [
    { id: "all", name: "All Locations" },
    { id: "mine1", name: "North Shaft Mine" },
    { id: "mine2", name: "Deep Core Mine" },
    { id: "mine3", name: "Eastern Tunnel" },
    { id: "mine4", name: "Kigali Tunnel" },
  ];

  // Get data based on selected location, without role restrictions
  const selectedMineId = selectedLocation;

  const sensorData =
    selectedLocation === "all"
      ? Object.values(mockSensorData).flat()
      : mockSensorData[selectedMineId] || [];

  const alerts =
    selectedLocation === "all"
      ? Object.values(mockAlerts).flat()
      : mockAlerts[selectedMineId] || [];

  const miners =
    selectedLocation === "all"
      ? Object.values(mockMiners).flat()
      : mockMiners[selectedMineId] || [];

  // Get selected mine data for the map
  const selectedMine =
    selectedLocation !== "all"
      ? mockMines.find((mine) => mine.id === selectedLocation)
      : null;

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
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="px-4 py-2 border rounded-lg bg-white"
            >
              {locations.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          <div className="lg:col-span-1">
            <StatusCard
              title="Gas Levels"
              value={`${
                sensorData.find((s) => s.type === "gas")?.value || 0
              } PPM`}
              status="normal"
              icon={Wind}
            />
          </div>
          <div className="lg:col-span-1">
            <StatusCard
              title="Temperature"
              value={`${
                sensorData.find((s) => s.type === "temperature")?.value || 0
              }°C`}
              status="normal"
              icon={ThermometerSun}
            />
          </div>
          <div className="lg:col-span-1">
            <StatusCard
              title="Seismic Activity"
              value={`${(
                sensorData.find((s) => s.type === "seismic")?.value || 0
              ).toFixed(2)} Hz`}
              status="normal"
              icon={Activity}
            />
          </div>
          <div className="lg:col-span-1">
            <StatusCard
              title="Structural Strain"
              value={`${(
                sensorData.find((s) => s.type === "strain")?.value || 0
              ).toFixed(2)} MPa`}
              status="normal"
              icon={Mountain}
            />
          </div>
          <div className="lg:col-span-1">
            <StatusCard
              title="Active Miners"
              value={miners.filter((m) => m.status === "active").length}
              status="normal"
            />
          </div>
          <div className="lg:col-span-1">
            <StatusCard
              title="Active Alerts"
              value={alerts.filter((a) => !a.acknowledged).length}
              status={
                alerts.some((a) => a.type === "critical")
                  ? "critical"
                  : "normal"
              }
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Mining Map</h2>
              {selectedMine && (
                <div className="text-sm text-gray-500">
                  {selectedMine.name} - Depth: {selectedMine.depth}m
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
          <AlertsList alerts={alerts} />
        </div>
      </div>
    </div>
  );
}
