import axios from "axios";

const API_URL = "http://localhost:8000/api";

// Helper to get auth token
const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

// Get all users
export const getAllUsers = async () => {
  try {
    const response = await axios.get(`${API_URL}/users`, getAuthHeader());

    // Add role_id to users if not present but we have the role name
    const usersWithRoleIds = await Promise.all(
      response.data.users.map(async (user) => {
        // If user already has role_id, return as is
        if (user.role_id) {
          return user;
        }

        // If user has role name but no role_id, try to fetch it
        if (user.role && !user.role_id) {
          try {
            // Get all roles to find the matching one
            const rolesResponse = await axios.get(
              `${API_URL}/roles`,
              getAuthHeader()
            );
            const matchingRole = rolesResponse.data.roles.find(
              (role) => role.role_name === user.role
            );

            if (matchingRole) {
              return {
                ...user,
                role_id: matchingRole.id,
              };
            }
          } catch (error) {
            console.warn("Error fetching role ID for user:", user.name, error);
          }
        }

        return user;
      })
    );

    return usersWithRoleIds;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};

// Create a new user
export const createUser = async (userData) => {
  try {
    const response = await axios.post(
      `${API_URL}/users`,
      userData,
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};

// Update a user
export const updateUser = async (id, userData) => {
  try {
    const response = await axios.put(
      `${API_URL}/users/${id}`,
      userData,
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
};

// Update user's role
export const updateUserRole = async (id, roleId) => {
  try {
    const response = await axios.put(
      `${API_URL}/users/${id}/role`,
      { role_id: roleId },
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    console.error("Error updating user role:", error);
    throw error;
  }
};

// Get all roles
export const getAllRoles = async () => {
  try {
    const response = await axios.get(`${API_URL}/roles`, getAuthHeader());
    return response.data.roles;
  } catch (error) {
    console.error("Error fetching roles:", error);
    throw error;
  }
};

// Get role names for dropdown
export const getRoleNames = async () => {
  try {
    const response = await axios.get(`${API_URL}/role-names`, getAuthHeader());
    return response.data.roles;
  } catch (error) {
    console.error("Error fetching role names:", error);
    throw error;
  }
};

// Create a new role
export const createRole = async (roleData) => {
  try {
    const response = await axios.post(
      `${API_URL}/roles`,
      roleData,
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    console.error("Error creating role:", error);
    throw error;
  }
};

// Get all permissions
export const getAllPermissions = async () => {
  try {
    const response = await axios.get(`${API_URL}/permissions`, getAuthHeader());
    return response.data.permissions;
  } catch (error) {
    console.error("Error fetching permissions:", error);
    throw error;
  }
};

// Update role permissions
export const updateRolePermissions = async (roleId, permissions) => {
  try {
    const response = await axios.put(
      `${API_URL}/roles/${roleId}/permissions`,
      { permissions },
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    console.error("Error updating role permissions:", error);
    throw error;
  }
};

// Get role permissions
export const getRolePermissions = async (roleId) => {
  try {
    const response = await axios.get(
      `${API_URL}/roles/${roleId}/permissions`,
      getAuthHeader()
    );
    return response.data.permissions;
  } catch (error) {
    console.error("Error fetching role permissions:", error);
    throw error;
  }
};

// Update user permissions directly
export const updateUserPermissions = async (id, permissions) => {
  try {
    const response = await axios.put(
      `${API_URL}/users/${id}/permissions`,
      { permissions },
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    console.error("Error updating user permissions:", error);
    throw error;
  }
};

// Delete a user
export const deleteUser = async (id) => {
  try {
    const response = await axios.delete(
      `${API_URL}/users/${id}`,
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
};
