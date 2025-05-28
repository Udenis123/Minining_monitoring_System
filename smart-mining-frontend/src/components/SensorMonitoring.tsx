import  { useState, useEffect, useCallback, useRef } from "react";
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
import { Activity, ThermometerSun, Wind, Mountain, Clock } from "lucide-react";
import mineService from "../services/mineService";
import { Mine} from "../types";

// Time range options for sensor data
const TIME_RANGES = [
  { id: "1m", name: "1 Minute", points: 60, updateInterval: 1000 }, // 60 points, update every 1 second
  { id: "1h", name: "1 Hour", points: 60, updateInterval: 60000 }, // 60 points, update every 1 minute
  { id: "1d", name: "1 Day", points: 24, updateInterval: 3600000 }, // 24 points, update every 1 hour
  { id: "1w", name: "1 Week", points: 7, updateInterval: 86400000 }, // 7 points, update every 1 day
];

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
  timeRange: string;
  seed?: number; // Random seed for consistent patterns
}

// Data point interface
interface DataPoint {
  id: string;
  time: Date;
  timeString: string;
  fullTime: string;
  value: number;
  smoothValue?: number; // Smoothed value for consistent curves
}

// Simple string hash function for generating consistent seeds
const hashCode = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
};

// Seeded random number generator for consistent patterns
const seededRandom = (seed: number, index: number): number => {
  const x = Math.sin(seed + index) * 10000;
  return x - Math.floor(x);
};

