import React, { useState, useEffect, useCallback } from "react";
import { Sidebar } from "./Sidebar";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import {
  AlertTriangle,
  ThermometerSun,
  Wind,
  Mountain,
  Download,
  Filter,
  Calendar,
  FileText,
  AlertCircle,
  X,
} from "lucide-react";
import mineService from "../services/mineService";
import { Mine, Sector } from "../types";

// Types for the prediction data
interface PredictionData {
  risk: "low" | "moderate" | "high" | "critical";
  nextEvent: string;
  confidence: number;
  trend: any[];
}

interface Predictions {
  gas: PredictionData;
  seismic: PredictionData;
  structural: PredictionData;
  temperature: PredictionData;
}

// Generate prediction data based on real mine and sector
const generatePredictionData = (
  mine: Mine | null,
  sector: Sector | null,
  timeRange: string
): Predictions => {
  if (!mine) {
    return getDefaultPredictions(timeRange);
  }

  const dataPoints = timeRange === "24h" ? 24 : timeRange === "7d" ? 7 : 30;
  const sectorName = sector ? sector.name : "All Sectors";
  const sectorLevel = sector ? sector.level : 0;

  // Use mine depth to influence predictions
  const mineDepth = mine.depth || 100;

  // Use the number of sensors to influence predictions
  const sensorCount = sector
    ? sector.sensors.length
    : mine.sectors.reduce((count, s) => count + s.sensors.length, 0);

  // Calculate risk levels based on mine and sector properties
  const gasRisk = calculateRiskLevel(
    sector?.sensors.some((s) => s.type === "gas") ? 0.8 : 0.4,
    mine.depth > 300 ? 0.7 : 0.4,
    sectorLevel > 2 ? 0.6 : 0.3
  );

  const seismicRisk = calculateRiskLevel(
    sector?.sensors.some((s) => s.type === "seismic") ? 0.7 : 0.3,
    mine.depth > 400 ? 0.8 : 0.5,
    sectorLevel > 3 ? 0.8 : 0.4
  );

  const structuralRisk = calculateRiskLevel(
    sector?.sensors.some((s) => s.type === "strain") ? 0.7 : 0.4,
    mine.depth > 350 ? 0.7 : 0.4,
    mine.status === "maintenance" ? 0.6 : 0.3
  );

  const temperatureRisk = calculateRiskLevel(
    sector?.sensors.some((s) => s.type === "temperature") ? 0.7 : 0.5,
    mine.depth > 250 ? 0.6 : 0.3,
    sectorLevel > 2 ? 0.5 : 0.3
  );

  // Base values influenced by mine and sector properties
  const baseValues = {
    methane: 15 + mineDepth / 50 + Math.random() * 10,
    co2: 8 + mineDepth / 100 + Math.random() * 5,
    o2: 21 - mineDepth / 150 + Math.random() * 2,
    temperature: 20 + mineDepth / 40 + Math.random() * 8,
    seismic: 0.5 + mineDepth / 500 + Math.random() * 0.5,
    structural: 25 + mineDepth / 20 + Math.random() * 15,
  };

  // Generate gas trend data
  const gasTrend = Array.from({ length: dataPoints }, (_, i) => {
    const dayFactor = i / dataPoints;
    return {
      day: timeRange === "24h" ? `${i}:00` : `Day ${i + 1}`,
      methane: baseValues.methane + Math.sin(i / 2) * 5 + Math.random() * 2,
      co2: baseValues.co2 + Math.cos(i / 3) * 3 + Math.random() * 1.5,
      o2: baseValues.o2 - Math.sin(i / 4) * 1 + Math.random() * 0.5,
      temperature:
        baseValues.temperature + Math.sin(i / 2) * 3 + Math.random() * 1,
    };
  });

  // Generate seismic trend data
  const seismicTrend = Array.from({ length: dataPoints }, (_, i) => {
    return {
      day: timeRange === "24h" ? `${i}:00` : `Day ${i + 1}`,
      magnitude:
        baseValues.seismic +
        Math.random() *
          (seismicRisk === "critical" ? 2 : seismicRisk === "high" ? 1.5 : 1),
      depth: mineDepth - 50 + Math.random() * 100,
      intensity:
        Math.random() *
        5 *
        (seismicRisk === "critical" ? 1.5 : seismicRisk === "high" ? 1.2 : 1),
    };
  });

  // Generate structural trend data
  const structuralTrend = Array.from({ length: dataPoints }, (_, i) => {
    return {
      day: timeRange === "24h" ? `${i}:00` : `Day ${i + 1}`,
      stress: baseValues.structural + Math.sin(i / 5) * 10 + Math.random() * 5,
    };
  });

  // Generate temperature trend data
  const temperatureTrend = Array.from({ length: dataPoints }, (_, i) => {
    return {
      day: timeRange === "24h" ? `${i}:00` : `Day ${i + 1}`,
      value: baseValues.temperature + Math.sin(i / 3) * 4 + Math.random() * 2,
    };
  });

  return {
    gas: {
      risk: gasRisk,
      nextEvent: generateNextEvent(
        "gas",
        gasRisk,
        mine.name,
        sectorName,
        timeRange
      ),
      confidence: 75 + Math.random() * 20,
      trend: gasTrend,
    },
    seismic: {
      risk: seismicRisk,
      nextEvent: generateNextEvent(
        "seismic",
        seismicRisk,
        mine.name,
        sectorName,
        timeRange
      ),
      confidence: 70 + Math.random() * 25,
      trend: seismicTrend,
    },
    structural: {
      risk: structuralRisk,
      nextEvent: generateNextEvent(
        "structural",
        structuralRisk,
        mine.name,
        sectorName,
        timeRange
      ),
      confidence: 80 + Math.random() * 15,
      trend: structuralTrend,
    },
    temperature: {
      risk: temperatureRisk,
      nextEvent: generateNextEvent(
        "temperature",
        temperatureRisk,
        mine.name,
        sectorName,
        timeRange
      ),
      confidence: 85 + Math.random() * 10,
      trend: temperatureTrend,
    },
  };
};

