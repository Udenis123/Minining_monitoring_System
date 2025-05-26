import React, { useState, useEffect, useCallback } from "react";
import { Sidebar } from "./Sidebar";
import { useAuthStore } from "../store/authStore";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Activity, ThermometerSun, Wind, Mountain } from "lucide-react";
import mineService from "../services/mineService";
import { Mine, Sector, SensorConfig } from "../types";

// Sensor configuration for different types
const SENSOR_CONFIG = {
  gas: {
    name: "Gas Level",
    color: "#3b82f6",
    unit: "PPM",
    icon: "Wind",
    baseValue: 25,
    variance: 10,
  },
  temperature: {
    name: "Temperature",
    color: "#f59e0b",
    unit: "°C",
    icon: "ThermometerSun",
    baseValue: 28,
    variance: 5,
  },
  seismic: {
    name: "Seismic Activity",
    color: "#ef4444",
    unit: "Hz",
    icon: "Activity",
    baseValue: 0.5,
    variance: 0.3,
  },
  strain: {
    name: "Structural Strain",
    color: "#10b981",
    unit: "MPa",
    icon: "Mountain",
    baseValue: 2,
    variance: 0.5,
  },
  geological: {
    name: "Geological Data",
    color: "#8b5cf6",
    unit: "kPa",
    icon: "Mountain",
    baseValue: 15,
    variance: 8,
  },
};

// Sensor display data interface
interface SensorDisplayData {
  id: string;
  sensorId: string;
  type: string;
  name: string;
  color: string;
  unit: string;
  icon: string;
  baseValue: number;
  variance: number;
  sectorId: string;
  mineId: string;
  location: string;
  status: string;
}

