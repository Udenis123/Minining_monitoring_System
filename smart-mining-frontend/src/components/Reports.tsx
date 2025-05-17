import React, { useState, useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { useAuthStore } from "../store/authStore";
import {
  mockSensorData,
  mockAlerts,
  mockMiners,
  mockMines,
  sectorLabels,
} from "../data/mockData";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Download, Filter, Calendar } from "lucide-react";

export function Reports() {
  const user = useAuthStore((state) => state.user);
  console.log(user?.permissions);

  // Start with the first mine selected by default instead of "all"
  const defaultMine = mockMines.length > 0 ? mockMines[0].id : "all";
  const [selectedLocation, setSelectedLocation] = useState(defaultMine);

  // Get available sectors for the selected location
  const getAvailableSectorsForLocation = (locationId: string) => {
    if (locationId === "all") {
      return Object.entries(sectorLabels).map(([id, name]) => ({ id, name }));
    }

    // Find the corresponding mine
    const selectedMine = mockMines.find((mine) => mine.id === locationId);
    if (!selectedMine) return [];

    // Get sector IDs for this mine from sectorLabels
    return Object.entries(sectorLabels)
      .filter(([id]) => id === "all" || id.startsWith(`${locationId}-`))
      .map(([id, name]) => ({ id, name }));
  };

  // Function to extract the base sector ID from a combined ID (mine1-sector-1 -> sector-1)
  const extractBaseSectorId = (fullSectorId: string) => {
    if (fullSectorId === "all") return "all";
    const parts = fullSectorId.split("-");
    // If it has at least 3 parts (mine1-sector-1), extract the base sector id (sector-1)
    if (parts.length >= 3) {
      return `${parts[1]}-${parts[2]}`;
    }
    return fullSectorId; // Return as is if it doesn't match the expected format
  };

  // Get sectors for the selected location
  const availableSectors = getAvailableSectorsForLocation(selectedLocation);

  // Start with first sector for the location or "all" if there are none
  const defaultSector =
    availableSectors.length > 1 ? availableSectors[1].id : "all";
  const [selectedSector, setSelectedSector] = useState(defaultSector);

  // Update selected sector when location changes
  useEffect(() => {
    const sectors = getAvailableSectorsForLocation(selectedLocation);
    const firstSector = sectors.length > 1 ? sectors[1].id : "all";
    setSelectedSector(firstSector);
  }, [selectedLocation]);

  const [timeRange, setTimeRange] = useState("24h");

  // Get locations from mockData
  const locations = [
    { id: "all", name: "All Locations" },
    ...mockMines.map((mine) => ({ id: mine.id, name: mine.name })),
  ];

  const timeRanges = [
    { id: "24h", name: "Last 24 Hours" },
    { id: "7d", name: "Last 7 Days" },
    { id: "30d", name: "Last 30 Days" },
    { id: "90d", name: "Last 90 Days" },
  ];

  // Check if user has view_reports permission
  const hasViewReportsPermission = user?.permissions?.includes("view_reports");

  // Get alerts data filtered by location and sector
  const alerts = hasViewReportsPermission
    ? selectedLocation === "all"
      ? Object.values(mockAlerts)
          .flat()
          .filter((alert) => {
            if (selectedSector === "all") return true;
            const baseSectorId = extractBaseSectorId(selectedSector);
            return baseSectorId === alert.sectorId;
          })
      : (mockAlerts[selectedLocation] || []).filter((alert) => {
          if (selectedSector === "all") return true;
          const baseSectorId = extractBaseSectorId(selectedSector);
          return baseSectorId === alert.sectorId;
        })
    : [];

  // Get sensor data filtered by location and sector
  const sensorData = hasViewReportsPermission
    ? selectedLocation === "all"
      ? Object.values(mockSensorData)
          .flat()
          .filter((sensor) => {
            if (selectedSector === "all") return true;
            const baseSectorId = extractBaseSectorId(selectedSector);
            return baseSectorId === sensor.sectorId;
          })
      : (mockSensorData[selectedLocation] || []).filter((sensor) => {
          if (selectedSector === "all") return true;
          const baseSectorId = extractBaseSectorId(selectedSector);
          return baseSectorId === sensor.sectorId;
        })
    : [];

  // Generate analytics data
  const alertsByType = [
    {
      name: "Critical",
      value: alerts.filter((a) => a.type === "critical").length,
    },
    {
      name: "Warning",
      value: alerts.filter((a) => a.type === "warning").length,
    },
    { name: "Info", value: alerts.filter((a) => a.type === "info").length },
  ];

  const sensorStatusData = [
    {
      name: "Normal",
      value: sensorData.filter((s) => s.status === "normal").length,
    },
    {
      name: "Warning",
      value: sensorData.filter((s) => s.status === "warning").length,
    },
    {
      name: "Critical",
      value: sensorData.filter((s) => s.status === "critical").length,
    },
  ];

  // Generate historical trend data
  const generateTrendData = () => {
    const hours =
      timeRange === "24h"
        ? 24
        : timeRange === "7d"
        ? 168
        : timeRange === "30d"
        ? 720
        : 2160;

    // Use different data points based on time range
    const dataPoints = timeRange === "24h" ? 12 : timeRange === "7d" ? 7 : 12;

    // Use selected sensor data for the chart if available
    const gasData = sensorData.filter((s) => s.type === "gas");
    const tempData = sensorData.filter((s) => s.type === "temperature");
    const seismicData = sensorData.filter((s) => s.type === "seismic");
    const strainData = sensorData.filter((s) => s.type === "strain");

    return Array.from({ length: dataPoints }, (_, i) => {
      // Calculate time label based on selected time range
      const timeLabel =
        timeRange === "24h"
          ? `${Math.floor((i * 24) / dataPoints)}h`
          : timeRange === "7d"
          ? `Day ${i + 1}`
          : timeRange === "30d"
          ? `Week ${Math.floor((i * 4) / dataPoints) + 1}`
          : `Month ${Math.floor((i * 3) / dataPoints) + 1}`;

      // If we have real data, use the average values (or random if not enough data)
      // Otherwise use random values as before
      return {
        time: timeLabel,
        gas:
          gasData.length > 0
            ? (gasData[i % gasData.length]?.value || 0) + Math.random() * 5
            : Math.random() * 50,
        temperature:
          tempData.length > 0
            ? (tempData[i % tempData.length]?.value || 0) + Math.random() * 2
            : Math.random() * 40,
        seismic:
          seismicData.length > 0
            ? (seismicData[i % seismicData.length]?.value || 0) +
              Math.random() * 0.1
            : Math.random() * 2,
        strain:
          strainData.length > 0
            ? (strainData[i % strainData.length]?.value || 0) +
              Math.random() * 0.2
            : Math.random() * 5,
      };
    });
  };

  const trendData = generateTrendData();

  const COLORS = ["#2563eb", "#f59e0b", "#dc2626", "#10b981"];

  if (!hasViewReportsPermission) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Sidebar />
        <div className="ml-64 p-8 flex items-center justify-center h-[calc(100vh-2rem)]">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Access Denied
            </h1>
            <p className="text-gray-500">
              You don't have permission to view reports.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="ml-64 p-8">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Analytics Reports
              </h1>
              <p className="mt-1 text-gray-500">
                Comprehensive mining operation analytics
              </p>
            </div>
            <div className="flex gap-4">
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
              <select
                value={selectedSector}
                onChange={(e) => setSelectedSector(e.target.value)}
                className="px-4 py-2 border rounded-lg bg-white"
              >
                {availableSectors.map((sector) => (
                  <option key={sector.id} value={sector.id}>
                    {sector.name}
                  </option>
                ))}
              </select>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-4 py-2 border rounded-lg bg-white"
              >
                {timeRanges.map((range) => (
                  <option key={range.id} value={range.id}>
                    {range.name}
                  </option>
                ))}
              </select>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                <Download className="w-4 h-4" />
                Export Report
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Alert Distribution</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={alertsByType}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {alertsByType.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-lg font-semibold mb-4">
              Sensor Status Overview
            </h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sensorStatusData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#2563eb" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
          <h2 className="text-lg font-semibold mb-4">Sensor Readings Trend</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="gas"
                  stroke="#2563eb"
                  name="Gas Levels (PPM)"
                />
                <Line
                  type="monotone"
                  dataKey="temperature"
                  stroke="#f59e0b"
                  name="Temperature (°C)"
                />
                <Line
                  type="monotone"
                  dataKey="seismic"
                  stroke="#dc2626"
                  name="Seismic Activity (Hz)"
                />
                <Line
                  type="monotone"
                  dataKey="strain"
                  stroke="#10b981"
                  name="Structural Strain (MPa)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Alert Summary</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Total Alerts</span>
                <span className="font-semibold">{alerts.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Critical Alerts</span>
                <span className="font-semibold text-red-500">
                  {alerts.filter((a) => a.type === "critical").length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Warning Alerts</span>
                <span className="font-semibold text-yellow-500">
                  {alerts.filter((a) => a.type === "warning").length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Info Alerts</span>
                <span className="font-semibold text-blue-500">
                  {alerts.filter((a) => a.type === "info").length}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Sensor Health</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Total Sensors</span>
                <span className="font-semibold">{sensorData.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Active Sensors</span>
                <span className="font-semibold text-green-500">
                  {sensorData.filter((s) => s.status === "normal").length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Warning Status</span>
                <span className="font-semibold text-yellow-500">
                  {sensorData.filter((s) => s.status === "warning").length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Critical Status</span>
                <span className="font-semibold text-red-500">
                  {sensorData.filter((s) => s.status === "critical").length}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Key Metrics</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Average Gas Level</span>
                <span className="font-semibold">
                  {(
                    sensorData
                      .filter((s) => s.type === "gas")
                      .reduce((acc, curr) => acc + curr.value, 0) /
                      sensorData.filter((s) => s.type === "gas").length || 0
                  ).toFixed(2)}{" "}
                  PPM
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Average Temperature</span>
                <span className="font-semibold">
                  {(
                    sensorData
                      .filter((s) => s.type === "temperature")
                      .reduce((acc, curr) => acc + curr.value, 0) /
                      sensorData.filter((s) => s.type === "temperature")
                        .length || 0
                  ).toFixed(2)}
                  °C
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Alert Response Time</span>
                <span className="font-semibold">15.3 min</span>
              </div>
              <div className="flex justify-between items-center">
                <span>System Uptime</span>
                <span className="font-semibold">99.9%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