// Apply moving average smoothing to ensure consistent curves
const smoothData = (data: DataPoint[], windowSize: number = 3): DataPoint[] => {
  if (data.length < windowSize) return data;

  return data.map((point, i) => {
    if (i < windowSize - 1) {
      // For the first few points, just use the original value
      return { ...point, smoothValue: point.value };
    }

    // Calculate moving average
    let sum = 0;
    for (let j = 0; j < windowSize; j++) {
      sum += data[i - j].value;
    }
    const smoothValue = sum / windowSize;

    return { ...point, smoothValue };
  });
};

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
    [key: string]: DataPoint[];
  }>({});
  const [livePoint, setLivePoint] = useState<{
    [key: string]: DataPoint;
  }>({});
  const [lastUpdateTime, setLastUpdateTime] = useState<number>(Date.now());
  const [sensorIntervals, setSensorIntervals] = useState<{
    [key: string]: NodeJS.Timeout;
  }>({});

  // Add a useRef to track if we've already initialized the sensors
  const initializedRef = useRef(false);

  // Generate historical data with realistic patterns that reflect the selected time scale
  const generateHistoricalData = useCallback(
    (sensor: SensorDisplayData, points: number = 60) => {
      const baseValue = sensor.baseValue;
      const variance = sensor.variance;
      const now = new Date();
      const seed = sensor.seed || hashCode(sensor.id);
      const selectedRange =
        TIME_RANGES.find((r) => r.id === sensor.timeRange) || TIME_RANGES[1];

      console.log(
        `Generating ${points} data points for ${sensor.timeRange} view`
      );

      // Ensure we're generating an appropriate number of points
      const actualPoints = Math.max(points, 10); // Always generate at least 10 points

      // Generate base values with patterns appropriate for the time scale
      const baseValues = Array.from({ length: actualPoints }, (_, i) => {
        // Calculate time based on selected time range
        let time: Date;
        let interval: number;

        switch (selectedRange.id) {
          case "1m":
            interval = 1000; // 1 second
            time = new Date(now.getTime() - (actualPoints - i) * interval);
            break;
          case "1h":
            interval = 60000; // 1 minute
            time = new Date(now.getTime() - (actualPoints - i) * interval);
            break;
          case "1d":
            interval = 3600000; // 1 hour
            time = new Date(now.getTime() - (actualPoints - i) * interval);
            break;
          case "1w":
            interval = 86400000; // 1 day
            time = new Date(now.getTime() - (actualPoints - i) * interval);
            break;
          default:
            interval = 60000;
            time = new Date(now.getTime() - (actualPoints - i) * interval);
        }

        // Create patterns appropriate for each time scale
        let value = baseValue;

        // Add time-appropriate patterns based on the selected time range
        switch (selectedRange.id) {
          case "1m":
            // For 1-minute view: rapid fluctuations (seconds)
            // Fast sine wave (seconds) + very small random noise
            value +=
              Math.sin((i / actualPoints) * Math.PI * 10) * variance * 0.3;
            value +=
              Math.sin((i / (actualPoints / 5)) * Math.PI * 2) * variance * 0.2;
            value += (seededRandom(seed, i) - 0.5) * variance * 0.1;
            break;

          case "1h":
            // For 1-hour view: medium fluctuations (minutes)
            // Medium sine wave (minutes) + small random walk + minor trend
            value +=
              Math.sin((i / actualPoints) * Math.PI * 4) * variance * 0.4;
            value +=
              Math.sin((i / (actualPoints / 3)) * Math.PI * 2) * variance * 0.3;

            // Add small step changes every ~5 minutes (5 points in 1h view with 60 points)
            if (i % 5 === 0) {
              value += (seededRandom(seed, i) - 0.5) * variance * 0.3;
            }

            // Add time of day influence
            const minuteOfHour = time.getMinutes();
            value += Math.sin((minuteOfHour / 60) * Math.PI) * variance * 0.2;
            break;

          case "1d":
            // For 1-day view: slower changes (hours)
            // Daily patterns + hourly fluctuations
            const hourOfDay = time.getHours();

            // Daily cycle (higher during day, lower at night)
            value += Math.sin((hourOfDay / 24) * Math.PI * 2) * variance * 0.5;

            // Activity peaks (morning, midday, evening)
            const hourFactor =
              hourOfDay >= 7 && hourOfDay <= 9
                ? 0.4 // Morning peak
                : hourOfDay >= 12 && hourOfDay <= 14
                ? 0.3 // Midday peak
                : hourOfDay >= 17 && hourOfDay <= 19
                ? 0.5 // Evening peak
                : 0;
            value += hourFactor * variance;

            // Add some hourly variation
            value +=
              Math.sin((i / (actualPoints / 6)) * Math.PI * 2) * variance * 0.2;

            // Add occasional events (every ~4 hours)
            if (i % 4 === 0) {
              value += (seededRandom(seed, i) - 0.3) * variance * 0.6;
            }
            break;

          case "1w":
            // For 1-week view: major changes (days)
            // Weekly patterns + daily cycles
            const dayOfWeek = time.getDay(); // 0-6

            // Weekday vs weekend pattern
            const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
            value += isWeekend ? variance * 0.3 : variance * -0.1;

            // Weekly trend (increasing/decreasing based on seed)
            value +=
              (i / actualPoints - 0.5) *
              variance *
              (seededRandom(seed, 1) > 0.5 ? 1 : -1) *
              0.5;

            // Add major events (1-2 per week)
            if (
              i === Math.floor(seededRandom(seed, 2) * actualPoints) ||
              i === Math.floor(seededRandom(seed, 3) * actualPoints)
            ) {
              value += (seededRandom(seed, i) - 0.3) * variance;
            }
            break;
        }

        // Add a small amount of noise to all time scales
        value += (seededRandom(seed, i * 100) - 0.5) * variance * 0.05;

        return value;
      });

      // Apply appropriate smoothing based on time scale
      let smoothedValues = [...baseValues];

      // Apply different smoothing based on time range
      switch (selectedRange.id) {
        case "1m":
          // Minimal smoothing for 1-minute view to show rapid changes
          smoothedValues = smoothedValues.map((value, i, arr) => {
            if (i === 0 || i === arr.length - 1) return value;
            return (arr[i - 1] + value + arr[i + 1]) / 3;
          });
          break;

        case "1h":
          // Medium smoothing for 1-hour view
          smoothedValues = smoothedValues.map((value, i, arr) => {
            if (i < 1 || i >= arr.length - 1) return value;
            return (arr[i - 1] + value + arr[i + 1]) / 3;
          });
          break;

        case "1d":
          // More smoothing for 1-day view
          smoothedValues = smoothedValues.map((value, i, arr) => {
            if (i < 2 || i >= arr.length - 2) return value;
            return (
              (arr[i - 2] + arr[i - 1] + value + arr[i + 1] + arr[i + 2]) / 5
            );
          });
          break;

        case "1w":
          // Heavy smoothing for 1-week view with preservation of major events
          smoothedValues = smoothedValues.map((value, i, arr) => {
            if (i < 1 || i >= arr.length - 1) return value;

            // Check if this is a major event (significantly different from neighbors)
            const neighbors = [arr[i - 1], arr[i + 1]];
            const avgNeighbor =
              neighbors.reduce((sum, v) => sum + v, 0) / neighbors.length;
            const isEvent = Math.abs(value - avgNeighbor) > variance * 0.7;

            if (isEvent) {
              // Preserve events but with slight smoothing
              return value * 0.7 + avgNeighbor * 0.3;
            } else {
              // Apply stronger smoothing for regular points
              if (i < 2 || i >= arr.length - 2) return value;
              return (
                (arr[i - 2] + arr[i - 1] + value + arr[i + 1] + arr[i + 2]) / 5
              );
            }
          });
          break;
      }

      // Create the final data points
      return Array.from({ length: actualPoints }, (_, i) => {
        // Calculate time based on selected time range
        let time: Date;
        let interval: number;

        switch (selectedRange.id) {
          case "1m":
            interval = 1000; // 1 second
            time = new Date(now.getTime() - (actualPoints - i) * interval);
            break;
          case "1h":
            interval = 60000; // 1 minute
            time = new Date(now.getTime() - (actualPoints - i) * interval);
            break;
          case "1d":
            interval = 3600000; // 1 hour
            time = new Date(now.getTime() - (actualPoints - i) * interval);
            break;
          case "1w":
            interval = 86400000; // 1 day
            time = new Date(now.getTime() - (actualPoints - i) * interval);
            break;
          default:
            interval = 60000;
            time = new Date(now.getTime() - (actualPoints - i) * interval);
        }

        return {
          id: `${sensor.id}-${i}-${selectedRange.id}`,
          time: time,
          timeString: time.toLocaleTimeString(),
          fullTime: time.toLocaleString(),
          value: smoothedValues[i],
        };
      });
    },
    []
  );

  // Create a separate function to handle interval creation - defined BEFORE it's used
  const createSensorInterval = useCallback(
    (
      sensor: SensorDisplayData,
      intervalsObject: { [key: string]: NodeJS.Timeout }
    ) => {
      const selectedRange =
        TIME_RANGES.find((r) => r.id === sensor.timeRange) || TIME_RANGES[1];

      console.log(
        `Creating interval for sensor ${sensor.id} with time range ${sensor.timeRange} (${selectedRange.updateInterval}ms)`
      );

      // Create interval for this sensor using the predefined update interval
      const intervalId = setInterval(() => {
        const now = Date.now();
        const currentTime = new Date();

        // Update this specific sensor
        setTrailData((prevTrailData) => {
          try {
            const currentData = prevTrailData[sensor.id] || [];

            // If there's no data, skip this update
            if (currentData.length === 0) {
              console.warn(`No data for sensor ${sensor.id}, skipping update`);
              return prevTrailData;
            }

            const lastPoint = currentData[currentData.length - 1];

            // Generate appropriate new data point based on time range
            let newValue;
            const baseValue = sensor.baseValue;
            const variance = sensor.variance;
            const seed = sensor.seed || hashCode(sensor.id);

            switch (selectedRange.id) {
              case "1m":
                // Fast changes for second-by-second view
                const fastOscillation =
                  Math.sin((now / 1000) * Math.PI) * variance * 0.1;
                const randomWalkFast =
                  (seededRandom(seed, now % 10000) - 0.5) * variance * 0.15;
                newValue = lastPoint.value + fastOscillation + randomWalkFast;
                break;

              case "1h":
                // Medium changes for minute-by-minute view
                const mediumOscillation =
                  Math.sin((now / 30000) * Math.PI) * variance * 0.05;
                const meanReversionMedium =
                  (baseValue - lastPoint.value) * 0.03;
                const randomWalkMedium =
                  (seededRandom(seed, now % 10000) - 0.5) * variance * 0.08;
                newValue =
                  lastPoint.value +
                  meanReversionMedium +
                  mediumOscillation +
                  randomWalkMedium;
                break;

              case "1d":
                // Slower changes for hour-by-hour view
                const hourOfDay =
                  currentTime.getHours() + currentTime.getMinutes() / 60;
                const dailyPattern =
                  Math.sin((hourOfDay / 24) * Math.PI * 2) * variance * 0.02;
                const meanReversionSlow = (baseValue - lastPoint.value) * 0.01;
                const randomWalkSlow =
                  (seededRandom(seed, now % 10000) - 0.5) * variance * 0.03;
                newValue =
                  lastPoint.value +
                  meanReversionSlow +
                  dailyPattern +
                  randomWalkSlow;
                break;

              case "1w":
                // Very slow changes for day-by-day view
                const dayOfWeek = currentTime.getDay();
                const hourInDay = currentTime.getHours();
                const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
                const weekendEffect = isWeekend
                  ? variance * 0.005
                  : -variance * 0.002;
                const dailyEffect =
                  Math.sin((hourInDay / 24) * Math.PI * 2) * variance * 0.01;
                const meanReversionVeryLow =
                  (baseValue - lastPoint.value) * 0.005;
                const randomWalkVeryLow =
                  (seededRandom(seed, now % 10000) - 0.5) * variance * 0.01;
                newValue =
                  lastPoint.value +
                  meanReversionVeryLow +
                  weekendEffect +
                  dailyEffect +
                  randomWalkVeryLow;
                break;

              default:
                const meanReversion = (baseValue - lastPoint.value) * 0.05;
                const randomWalk =
                  (seededRandom(seed, now % 10000) - 0.5) * variance * 0.1;
                newValue = lastPoint.value + meanReversion + randomWalk;
            }

            const newDataPoint = {
              id: `${sensor.id}-live-${now}`,
              time: currentTime,
              timeString: currentTime.toLocaleTimeString(),
              fullTime: currentTime.toLocaleString(),
              value: newValue,
            };

            // Update live point for this sensor
            setLivePoint((prev) => ({
              ...prev,
              [sensor.id]: newDataPoint,
            }));

            // Update trail data for this sensor
            const maxPoints = selectedRange.points;
            const updatedData = [...currentData, newDataPoint].slice(
              -maxPoints
            );

            return {
              ...prevTrailData,
              [sensor.id]: updatedData,
            };
          } catch (error) {
            console.error(`Error updating sensor ${sensor.id}:`, error);
            return prevTrailData;
          }
        });
      }, selectedRange.updateInterval);

      intervalsObject[sensor.id] = intervalId;
      return intervalId;
    },
    []
  );

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

      // Create a consistent seed for this sensor
      const seed = hashCode(`${sensor.id}-${sensor.type}-${sensor.location}`);

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
        timeRange: "1h", // Default time range: 1 hour
        seed: seed, // Add seed for consistent random generation
      };
    });

    setSensorDisplayData(displayData);
  }, [selectedMine, selectedSector, mines]);

  // Initialize sensor data when sensors or selections change
  useEffect(() => {
    if (sensorDisplayData.length === 0) return;

    console.log("Initializing sensors with data");

    // Generate initial historical data for each sensor
    const initialData: { [key: string]: DataPoint[] } = {};
    const initialLivePoints: { [key: string]: DataPoint } = {};

    // Clear existing intervals when selections change
    Object.values(sensorIntervals).forEach((interval) =>
      clearInterval(interval)
    );

    // Create new intervals for all sensors
    const newIntervals: { [key: string]: NodeJS.Timeout } = {};

    sensorDisplayData.forEach((sensor) => {
      try {
        const selectedRange =
          TIME_RANGES.find((r) => r.id === sensor.timeRange) || TIME_RANGES[1];

        // Generate historical data for this sensor
        const sensorData = generateHistoricalData(sensor, selectedRange.points);

        if (sensorData.length > 0) {
          initialData[sensor.id] = sensorData;
          initialLivePoints[sensor.id] = sensorData[sensorData.length - 1];

          // Create interval for this sensor
          createSensorInterval(sensor, newIntervals);
        } else {
          console.error(`Failed to generate data for sensor ${sensor.id}`);
        }
      } catch (error) {
        console.error(`Error initializing sensor ${sensor.id}:`, error);
      }
    });

    // Update state with initial data
    setTrailData(initialData);
    setLivePoint(initialLivePoints);
    setSensorIntervals(newIntervals);

    // Mark as initialized
    initializedRef.current = true;

    return () => {
      // Clean up intervals when component unmounts or sensors change
      Object.values(newIntervals).forEach((interval) =>
        clearInterval(interval)
      );
      initializedRef.current = false;
    };
  }, [sensorDisplayData, generateHistoricalData, createSensorInterval]);

  // Add a useEffect to properly reset and reinitialize when selection changes
  useEffect(() => {
    // If mine or sector selection changes, we need to re-initialize
    if (selectedMine && selectedSector) {
      console.log("Mine or sector selection changed, resetting initialization");

      // Clear all existing intervals
      Object.values(sensorIntervals).forEach((interval) =>
        clearInterval(interval)
      );
      setSensorIntervals({});

      // Reset initialization flag to force re-initialization
      initializedRef.current = false;
    }
  }, [selectedMine, selectedSector]);

  // Update the handleTimeRangeChange function to ensure data is properly generated for all time ranges
  const handleTimeRangeChange = (sensorId: string, newRange: string) => {
    console.log(`Changing time range for sensor ${sensorId} to ${newRange}`);

    // Find the sensor to update
    const sensor = sensorDisplayData.find((s) => s.id === sensorId);
    if (!sensor) return;

    // Clear the existing interval for this sensor
    if (sensorIntervals[sensorId]) {
      console.log(`Clearing interval for sensor ${sensorId}`);
      clearInterval(sensorIntervals[sensorId]);
    }

    // Generate new historical data for this specific sensor with the new time range
    const selectedRange =
      TIME_RANGES.find((r) => r.id === newRange) || TIME_RANGES[1];

    // Create a modified sensor object with the new time range
    const updatedSensor = { ...sensor, timeRange: newRange };

    // Generate appropriate historical data based on the new time range
    const historicalData = generateHistoricalData(
      updatedSensor,
      selectedRange.points
    );

    // Update the sensor's time range in the display data
    setSensorDisplayData((prevData) =>
      prevData.map((s) => (s.id === sensorId ? updatedSensor : s))
    );

    // Update trail data for this sensor with the new historical data
    setTrailData((prevData) => ({
      ...prevData,
      [sensorId]: historicalData,
    }));

    // Update the live point to the most recent historical data point
    if (historicalData.length > 0) {
      setLivePoint((prev) => ({
        ...prev,
        [sensorId]: historicalData[historicalData.length - 1],
      }));
    }

    // Create a new interval for this sensor with the appropriate update frequency
    const newIntervals = { ...sensorIntervals };

    // Remove any existing interval reference
    delete newIntervals[sensorId];

    // Create a new interval for this specific sensor
    const newIntervalId = createSensorInterval(updatedSensor, newIntervals);
    newIntervals[sensorId] = newIntervalId;

    // Store the updated intervals
    setSensorIntervals(newIntervals);
  };

  // Format time labels based on time range
  const formatTimeLabel = (time: Date, timeRange: string) => {
    if (!time || !(time instanceof Date)) return "";

    try {
      switch (timeRange) {
        case "1m":
          // For 1-minute view: show seconds
          // Show every 10 seconds for better readability
          if (time.getSeconds() % 10 === 0) {
            return time.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            });
          }
          return "";

        case "1h":
          // For 1-hour view: show minutes
          // Show every 5 minutes for better readability
          if (time.getMinutes() % 5 === 0) {
            return time.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            });
          }
          return "";

        case "1d":
          // For 1-day view: show hours
          // Show every 3 hours for better readability
          if (time.getHours() % 3 === 0 && time.getMinutes() === 0) {
            return time.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            });
          }
          return "";

        case "1w":
          // For 1-week view: show days
          // Show day name for better readability
          if (time.getHours() === 0 && time.getMinutes() === 0) {
            return time.toLocaleDateString([], {
              weekday: "short",
              month: "short",
              day: "numeric",
            });
          }
          return "";

        default:
          return time.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          });
      }
    } catch (e) {
      console.error("Error formatting time:", e);
      return "";
    }
  };

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

  // Render function for the sensor chart to ensure it handles missing data gracefully
  const renderSensorChart = (sensor: SensorDisplayData, data: DataPoint[]) => {
    if (!data || data.length === 0) {
      return (
        <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
          <p className="text-gray-500">No data available for this time range</p>
        </div>
      );
    }

    return (
      <div className="h-64 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 12 }}
              tickFormatter={(time) => formatTimeLabel(time, sensor.timeRange)}
              type="category"
              scale="time"
              padding={{ left: 10, right: 10 }}
            />
            <YAxis tick={{ fontSize: 12 }} domain={["auto", "auto"]} />
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "0.5rem",
                padding: "8px 12px",
                boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
              }}
              formatter={(value: number) => [
                `${value.toFixed(2)} ${sensor.unit}`,
                sensor.name,
              ]}
              labelFormatter={(label) => {
                if (label instanceof Date) {
                  // Format based on time range
                  switch (sensor.timeRange) {
                    case "1m":
                      return label.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      });
                    case "1h":
                      return label.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      });
                    case "1d":
                      return label.toLocaleString([], {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      });
                    case "1w":
                      return label.toLocaleString([], {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                      });
                    default:
                      return label.toLocaleString();
                  }
                }
                const dataPoint = data.find((d) => d.time === label);
                return dataPoint?.fullTime || String(label);
              }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke={sensor.color}
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 4 }}
              isAnimationActive={true}
              animationDuration={300}
              animationEasing="ease-in-out"
              connectNulls={true}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  };

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
              const data = trailData[sensor.id] || [];
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
                  <div className="flex items-center justify-between mb-4">
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

                  <div className="flex items-center justify-end mb-2 space-x-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <div className="flex border rounded-md overflow-hidden">
                      {TIME_RANGES.map((range) => (
                        <button
                          key={range.id}
                          className={`px-2 py-1 text-xs ${
                            sensor.timeRange === range.id
                              ? "bg-blue-500 text-white"
                              : "bg-white text-gray-600 hover:bg-gray-100"
                          }`}
                          onClick={() =>
                            handleTimeRangeChange(sensor.id, range.id)
                          }
                        >
                          {range.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {renderSensorChart(sensor, data)}

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
