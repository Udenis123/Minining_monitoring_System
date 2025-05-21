import axios from "axios";
import { Mine, Sector, SensorConfig } from "../types";

const API_BASE_URL = "http://localhost:8000/api"; // Adjust this to match your Laravel backend URL

const mineService = {
  // Get all mines
  getAllMines: async (): Promise<Mine[]> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/mines`);
      // Ensure we're getting an array of mines
      const mines = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.data.data)
        ? response.data.data
        : [];

      // Transform and validate each mine object
      return mines.map((mine: any) => ({
        id: mine.id?.toString() || "",
        name: mine.name || "",
        location: mine.location || "",
        status: mine.status || "active",
        areaNumber: mine.area_number || "",
        coordinates: {
          lat: parseFloat(mine.latitude) || 0,
          lng: parseFloat(mine.longitude) || 0,
        },
        depth: parseFloat(mine.depth) || 0,
        description: mine.description || "",
        sectors: Array.isArray(mine.sectors)
          ? mine.sectors.map((sector: any) => ({
              id: sector.id?.toString() || "",
              name: sector.name || "",
              level: parseInt(sector.level) || 1,
              status: sector.status || "active",
              sensors: Array.isArray(sector.sensors)
                ? sector.sensors.map((sensor: any) => ({
                    id: sensor.id?.toString() || "",
                    type: sensor.type || "gas",
                    location: sensor.location || "",
                    coordinates: {
                      lat: parseFloat(sensor.latitude) || 0,
                      lng: parseFloat(sensor.longitude) || 0,
                    },
                    status: sensor.status || "active",
                    installationDate: new Date(
                      sensor.installation_date || Date.now()
                    ),
                    lastCalibration: new Date(
                      sensor.last_calibration || Date.now()
                    ),
                    specifications: {
                      model: sensor.model || "",
                      range: sensor.range || "",
                      accuracy: sensor.accuracy || "",
                      manufacturer: sensor.manufacturer || "",
                    },
                  }))
                : [],
            }))
          : [],
      }));
    } catch (error) {
      console.error("Error fetching mines:", error);
      throw error;
    }
  },

  // Get a single mine by ID
  getMine: async (id: string): Promise<Mine> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/mines/${id}`);
      const mine = response.data.data || response.data;

      return {
        id: mine.id?.toString() || "",
        name: mine.name || "",
        location: mine.location || "",
        status: mine.status || "active",
        areaNumber: mine.area_number || "",
        coordinates: {
          lat: parseFloat(mine.latitude) || 0,
          lng: parseFloat(mine.longitude) || 0,
        },
        depth: parseFloat(mine.depth) || 0,
        description: mine.description || "",
        sectors: Array.isArray(mine.sectors)
          ? mine.sectors.map((sector: any) => ({
              id: sector.id?.toString() || "",
              name: sector.name || "",
              level: parseInt(sector.level) || 1,
              status: sector.status || "active",
              sensors: Array.isArray(sector.sensors)
                ? sector.sensors.map((sensor: any) => ({
                    id: sensor.id?.toString() || "",
                    type: sensor.type || "gas",
                    location: sensor.location || "",
                    coordinates: {
                      lat: parseFloat(sensor.latitude) || 0,
                      lng: parseFloat(sensor.longitude) || 0,
                    },
                    status: sensor.status || "active",
                    installationDate: new Date(
                      sensor.installation_date || Date.now()
                    ),
                    lastCalibration: new Date(
                      sensor.last_calibration || Date.now()
                    ),
                    specifications: {
                      model: sensor.model || "",
                      range: sensor.range || "",
                      accuracy: sensor.accuracy || "",
                      manufacturer: sensor.manufacturer || "",
                    },
                  }))
                : [],
            }))
          : [],
      };
    } catch (error) {
      console.error("Error fetching mine:", error);
      throw error;
    }
  },

  // Create a new mine
  createMine: async (mineData: Omit<Mine, "id" | "sectors">): Promise<Mine> => {
    try {
      // Transform the data to match the API's expected format
      const apiData = {
        name: mineData.name,
        location: mineData.location,
        status: mineData.status,
        area_number: mineData.areaNumber,
        latitude: mineData.coordinates.lat,
        longitude: mineData.coordinates.lng,
        depth: mineData.depth,
        description: mineData.description,
      };
      const response = await axios.post(`${API_BASE_URL}/mines`, apiData);
      return response.data;
    } catch (error) {
      console.error("Error creating mine:", error);
      throw error;
    }
  },

  // Update a mine
  updateMine: async (id: string, mineData: Partial<Mine>): Promise<Mine> => {
    try {
      const response = await axios.put(`${API_BASE_URL}/mines/${id}`, mineData);
      return response.data;
    } catch (error) {
      console.error("Error updating mine:", error);
      throw error;
    }
  },

  // Delete a mine
  deleteMine: async (id: string): Promise<void> => {
    try {
      await axios.delete(`${API_BASE_URL}/mines/${id}`);
    } catch (error) {
      console.error("Error deleting mine:", error);
      throw error;
    }
  },

  // Create a new sector in a mine
  createSector: async (
    mineId: string,
    sectorData: Omit<Sector, "id" | "sensors">
  ): Promise<Sector> => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/mines/${mineId}/sectors`,
        sectorData
      );
      return response.data;
    } catch (error) {
      console.error("Error creating sector:", error);
      throw error;
    }
  },

  // Update a sector
  updateSector: async (
    mineId: string,
    sectorId: string,
    sectorData: Partial<Sector>
  ): Promise<Sector> => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/mines/${mineId}/sectors/${sectorId}`,
        sectorData
      );
      return response.data;
    } catch (error) {
      console.error("Error updating sector:", error);
      throw error;
    }
  },

  // Delete a sector
  deleteSector: async (mineId: string, sectorId: string): Promise<void> => {
    try {
      await axios.delete(`${API_BASE_URL}/mines/${mineId}/sectors/${sectorId}`);
    } catch (error) {
      console.error("Error deleting sector:", error);
      throw error;
    }
  },

  // Create a new sensor in a sector
  createSensor: async (
    mineId: string,
    sectorId: string,
    sensorData: Omit<
      SensorConfig,
      "id" | "installationDate" | "lastCalibration"
    >
  ): Promise<SensorConfig> => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/mines/${mineId}/sectors/${sectorId}/sensors`,
        sensorData
      );
      return response.data;
    } catch (error) {
      console.error("Error creating sensor:", error);
      throw error;
    }
  },

  // Update a sensor
  updateSensor: async (
    mineId: string,
    sectorId: string,
    sensorId: string,
    sensorData: Partial<SensorConfig>
  ): Promise<SensorConfig> => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/mines/${mineId}/sectors/${sectorId}/sensors/${sensorId}`,
        sensorData
      );
      return response.data;
    } catch (error) {
      console.error("Error updating sensor:", error);
      throw error;
    }
  },

  // Delete a sensor
  deleteSensor: async (
    mineId: string,
    sectorId: string,
    sensorId: string
  ): Promise<void> => {
    try {
      await axios.delete(
        `${API_BASE_URL}/mines/${mineId}/sectors/${sectorId}/sensors/${sensorId}`
      );
    } catch (error) {
      console.error("Error deleting sensor:", error);
      throw error;
    }
  },
};

export default mineService;