// Helper function to calculate risk level based on various factors
const calculateRiskLevel = (
  ...factors: number[]
): "low" | "moderate" | "high" | "critical" => {
  // Average the factors and add some randomness
  const riskValue =
    factors.reduce((sum, factor) => sum + factor, 0) / factors.length +
    Math.random() * 0.3;

  if (riskValue > 0.8) return "critical";
  if (riskValue > 0.6) return "high";
  if (riskValue > 0.4) return "moderate";
  return "low";
};

// Generate appropriate next event messages based on risk level
const generateNextEvent = (
  type: "gas" | "seismic" | "structural" | "temperature",
  risk: "low" | "moderate" | "high" | "critical",
  mineName: string,
  sectorName: string,
  timeRange: string
): string => {
  const timeframe =
    timeRange === "24h"
      ? ["2 hours", "6 hours", "12 hours"]
      : timeRange === "7d"
      ? ["24 hours", "48 hours", "72 hours"]
      : ["3 days", "7 days", "14 days"];

  const randomTime = timeframe[Math.floor(Math.random() * timeframe.length)];

  const gasEvents = {
    low: `No significant methane level changes expected in ${mineName} - ${sectorName} within ${randomTime}`,
    moderate: `Moderate increase in methane levels possible in ${mineName} - ${sectorName} within ${randomTime}`,
    high: `High probability of elevated methane levels in ${mineName} - ${sectorName} within ${randomTime}`,
    critical: `Critical methane concentration predicted in ${mineName} - ${sectorName} within ${randomTime}`,
  };

  const seismicEvents = {
    low: `No significant seismic activity expected in ${mineName} - ${sectorName}`,
    moderate: `Minor seismic activity possible in ${mineName} - ${sectorName} within ${randomTime}`,
    high: `Increased seismic activity predicted in ${mineName} - ${sectorName} within ${randomTime}`,
    critical: `Major seismic disturbance expected in ${mineName} - ${sectorName} within ${randomTime}`,
  };

  const structuralEvents = {
    low: `Structural integrity stable in ${mineName} - ${sectorName}`,
    moderate: `Moderate structural stress detected in ${mineName} - ${sectorName}`,
    high: `Significant structural strain predicted in ${mineName} - ${sectorName} within ${randomTime}`,
    critical: `Critical structural integrity issues expected in ${mineName} - ${sectorName} within ${randomTime}`,
  };

  const temperatureEvents = {
    low: `Temperature levels stable in ${mineName} - ${sectorName}`,
    moderate: `Moderate temperature fluctuations expected in ${mineName} - ${sectorName}`,
    high: `Significant temperature increase predicted in ${mineName} - ${sectorName} within ${randomTime}`,
    critical: `Critical temperature spike expected in ${mineName} - ${sectorName} within ${randomTime}`,
  };

  switch (type) {
    case "gas":
      return gasEvents[risk];
    case "seismic":
      return seismicEvents[risk];
    case "structural":
      return structuralEvents[risk];
    case "temperature":
      return temperatureEvents[risk];
  }
};