export function SensorMonitoring() {
  const user = useAuthStore((state) => state.user);
  const [mines, setMines] = useState<Mine[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMine, setSelectedMine] = useState<string>("");
  const [selectedSector, setSelectedSector] = useState<string>("");
  const [sensorDisplayData, setSensorDisplayData] = useState<
    SensorDisplayData[]
  >([]);
  const [trailData, setTrailData] = useState<{
    [key: string]: { time: string; value: number }[];
  }>({});
  const [livePoint, setLivePoint] = useState<{
    [key: string]: { time: string; value: number };
  }>({});

  // Fetch mines from the API
  useEffect(() => {
    const fetchMines = async () => {
      try {
        setLoading(true);
        const data = await mineService.getAllMines();
        setMines(data || []);

        // Set default selections if mines are available
        if (data && data.length > 0) {
          setSelectedMine(data[0].id);

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

  // Update sensors when selection changes
  useEffect(() => {
    if (!selectedMine || !selectedSector) {
      setSensorDisplayData([]);
      return;
    }

    // Get the selected mine and sector
    const mine = mines.find((m) => m.id === selectedMine);
    if (!mine) return;

    const sector = mine.sectors.find((s) => s.id === selectedSector);
    if (!sector) return;

    // Check if there are sensors in this sector
    if (!sector.sensors || sector.sensors.length === 0) {
      setSensorDisplayData([]);
      return;
    }

    // Map the actual sensors to display data with visualization properties
    const displayData = sector.sensors.map((sensor) => {
      // Get the config for this sensor type, defaulting to gas if not found
      const config =
        SENSOR_CONFIG[sensor.type as keyof typeof SENSOR_CONFIG] ||
        SENSOR_CONFIG.gas;

      return {
        id: `${sensor.type}-${sensor.id}`,
        sensorId: sensor.id,
        type: sensor.type,
        name: config.name,
        color: config.color,
        unit: config.unit,
        icon: config.icon,
        baseValue: config.baseValue,
        variance: config.variance,
        sectorId: selectedSector,
        mineId: selectedMine,
        location: sensor.location,
        status: sensor.status,
      };
    });

    setSensorDisplayData(displayData);
  }, [selectedMine, selectedSector, mines]);

  // Generate historical data with realistic patterns
  const generateHistoricalData = useCallback(
    (sensor: SensorDisplayData, hours: number = 24) => {
      const baseValue = sensor.baseValue;
      const variance = sensor.variance;

      return Array.from({ length: hours }, (_, i) => {
        const time = new Date();
        time.setHours(time.getHours() - (hours - i));

        // Add some periodic variation
        const periodicComponent = Math.sin(i / 6) * variance * 0.5;
        // Add some random noise
        const randomComponent = (Math.random() - 0.5) * variance * 0.3;
        // Add a trend component
        const trendComponent = (i / hours) * variance * 0.2;

        return {
          time: time.toLocaleTimeString(),
          value:
            baseValue + periodicComponent + randomComponent + trendComponent,
        };
      });
    },
    []
  );

  // Update sensor data at regular intervals
  useEffect(() => {
    const intervals: NodeJS.Timeout[] = [];

    sensorDisplayData.forEach((sensor) => {
      const interval = setInterval(() => {
        setLivePoint((prevPoint) => {
          const newDataPoint = {
            time: new Date().toLocaleTimeString(),
            value: generateHistoricalData(sensor, 1)[0].value,
          };
          // Update trail data with the new live point
          setTrailData((prevData) => {
            const sensorKey = sensor.id;
            const updatedTrail = [
              ...(prevData[sensorKey] || []),
              newDataPoint,
            ].slice(-300); // Keep last 300 points (5 minutes of data)
            return {
              ...prevData,
              [sensorKey]: updatedTrail,
            };
          });
          return {
            ...prevPoint,
            [sensor.id]: newDataPoint,
          };
        });
      }, 1000); // Update every second

      intervals.push(interval);
    });

    // Clear intervals when component unmounts or sensors change
    return () => intervals.forEach((interval) => clearInterval(interval));
  }, [sensorDisplayData, generateHistoricalData]);

  // Get the selected mine object
  const selectedMineObject = mines.find((mine) => mine.id === selectedMine);

  // Get sectors for the selected mine
  const availableSectors = selectedMineObject?.sectors || [];

  // Handle mine selection change
  const handleMineChange = (mineId: string) => {
    setSelectedMine(mineId);

    // Find the selected mine
    const mine = mines.find((m) => m.id === mineId);

    // If the mine has sectors, select the first one
    if (mine && mine.sectors && mine.sectors.length > 0) {
      setSelectedSector(mine.sectors[0].id);
    } else {
      setSelectedSector("");
    }
  };

  // Get the selected sector object
  const selectedSectorObject = selectedMineObject?.sectors.find(
    (s) => s.id === selectedSector
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="ml-64 p-8">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Sensor Monitoring
              </h1>
              <p className="mt-1 text-gray-500">
                Real-time sensor data and analytics
              </p>
            </div>
            <div className="flex gap-4">
              {loading ? (
                <div className="flex space-x-4">
                  <div className="w-40 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
                  <div className="w-40 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
                </div>
              ) : (
                <>
                  <select
                    value={selectedMine}
                    onChange={(e) => handleMineChange(e.target.value)}
                    className="px-4 py-2 border rounded-lg bg-white"
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
                    value={selectedSector}
                    onChange={(e) => setSelectedSector(e.target.value)}
                    className="px-4 py-2 border rounded-lg bg-white"
                    disabled={!availableSectors.length}
                  >
                    {availableSectors.length === 0 ? (
                      <option>No sectors available</option>
                    ) : (
                      availableSectors.map((sector) => (
                        <option key={sector.id} value={sector.id}>
                          {sector.name} (Level {sector.level})
                        </option>
                      ))
                    )}
                  </select>
                </>
              )}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm p-6 h-96">
                <div className="w-full h-full bg-gray-200 rounded-lg animate-pulse"></div>
              </div>
            ))}
          </div>
        ) : !selectedMine || !selectedSector ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <p className="text-lg text-gray-500">
              Please select a mine and sector to view sensor data
            </p>
          </div>
        ) : sensorDisplayData.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <p className="text-lg text-gray-500">
              No sensors configured in{" "}
              {selectedSectorObject?.name || "this sector"}
            </p>
            <p className="mt-4 text-sm text-gray-400">
              You can add sensors to this sector from the Mine Management page
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sensorDisplayData.map((sensor) => {
              const data = [
                ...(trailData[sensor.id] || []),
                livePoint[sensor.id],
              ].filter(Boolean);
              const currentValue = livePoint[sensor.id]?.value || 0;
              const avgValue =
                data.length > 0
                  ? data.reduce((acc, curr) => acc + curr.value, 0) /
                    data.length
                  : 0;
              const maxValue =
                data.length > 0 ? Math.max(...data.map((d) => d.value)) : 0;

              return (
                <div
                  key={sensor.id}
                  className="bg-white p-6 rounded-xl shadow-sm"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      {sensor.icon === "Wind" && (
                        <Wind
                          className="w-6 h-6"
                          style={{ color: sensor.color }}
                        />
                      )}
                      {sensor.icon === "ThermometerSun" && (
                        <ThermometerSun
                          className="w-6 h-6"
                          style={{ color: sensor.color }}
                        />
                      )}
                      {sensor.icon === "Activity" && (
                        <Activity
                          className="w-6 h-6"
                          style={{ color: sensor.color }}
                        />
                      )}
                      {sensor.icon === "Mountain" && (
                        <Mountain
                          className="w-6 h-6"
                          style={{ color: sensor.color }}
                        />
                      )}
                      <div>
                        <h2 className="text-lg font-semibold">{sensor.name}</h2>
                        <p className="text-sm text-gray-500">
                          {selectedMineObject?.name} -{" "}
                          {selectedSectorObject?.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          {sensor.location} - {sensor.status}
                        </p>
                      </div>
                    </div>
                    <div
                      className="text-2xl font-bold"
                      style={{ color: sensor.color }}
                    >
                      {currentValue.toFixed(2)} {sensor.unit}
                    </div>
                  </div>

                  <div className="h-64 mb-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis
                          dataKey="time"
                          tick={{ fontSize: 12 }}
                          tickFormatter={(time) =>
                            time.split(":").slice(0, 2).join(":")
                          }
                        />
                        <YAxis
                          tick={{ fontSize: 12 }}
                          domain={["auto", "auto"]}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "white",
                            border: "1px solid #e5e7eb",
                            borderRadius: "0.5rem",
                          }}
                          formatter={(value: number) => [
                            `${value.toFixed(2)} ${sensor.unit}`,
                            sensor.name,
                          ]}
                        />
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke={sensor.color}
                          strokeWidth={2}
                          dot={false}
                          activeDot={{ r: 4 }}
                          isAnimationActive={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-gray-500">Current</div>
                      <div className="font-semibold mt-1">
                        {currentValue.toFixed(2)} {sensor.unit}
                      </div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-gray-500">Average</div>
                      <div className="font-semibold mt-1">
                        {avgValue.toFixed(2)} {sensor.unit}
                      </div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-gray-500">Peak</div>
                      <div className="font-semibold mt-1">
                        {maxValue.toFixed(2)} {sensor.unit}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
