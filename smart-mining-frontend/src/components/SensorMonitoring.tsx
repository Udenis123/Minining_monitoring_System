import React, { useState, useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { useAuthStore } from "../store/authStore";
import {
  mockSensorData,
  mockMines,
  mockSensorTypes,
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
} from "recharts";
import { Activity, ThermometerSun, Wind, Mountain, Filter } from "lucide-react";

type SectorLabels = {
  [key: string]: string;
};

export function SensorMonitoring() {
  const user = useAuthStore((state) => state.user);
  // Get the first mine and sector as defaults
  const getDefaults = () => {
    const firstMineId = mockMines[0].id;
    const firstSectorForMine = Object.keys(sectorLabels).find(
      (sectorId) => sectorId !== "all" && sectorId.startsWith(`${firstMineId}-`)
    );
    return {
      mine: firstMineId,
      sector: firstSectorForMine || "all",
    };
  };

  const defaults = getDefaults();
  const [selectedMine, setSelectedMine] = useState(defaults.mine);
  const [selectedSector, setSelectedSector] = useState(defaults.sector);
  const [trailData, setTrailData] = useState<{
    [key: string]: { time: string; value: number }[];
  }>({});
  const [livePoint, setLivePoint] = useState<{
    [key: string]: { time: string; value: number };
  }>({});

  // Get available sectors based on selected mine
  const availableSectors = Object.entries(sectorLabels as SectorLabels)
    .filter(([id]) => {
      if (selectedMine === "all") return true;
      return id.startsWith(`${selectedMine}-`);
    })
    .filter(([id]) => id !== "all") // Remove 'all' option from sectors
    .reduce<SectorLabels>((acc, [id, name]) => ({ ...acc, [id]: name }), {});

  // Get sector-specific sensor types based on selected mine and sector
  const sensorTypes = mockSensorTypes.flatMap((type) =>
    type.sectorSpecific.filter((sensor) => {
      return (
        sensor.sectorId === selectedSector && sensor.mineId === selectedMine
      );
    })
  );

  // Generate historical data with more realistic patterns
  const generateHistoricalData = (type: string, hours: number = 24) => {
    const baseValue =
      type === "gas"
        ? 25
        : type === "temperature"
        ? 28
        : type === "seismic"
        ? 0.5
        : type === "strain"
        ? 2
        : 0;

    const variance =
      type === "gas"
        ? 10
        : type === "temperature"
        ? 5
        : type === "seismic"
        ? 0.3
        : type === "strain"
        ? 0.5
        : 0;

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
        value: baseValue + periodicComponent + randomComponent + trendComponent,
      };
    });
  };

  useEffect(() => {
    const intervals: NodeJS.Timeout[] = [];

    sensorTypes.forEach((sensor) => {
      const interval = setInterval(() => {
        setLivePoint((prevPoint) => {
          const newDataPoint = {
            time: new Date().toLocaleTimeString(),
            value: generateHistoricalData(sensor.id, 1)[0].value,
          };
          // Update trail data with the new live point
          setTrailData((prevData) => {
            const updatedTrail = [
              ...(prevData[`${sensor.id}-${sensor.sectorId}`] || []),
              newDataPoint,
            ].slice(-300); // Keep last 300 points (5 minutes of data)
            return {
              ...prevData,
              [`${sensor.id}-${sensor.sectorId}`]: updatedTrail,
            };
          });
          return {
            ...prevPoint,
            [`${sensor.id}-${sensor.sectorId}`]: newDataPoint,
          };
        });
      }, 1000); // Update every second

      intervals.push(interval);
    });

    return () => intervals.forEach((interval) => clearInterval(interval));
  }, [sensorTypes]);

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
              <>
                <select
                  value={selectedMine}
                  onChange={(e) => {
                    setSelectedMine(e.target.value);
                    // Find first sector for selected mine
                    const firstSectorForMine = Object.keys(sectorLabels).find(
                      (sectorId) =>
                        sectorId !== "all" &&
                        sectorId.startsWith(`${e.target.value}-`)
                    );
                    setSelectedSector(firstSectorForMine || "");
                  }}
                  className="px-4 py-2 border rounded-lg bg-white"
                >
                  {mockMines.map((mine) => (
                    <option key={mine.id} value={mine.id}>
                      {mine.name}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedSector}
                  onChange={(e) => setSelectedSector(e.target.value)}
                  className="px-4 py-2 border rounded-lg bg-white"
                >
                  {Object.entries(availableSectors).map(([id, name]) => (
                    <option key={id} value={id}>
                      {name}
                    </option>
                  ))}
                </select>
              </>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sensorTypes.map((sensor) => {
            const sensorKey = `${sensor.id}-${sensor.sectorId}`;
            const data = [
              ...(trailData[sensorKey] || []),
              livePoint[sensorKey],
            ].filter(Boolean);
            const currentValue = livePoint[sensorKey]?.value || 0;
            const avgValue =
              data.reduce((acc, curr) => acc + curr.value, 0) / data.length;
            const maxValue = Math.max(...data.map((d) => d.value));

            return (
              <div
                key={sensorKey}
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
                        {(sectorLabels as SectorLabels)[sensor.sectorId]}
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
      </div>
    </div>
  );
}