// Default predictions when no mine is selected
const getDefaultPredictions = (timeRange: string): Predictions => {
  const dataPoints = timeRange === "24h" ? 24 : timeRange === "7d" ? 7 : 30;

  return {
    gas: {
      risk: "moderate",
      nextEvent: "Select a mine and sector for specific gas level predictions",
      confidence: 80,
      trend: Array.from({ length: dataPoints }, (_, i) => ({
        day: timeRange === "24h" ? `${i}:00` : `Day ${i + 1}`,
        methane: 20 + Math.sin(i / 2) * 5 + Math.random() * 2,
        co2: 10 + Math.cos(i / 3) * 3 + Math.random() * 1.5,
        o2: 21 - Math.sin(i / 4) * 1 + Math.random() * 0.5,
        temperature: 25 + Math.sin(i / 2) * 3 + Math.random() * 1,
      })),
    },
    seismic: {
      risk: "low",
      nextEvent: "Select a mine and sector for specific seismic predictions",
      confidence: 75,
      trend: Array.from({ length: dataPoints }, (_, i) => ({
        day: timeRange === "24h" ? `${i}:00` : `Day ${i + 1}`,
        magnitude: Math.random() * 1.5,
        depth: 150 + Math.random() * 50,
        intensity: Math.random() * 3,
      })),
    },
    structural: {
      risk: "moderate",
      nextEvent:
        "Select a mine and sector for specific structural integrity predictions",
      confidence: 85,
      trend: Array.from({ length: dataPoints }, (_, i) => ({
        day: timeRange === "24h" ? `${i}:00` : `Day ${i + 1}`,
        stress: 30 + Math.sin(i / 5) * 10 + Math.random() * 5,
      })),
    },
    temperature: {
      risk: "moderate",
      nextEvent:
        "Select a mine and sector for specific temperature predictions",
      confidence: 82,
      trend: Array.from({ length: dataPoints }, (_, i) => ({
        day: timeRange === "24h" ? `${i}:00` : `Day ${i + 1}`,
        value: 25 + Math.sin(i / 3) * 4 + Math.random() * 2,
      })),
    },
  };
};

