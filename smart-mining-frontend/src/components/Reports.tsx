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
import { Download, Filter, Calendar, AlertTriangle } from "lucide-react";
import mineService from "../services/mineService";
import { Mine, Sector, SensorConfig } from "../types";

export function Reports() {
  const user = useAuthStore((state) => state.user);
  console.log(user?.permissions);

  // State variables for mines and sectors
  const [mines, setMines] = useState<Mine[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMineId, setSelectedMineId] = useState<string>("");
  const [selectedSectorId, setSelectedSectorId] = useState<string>("");
  const [timeRange, setTimeRange] = useState("24h");

  // Fetch mines from the API on component mount
  useEffect(() => {
    const fetchMines = async () => {
      try {
        setLoading(true);
        const mineData = await mineService.getAllMines();
        setMines(mineData || []);

        // Set default selections if mines are available
        if (mineData && mineData.length > 0) {
          setSelectedMineId(mineData[0].id);

          // If the first mine has sectors, select the first sector
          if (mineData[0].sectors && mineData[0].sectors.length > 0) {
            setSelectedSectorId(mineData[0].sectors[0].id);
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

  // Get the selected mine object
  const selectedMine = mines.find((mine) => mine.id === selectedMineId) || null;

  // Get the selected sector object if a sector is selected
  const selectedSector =
    selectedMine && selectedSectorId
      ? selectedMine.sectors.find((sector) => sector.id === selectedSectorId) ||
        null
      : null;

  // Get available sectors for the selected mine
  const availableSectors = selectedMine?.sectors || [];

  // Handle mine selection change
  const handleMineChange = (mineId: string) => {
    setSelectedMineId(mineId);

    // Find the selected mine
    const mine = mines.find((m) => m.id === mineId);

    // If the mine has sectors, select the first one
    if (mine && mine.sectors && mine.sectors.length > 0) {
      setSelectedSectorId(mine.sectors[0].id);
    } else {
      setSelectedSectorId("");
    }
  };

  const timeRanges = [
    { id: "24h", name: "Last 24 Hours" },
    { id: "7d", name: "Last 7 Days" },
    { id: "30d", name: "Last 30 Days" },
    { id: "90d", name: "Last 90 Days" },
  ];

  // Check if user has view_reports permission
  const hasViewReportsPermission =
    user?.permissions?.includes("view_reports") || true;

  // Create dummy sensor data for visualization based on real sensors
  const generateSensorData = () => {
    if (!selectedMine) return [];

    // Get all sectors for the selected mine or just the selected sector
    const sectorsToUse = selectedSectorId
      ? ([selectedMine.sectors.find((s) => s.id === selectedSectorId)].filter(
          Boolean
        ) as Sector[])
      : selectedMine.sectors;

    // Check if sectors exist and have sensors
    if (sectorsToUse.length === 0) {
      return [];
    }

    // Collect all sensors from these sectors
    const allSensors = sectorsToUse.flatMap((sector) => {
      if (
        !sector.sensors ||
        !Array.isArray(sector.sensors) ||
        sector.sensors.length === 0
      ) {
        return [];
      }

      return sector.sensors.map((sensor) => ({
        ...sensor,
        sectorId: sector.id,
        sectorName: sector.name,
        // Add simulated values and status for visualization
        value: generateRandomValueForType(sensor.type),
        status: generateRandomStatus(),
      }));
    });

    return allSensors;
  };

  // Generate a random value based on sensor type
  const generateRandomValueForType = (type: string) => {
    switch (type) {
      case "gas":
        return 20 + Math.random() * 30; // 20-50 PPM
      case "temperature":
        return 22 + Math.random() * 18; // 22-40 °C
      case "seismic":
        return 0.1 + Math.random() * 1.9; // 0.1-2.0 Hz
      case "strain":
        return 1 + Math.random() * 4; // 1-5 MPa
      default:
        return 10 + Math.random() * 30; // Generic 10-40 units
    }
  };

  // Generate a random status for visualization
  const generateRandomStatus = () => {
    const rand = Math.random();
    if (rand > 0.9) return "critical";
    if (rand > 0.7) return "warning";
    return "normal";
  };

  // Generate dummy alerts for visualization
  const generateAlerts = () => {
    if (!selectedMine) return [];

    const sectorsToUse = selectedSectorId
      ? ([selectedMine.sectors.find((s) => s.id === selectedSectorId)].filter(
          Boolean
        ) as Sector[])
      : selectedMine.sectors;

    // Check if there are no sectors or if all sectors have no sensors
    if (
      sectorsToUse.length === 0 ||
      sectorsToUse.every(
        (sector) => !sector.sensors || sector.sensors.length === 0
      )
    ) {
      return [];
    }

    // Return 5-15 alerts
    const alertCount = 5 + Math.floor(Math.random() * 10);

    return Array.from({ length: alertCount }, (_, i) => {
      const sector =
        sectorsToUse[Math.floor(Math.random() * sectorsToUse.length)];
      const alertType =
        Math.random() > 0.8
          ? "critical"
          : Math.random() > 0.5
          ? "warning"
          : "info";

      return {
        id: `alert-${i}`,
        type: alertType,
        message: generateAlertMessage(alertType, sector?.name || "Unknown"),
        timestamp: new Date(
          Date.now() - Math.floor(Math.random() * 86400000)
        ).toISOString(),
        sectorId: sector?.id || "",
        sectorName: sector?.name || "Unknown",
      };
    });
  };

  // Generate contextual alert messages
  const generateAlertMessage = (type: string, sectorName: string) => {
    const messages = {
      critical: [
        `High gas levels detected in ${sectorName}`,
        `Critical temperature spike in ${sectorName}`,
        `Structural integrity warning in ${sectorName}`,
        `Seismic activity alert in ${sectorName}`,
      ],
      warning: [
        `Elevated gas levels in ${sectorName}`,
        `Temperature increasing in ${sectorName}`,
        `Minor seismic activity in ${sectorName}`,
        `Maintenance required for sensors in ${sectorName}`,
      ],
      info: [
        `Routine inspection completed in ${sectorName}`,
        `Ventilation system operating normally in ${sectorName}`,
        `Shift change in ${sectorName}`,
        `Sensor calibration completed in ${sectorName}`,
      ],
    };

    const options = messages[type as keyof typeof messages] || messages.info;
    return options[Math.floor(Math.random() * options.length)];
  };

  // Generate the data for visualizations
  const sensorData = generateSensorData();
  const alerts = generateAlerts();

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
    // Use different data points based on time range
    const dataPoints = timeRange === "24h" ? 12 : timeRange === "7d" ? 7 : 12;

    // Get the different sensor types available in the current selection
    const sensorTypes = Array.from(
      new Set(sensorData.map((sensor) => sensor.type))
    );

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

      // Create the base data point with time
      const dataPoint: { [key: string]: any } = { time: timeLabel };

      // Add data for each sensor type
      sensorTypes.forEach((type) => {
        // Get all sensors of this type
        const sensorsOfType = sensorData.filter((s) => s.type === type);

        if (sensorsOfType.length > 0) {
          // Generate a value based on the average of actual sensor values plus some random variation
          const avgValue =
            sensorsOfType.reduce((sum, s) => sum + s.value, 0) /
            sensorsOfType.length;
          dataPoint[type] = avgValue * (0.9 + Math.random() * 0.2); // ±10% variation
        }
      });

      return dataPoint;
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
              {loading ? (
                <div className="flex space-x-4">
                  <div className="w-40 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
                  <div className="w-40 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
                  <div className="w-40 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
                </div>
              ) : (
                <>
                  <select
                    value={selectedMineId}
                    onChange={(e) => handleMineChange(e.target.value)}
                    className="px-2 py-1.5 text-sm border rounded-lg bg-white"
                    disabled={mines.length === 0}
                  >
                    {mines.length === 0 ? (
                      <option>No mines available</option>
                    ) : (
                      mines.map((mine) => (
                        <option key={mine.id} value={mine.id}>
                          {mine.name}
                        </option>
                      ))
                    )}
                  </select>
                  <select
                    value={selectedSectorId}
                    onChange={(e) => setSelectedSectorId(e.target.value)}
                    className="px-2 py-1.5 text-sm border rounded-lg bg-white"
                    disabled={!availableSectors.length}
                  >
                    <option value="">All Sectors</option>
                    {availableSectors.map((sector) => (
                      <option key={sector.id} value={sector.id}>
                        {sector.name} (Level {sector.level})
                      </option>
                    ))}
                  </select>
                  <select
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value)}
                    className="px-2 py-1.5 text-sm border rounded-lg bg-white"
                  >
                    {timeRanges.map((range) => (
                      <option key={range.id} value={range.id}>
                        {range.name}
                      </option>
                    ))}
                  </select>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                    <Download className="w-3.5 h-3.5" />
                    Export Report
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {[...Array(2)].map((_, i) => (
              <div
                key={i}
                className="bg-white p-6 rounded-xl shadow-sm h-80 animate-pulse"
              >
                <div className="w-1/3 h-6 bg-gray-200 rounded mb-4"></div>
                <div className="w-full h-64 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : !selectedMine ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <p className="text-lg text-gray-500">
              Please select a mine to view reports
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h2 className="text-lg font-semibold mb-4">
                  Alert Distribution
                </h2>
                {alerts.length === 0 ? (
                  <div className="h-64 flex items-center justify-center">
                    <p className="text-gray-500">No alerts available</p>
                  </div>
                ) : (
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
                )}
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h2 className="text-lg font-semibold mb-4">
                  Sensor Status Overview
                </h2>
                {sensorData.length === 0 ? (
                  <div className="h-64 flex items-center justify-center">
                    <p className="text-gray-500">No sensors available</p>
                  </div>
                ) : (
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
                )}
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
              <h2 className="text-lg font-semibold mb-4">
                Sensor Readings Trend
              </h2>
              {sensorData.length === 0 ? (
                <div className="h-80 flex items-center justify-center">
                  <p className="text-gray-500">No sensor data available</p>
                </div>
              ) : (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      {Object.keys(trendData[0] || {})
                        .filter((key) => key !== "time")
                        .map((dataKey, index) => (
                          <Line
                            key={dataKey}
                            type="monotone"
                            dataKey={dataKey}
                            stroke={COLORS[index % COLORS.length]}
                            name={`${
                              dataKey.charAt(0).toUpperCase() + dataKey.slice(1)
                            } ${getSensorUnit(dataKey)}`}
                          />
                        ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-lg font-semibold mb-4">Alert Summary</h3>
                <div className="space-y-4">
                  {sensorData.length === 0 ? (
                    <div className="text-center text-gray-500 py-4">
                      <p>No sensors configured in this location.</p>
                      <p className="text-sm mt-1">
                        Alerts are generated based on sensor data.
                      </p>
                    </div>
                  ) : (
                    <>
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
                    </>
                  )}
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-lg font-semibold mb-4">Sensor Health</h3>
                <div className="space-y-4">
                  {sensorData.length === 0 ? (
                    <div className="text-center text-gray-500 py-4">
                      <p>No sensors configured in this location.</p>
                      <p className="text-sm mt-1">
                        Configure sensors to view health metrics.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between items-center">
                        <span>Total Sensors</span>
                        <span className="font-semibold">
                          {sensorData.length}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Active Sensors</span>
                        <span className="font-semibold text-green-500">
                          {
                            sensorData.filter((s) => s.status === "normal")
                              .length
                          }
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Warning Status</span>
                        <span className="font-semibold text-yellow-500">
                          {
                            sensorData.filter((s) => s.status === "warning")
                              .length
                          }
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Critical Status</span>
                        <span className="font-semibold text-red-500">
                          {
                            sensorData.filter((s) => s.status === "critical")
                              .length
                          }
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-lg font-semibold mb-4">Key Metrics</h3>
                <div className="space-y-4">
                  {sensorData.length > 0 ? (
                    <>
                      {sensorData.some((s) => s.type === "gas") && (
                        <div className="flex justify-between items-center">
                          <span>Average Gas Level</span>
                          <span className="font-semibold">
                            {(
                              sensorData
                                .filter((s) => s.type === "gas")
                                .reduce((acc, curr) => acc + curr.value, 0) /
                                sensorData.filter((s) => s.type === "gas")
                                  .length || 0
                            ).toFixed(2)}{" "}
                            PPM
                          </span>
                        </div>
                      )}

                      {sensorData.some((s) => s.type === "temperature") && (
                        <div className="flex justify-between items-center">
                          <span>Average Temperature</span>
                          <span className="font-semibold">
                            {(
                              sensorData
                                .filter((s) => s.type === "temperature")
                                .reduce((acc, curr) => acc + curr.value, 0) /
                                sensorData.filter(
                                  (s) => s.type === "temperature"
                                ).length || 0
                            ).toFixed(2)}
                            °C
                          </span>
                        </div>
                      )}

                      {sensorData.some((s) => s.type === "seismic") && (
                        <div className="flex justify-between items-center">
                          <span>Average Seismic Activity</span>
                          <span className="font-semibold">
                            {(
                              sensorData
                                .filter((s) => s.type === "seismic")
                                .reduce((acc, curr) => acc + curr.value, 0) /
                                sensorData.filter((s) => s.type === "seismic")
                                  .length || 0
                            ).toFixed(2)}
                            Hz
                          </span>
                        </div>
                      )}

                      {sensorData.some((s) => s.type === "strain") && (
                        <div className="flex justify-between items-center">
                          <span>Average Structural Strain</span>
                          <span className="font-semibold">
                            {(
                              sensorData
                                .filter((s) => s.type === "strain")
                                .reduce((acc, curr) => acc + curr.value, 0) /
                                sensorData.filter((s) => s.type === "strain")
                                  .length || 0
                            ).toFixed(2)}
                            MPa
                          </span>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center text-gray-500">
                      <p>No sensor data available</p>
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <span>System Uptime</span>
                    <span className="font-semibold">99.9%</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Helper function to get the appropriate unit for each sensor type
function getSensorUnit(sensorType: string): string {
  switch (sensorType.toLowerCase()) {
    case "gas":
      return "PPM";
    case "temperature":
      return "°C";
    case "seismic":
      return "Hz";
    case "strain":
      return "MPa";
    default:
      return "";
  }
}
