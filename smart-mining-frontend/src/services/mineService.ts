import axios from "axios";
import { Mine, Sector, SensorConfig } from "../types";

const API_BASE_URL = "http://localhost:8000/api"; // Adjust this to match your Laravel backend URL

// Configure axios defaults
axios.defaults.headers.common["Accept"] = "application/json";
axios.defaults.headers.common["Content-Type"] = "application/json";

// Add auth token if available - using 'token' as the key
const token = localStorage.getItem("token");
if (token) {
  axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
}

// Add interceptor to handle errors globally
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized errors
    if (error.response && error.response.status === 401) {
      // Redirect to login or handle token expiration
      console.error("Authentication error:", error);
    }
    return Promise.reject(error);
  }
);

// Helper function to get the current token
const getAuthToken = () => {
  return localStorage.getItem("token");
};

const mineService = {
  // Get all mines
  getAllMines: async (): Promise<Mine[]> => {
    try {
      // Get the current auth token
      const token = getAuthToken();

      const response = await axios.get(`${API_BASE_URL}/mines`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

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
        areaNumber: mine.area_number || mine.areaNumber || "",
        coordinates: {
          lat: parseFloat(mine.latitude || (mine.coordinates?.lat ?? 0)),
          lng: parseFloat(mine.longitude || (mine.coordinates?.lng ?? 0)),
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
                      lat: parseFloat(
                        sensor.latitude || (sensor.coordinates?.lat ?? 0)
                      ),
                      lng: parseFloat(
                        sensor.longitude || (sensor.coordinates?.lng ?? 0)
                      ),
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
      // Get the current auth token
      const token = getAuthToken();

      const response = await axios.get(`${API_BASE_URL}/mines/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      const mine = response.data.data || response.data;

      return {
        id: mine.id?.toString() || "",
        name: mine.name || "",
        location: mine.location || "",
        status: mine.status || "active",
        areaNumber: mine.area_number || mine.areaNumber || "",
        coordinates: {
          lat: parseFloat(mine.latitude || (mine.coordinates?.lat ?? 0)),
          lng: parseFloat(mine.longitude || (mine.coordinates?.lng ?? 0)),
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
                      lat: parseFloat(
                        sensor.latitude || (sensor.coordinates?.lat ?? 0)
                      ),
                      lng: parseFloat(
                        sensor.longitude || (sensor.coordinates?.lng ?? 0)
                      ),
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
      // Format the data exactly as the API expects it
      const apiData = {
        name: mineData.name,
        location: mineData.location,
        status: mineData.status,
        areaNumber: mineData.areaNumber, // Using areaNumber instead of area_number
        coordinates: {
          lat: parseFloat(String(mineData.coordinates.lat)),
          lng: parseFloat(String(mineData.coordinates.lng)),
        },
        depth: parseFloat(String(mineData.depth)),
        description: mineData.description || "",
      };

      console.log("Sending data to API:", apiData);

      // Get the current auth token
      const token = getAuthToken();

      // Make the API request with the token in headers
      const response = await axios.post(`${API_BASE_URL}/mines`, apiData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      // Check if the response contains data in the expected format
      if (response.data && response.data.data) {
        return response.data.data;
      }

      return response.data;
    } catch (error: any) {
      // Handle validation errors (422 status)
      if (error.response && error.response.status === 422) {
        const validationErrors = error.response.data.errors || {};
        console.error("Validation errors:", validationErrors);

        // Map backend field names to frontend field names for better error messages
        const fieldMapping: Record<string, string> = {
          area_number: "areaNumber",
          latitude: "coordinates.lat",
          longitude: "coordinates.lng",
          areaNumber: "areaNumber",
          "coordinates.lat": "coordinates.lat",
          "coordinates.lng": "coordinates.lng",
        };

        let errorMessage = "Validation failed: ";

        // Format validation errors into a readable message
        Object.keys(validationErrors).forEach((field) => {
          const displayField = fieldMapping[field] || field;
          errorMessage += `${displayField} - ${validationErrors[field].join(
            ", "
          )}; `;
        });

        throw new Error(errorMessage);
      }

      console.error("Error creating mine:", error);
      throw error;
    }
  },

  // Update a mine
  updateMine: async (id: string, mineData: Partial<Mine>): Promise<Mine> => {
    try {
      // Format the data exactly as the API expects it
      const apiData: any = {
        ...(mineData.name && { name: mineData.name }),
        ...(mineData.location && { location: mineData.location }),
        ...(mineData.status && { status: mineData.status }),
        ...(mineData.areaNumber && { areaNumber: mineData.areaNumber }),
        ...(mineData.coordinates && {
          coordinates: {
            lat: parseFloat(String(mineData.coordinates.lat)),
            lng: parseFloat(String(mineData.coordinates.lng)),
          },
        }),
        ...(mineData.depth !== undefined && {
          depth: parseFloat(String(mineData.depth)),
        }),
        ...(mineData.description !== undefined && {
          description: mineData.description,
        }),
      };

      console.log("Updating mine with data:", apiData);

      // Get the current auth token
      const token = getAuthToken();

      // Make the API request with the token in headers
      const response = await axios.put(`${API_BASE_URL}/mines/${id}`, apiData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      // Check if the response contains data in the expected format
      if (response.data && response.data.data) {
        return response.data.data;
      }

      return response.data;
    } catch (error: any) {
      // Handle validation errors
      if (error.response && error.response.status === 422) {
        const validationErrors = error.response.data.errors || {};

        // Map backend field names to frontend field names
        const fieldMapping: Record<string, string> = {
          area_number: "areaNumber",
          latitude: "coordinates.lat",
          longitude: "coordinates.lng",
          areaNumber: "areaNumber",
          "coordinates.lat": "coordinates.lat",
          "coordinates.lng": "coordinates.lng",
        };

        let errorMessage = "Validation failed: ";

        Object.keys(validationErrors).forEach((field) => {
          const displayField = fieldMapping[field] || field;
          errorMessage += `${displayField} - ${validationErrors[field].join(
            ", "
          )}; `;
        });

        console.error("Validation errors:", validationErrors);
        throw new Error(errorMessage);
      }

      console.error("Error updating mine:", error);
      throw error;
    }
  },

  // Delete a mine
  deleteMine: async (id: string): Promise<void> => {
    try {
      // Get the current auth token
      const token = getAuthToken();

      await axios.delete(`${API_BASE_URL}/mines/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });
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
      // Get the current auth token
      const token = getAuthToken();

      const response = await axios.post(
        `${API_BASE_URL}/mines/${mineId}/sectors`,
        sectorData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
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
      // Get the current auth token
      const token = getAuthToken();

      const response = await axios.put(
        `${API_BASE_URL}/mines/${mineId}/sectors/${sectorId}`,
        sectorData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
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
      // Get the current auth token
      const token = getAuthToken();

      await axios.delete(
        `${API_BASE_URL}/mines/${mineId}/sectors/${sectorId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );
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
      // Format sensor data to match API expectations
      const apiData = {
        type: sensorData.type,
        location: sensorData.location,
        coordinates: {
          lat: parseFloat(String(sensorData.coordinates.lat)),
          lng: parseFloat(String(sensorData.coordinates.lng)),
        },
        specifications: sensorData.specifications,
        status: sensorData.status || "active",
      };

      // Get the current auth token
      const token = getAuthToken();

      const response = await axios.post(
        `${API_BASE_URL}/mines/${mineId}/sectors/${sectorId}/sensors`,
        apiData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
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
      // Format sensor data to match API expectations
      const apiData: any = {};

      if (sensorData.type) apiData.type = sensorData.type;
      if (sensorData.location) apiData.location = sensorData.location;
      if (sensorData.coordinates) {
        apiData.coordinates = {
          lat: parseFloat(String(sensorData.coordinates.lat)),
          lng: parseFloat(String(sensorData.coordinates.lng)),
        };
      }
      if (sensorData.specifications)
        apiData.specifications = sensorData.specifications;
      if (sensorData.status) apiData.status = sensorData.status;

      // Get the current auth token
      const token = getAuthToken();

      const response = await axios.put(
        `${API_BASE_URL}/mines/${mineId}/sectors/${sectorId}/sensors/${sensorId}`,
        apiData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
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
      // Get the current auth token
      const token = getAuthToken();

      await axios.delete(
        `${API_BASE_URL}/mines/${mineId}/sectors/${sectorId}/sensors/${sensorId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );
    } catch (error) {
      console.error("Error deleting sensor:", error);
      throw error;
    }
  },
};

export default mineService;