const getRiskColor = (risk: string) => {
  switch (risk) {
    case "low":
      return "bg-green-100 text-green-800";
    case "moderate":
      return "bg-yellow-100 text-yellow-800";
    case "high":
      return "bg-orange-100 text-orange-800";
    case "critical":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export function PredictiveAnalytics() {
  const [timeRange, setTimeRange] = useState("7d");
  const [mines, setMines] = useState<Mine[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMineId, setSelectedMineId] = useState<string>("");
  const [selectedSectorId, setSelectedSectorId] = useState<string>("");
  const [showSeismicReport, setShowSeismicReport] = useState(false);

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

  // Generate predictions based on selected mine, sector and time range
  const predictions = generatePredictionData(
    selectedMine,
    selectedSector,
    timeRange
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="ml-64 p-8">
        {/* Breadcrumbs */}
        <div className="text-sm text-gray-500 mb-4">
          Dashboard / Predictive Analytics
        </div>

        {/* Page Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Predictive Analytics & AI Forecasting
              </h1>
              <p className="mt-1 text-gray-500">
                AI-powered predictions and risk analysis
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
                    <option value="24h">Next 24 Hours</option>
                    <option value="7d">Next 7 Days</option>
                    <option value="30d">Next 30 Days</option>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="bg-white p-6 rounded-xl shadow-sm h-40 animate-pulse"
              >
                <div className="w-3/4 h-6 bg-gray-200 rounded mb-4"></div>
                <div className="w-full h-4 bg-gray-200 rounded mb-2"></div>
                <div className="w-2/3 h-4 bg-gray-200 rounded mb-4"></div>
                <div className="w-1/2 h-4 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : (
          // Overview Cards
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {Object.entries(predictions).map(([key, data]) => (
              <div
                key={key}
                className={`bg-white p-6 rounded-xl shadow-sm border-l-4 ${
                  data.risk === "critical"
                    ? "border-red-500"
                    : data.risk === "high"
                    ? "border-orange-500"
                    : data.risk === "moderate"
                    ? "border-yellow-500"
                    : "border-green-500"
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold capitalize">
                    {key} Risk
                  </h3>
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${getRiskColor(
                      data.risk
                    )}`}
                  >
                    {data.risk.toUpperCase()}
                  </span>
                </div>
                <p className="text-gray-600 mb-4">{data.nextEvent}</p>
                <div className="flex items-center text-sm text-gray-500">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  AI Confidence: {data.confidence.toFixed(1)}%
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && (
          <>
            {/* Gas & Temperature Forecast */}
            <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
              <h2 className="text-xl font-semibold mb-6">
                AI Prediction: Gas & Temperature Trends
              </h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={predictions.gas.trend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="methane"
                      stroke="#2563eb"
                      name="Methane (%)"
                    />
                    <Line
                      type="monotone"
                      dataKey="co2"
                      stroke="#7c3aed"
                      name="CO2 (%)"
                    />
                    <Line
                      type="monotone"
                      dataKey="o2"
                      stroke="#059669"
                      name="O2 (%)"
                    />
                    <Line
                      type="monotone"
                      dataKey="temperature"
                      stroke="#dc2626"
                      name="Temperature (°C)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center">
                  <AlertTriangle className="w-5 h-5 text-yellow-500 mr-2" />
                  <span className="text-yellow-700">
                    Alert:{" "}
                    {selectedMine
                      ? `${
                          predictions.gas.risk === "low" ? "Normal" : "Elevated"
                        } gas levels detected in ${
                          selectedSector ? selectedSector.name : "all sectors"
                        }`
                      : "Select a mine to see specific gas alerts"}
                  </span>
                </div>
              </div>
            </div>

            {/* Seismic Activity & Structural Integrity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h2 className="text-xl font-semibold mb-6">
                  AI Prediction: Seismic Risks
                </h2>
                <div className="h-64 mb-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={predictions.seismic.trend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Area
                        type="monotone"
                        dataKey="magnitude"
                        stroke="#7c3aed"
                        fill="#7c3aed"
                        fillOpacity={0.2}
                        name="Magnitude"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <button
                  onClick={() => setShowSeismicReport(true)}
                  className="w-full bg-purple-50 text-purple-700 py-1.5 text-sm rounded-lg hover:bg-purple-100 transition-colors flex items-center justify-center"
                >
                  <FileText className="w-3.5 h-3.5 mr-1.5" />
                  View Detailed Seismic Report
                </button>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h2 className="text-xl font-semibold mb-6">
                  AI Prediction: Structural Risk Analysis
                </h2>
                <div className="h-64 mb-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={predictions.structural.trend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="stress"
                        stroke="#dc2626"
                        name="Structural Stress"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center">
                    <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
                    <span className="text-red-700">
                      {selectedMine
                        ? `${
                            selectedSector
                              ? selectedSector.name
                              : "Multiple sectors"
                          } ${
                            predictions.structural.risk === "low"
                              ? "show normal"
                              : "show concerning"
                          } structural stress patterns`
                        : "Select a mine to see structural stress analysis"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Recommendations */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h2 className="text-xl font-semibold mb-6">AI Recommendations</h2>
              {!selectedMine ? (
                <div className="text-center p-6 text-gray-500">
                  Select a mine to receive AI-powered recommendations
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-start">
                      <div className="bg-blue-100 p-2 rounded-full mr-4">
                        <Wind className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-blue-900">
                          Ventilation Adjustment
                        </h3>
                        <p className="text-blue-700 mt-1">
                          {predictions.gas.risk === "low"
                            ? `Maintain current ventilation levels in ${
                                selectedSector
                                  ? selectedSector.name
                                  : "all sectors"
                              }`
                            : `${
                                predictions.gas.risk === "critical"
                                  ? "Urgently increase"
                                  : "Increase"
                              } ventilation in ${
                                selectedSector
                                  ? selectedSector.name
                                  : "affected sectors"
                              } to reduce gas accumulation`}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-purple-50 rounded-lg">
                    <div className="flex items-start">
                      <div className="bg-purple-100 p-2 rounded-full mr-4">
                        <Mountain className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-purple-900">
                          Structural Support
                        </h3>
                        <p className="text-purple-700 mt-1">
                          {predictions.structural.risk === "low"
                            ? `Regular maintenance inspection in ${
                                selectedSector
                                  ? selectedSector.name
                                  : "all sectors"
                              } is sufficient`
                            : `${
                                predictions.structural.risk === "critical"
                                  ? "Immediate"
                                  : "Schedule"
                              } support beam inspection in ${
                                selectedSector
                                  ? selectedSector.name
                                  : "high-risk sectors"
                              }`}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-orange-50 rounded-lg">
                    <div className="flex items-start">
                      <div className="bg-orange-100 p-2 rounded-full mr-4">
                        <ThermometerSun className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-orange-900">
                          Temperature Management
                        </h3>
                        <p className="text-orange-700 mt-1">
                          {predictions.temperature.risk === "low"
                            ? `Temperature control systems operating normally in ${
                                selectedSector
                                  ? selectedSector.name
                                  : "all sectors"
                              }`
                            : `${
                                predictions.temperature.risk === "critical"
                                  ? "Urgent adjustment needed for"
                                  : "Monitor"
                              } cooling systems in ${
                                selectedSector
                                  ? selectedSector.name
                                  : "affected sectors"
                              }`}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Detailed Seismic Report Modal */}
        {showSeismicReport && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">
                  Detailed Seismic Analysis Report
                </h2>
                <button onClick={() => setShowSeismicReport(false)}>
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-purple-900 mb-2">
                    Executive Summary
                  </h3>
                  <p className="text-purple-800">
                    Analysis of seismic data from{" "}
                    {selectedMine ? selectedMine.name : ""} -{" "}
                    {selectedSector ? selectedSector.name : "all sectors"}
                    shows {predictions.seismic.risk} risk levels with{" "}
                    {predictions.seismic.confidence.toFixed(1)}% confidence.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold mb-4">
                    Seismic Activity Breakdown
                  </h3>
                  <div className="bg-white border rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Time
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Magnitude
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Depth
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Intensity
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Risk Level
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {predictions.seismic.trend.map((reading, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {reading.day}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {reading.magnitude.toFixed(2)} ML
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {reading.depth.toFixed(1)} m
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {reading.intensity.toFixed(1)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-2 py-1 text-xs rounded-full ${
                                  reading.magnitude > 2
                                    ? "bg-red-100 text-red-800"
                                    : reading.magnitude > 1
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-green-100 text-green-800"
                                }`}
                              >
                                {reading.magnitude > 2
                                  ? "High"
                                  : reading.magnitude > 1
                                  ? "Moderate"
                                  : "Low"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Key Findings</h4>
                    <ul className="list-disc list-inside space-y-2 text-sm text-gray-600">
                      <li>
                        Peak activity observed during{" "}
                        {timeRange === "24h"
                          ? "early morning hours"
                          : "days 2-3 of forecast period"}
                      </li>
                      <li>
                        Correlation with mining operations detected in{" "}
                        {selectedSector
                          ? selectedSector.name
                          : "multiple sectors"}
                      </li>
                      <li>
                        {selectedMine
                          ? `${
                              selectedMine.depth > 350 ? "Deep" : "Standard"
                            } mining depth (${
                              selectedMine.depth
                            }m) contributing to seismic profile`
                          : "Depth analysis pending"}
                      </li>
                      <li>
                        Ground stability remains{" "}
                        {predictions.seismic.risk === "low"
                          ? "well within"
                          : predictions.seismic.risk === "moderate"
                          ? "within"
                          : "near threshold of"}{" "}
                        safety parameters
                      </li>
                    </ul>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Recommendations</h4>
                    <ul className="list-disc list-inside space-y-2 text-sm text-gray-600">
                      <li>
                        {predictions.seismic.risk === "low"
                          ? "Maintain"
                          : "Increase"}{" "}
                        monitoring frequency in{" "}
                        {selectedSector
                          ? selectedSector.name
                          : "all high-risk sectors"}
                      </li>
                      <li>
                        {predictions.seismic.risk === "critical" ||
                        predictions.seismic.risk === "high"
                          ? "Immediately review"
                          : "Review"}{" "}
                        and update emergency response protocols
                      </li>
                      <li>
                        Conduct{" "}
                        {predictions.seismic.risk === "critical"
                          ? "urgent"
                          : "detailed"}{" "}
                        structural integrity assessments in{" "}
                        {selectedSector
                          ? selectedSector.name
                          : "affected sectors"}
                      </li>
                      <li>
                        {predictions.seismic.risk === "low"
                          ? "Schedule routine"
                          : "Prioritize"}{" "}
                        seismic monitoring equipment calibration
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="flex justify-end mt-6">
                  <button
                    onClick={() => setShowSeismicReport(false)}
                    className="px-3 py-1.5 text-sm bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 mr-3"
                  >
                    Close
                  </button>
                  <button className="px-3 py-1.5 text-sm bg-purple-500 text-white rounded-lg hover:bg-purple-600 flex items-center">
                    <Download className="w-3.5 h-3.5 mr-1.5" />
                    Download Full Report
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
