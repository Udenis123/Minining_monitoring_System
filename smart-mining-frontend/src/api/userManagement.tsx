import axios from "axios";

const API_BASE_URL = "https://your-backend-api.com";

// User logs API functions
export const getAllLogs = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams();

    // Add filters to query params
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        queryParams.append(key, value.toString());
      }
    });

    const query = queryParams.toString() ? `?${queryParams.toString()}` : "";
    const response = await axios.get(`${API_BASE_URL}/logs${query}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching logs:", error);
    throw error;
  }
};

export const getLogsByAction = async (action, filters = {}) => {
  try {
    const queryParams = new URLSearchParams();

    // Add filters to query params
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        queryParams.append(key, value.toString());
      }
    });

    const query = queryParams.toString() ? `?${queryParams.toString()}` : "";
    const response = await axios.get(
      `${API_BASE_URL}/logs/action/${action}${query}`
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching logs for action ${action}:`, error);
    throw error;
  }
};

export const getEntityLogs = async (entityType, entityId, filters = {}) => {
  try {
    const queryParams = new URLSearchParams();

    // Add filters to query params
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        queryParams.append(key, value.toString());
      }
    });

    const query = queryParams.toString() ? `?${queryParams.toString()}` : "";
    const response = await axios.get(
      `${API_BASE_URL}/logs/entity/${entityType}/${entityId}${query}`
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching logs for ${entityType} ${entityId}:`, error);
    throw error;
  }
};

export const getLogsSummary = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/logs/summary`);
    return response.data;
  } catch (error) {
    console.error("Error fetching logs summary:", error);
    throw error;
  }
};

export const getMyLogs = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams();

    // Add filters to query params
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        queryParams.append(key, value.toString());
      }
    });

    const query = queryParams.toString() ? `?${queryParams.toString()}` : "";
    const response = await axios.get(`${API_BASE_URL}/logs/my-logs${query}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching my logs:", error);
    throw error;
  }
};
