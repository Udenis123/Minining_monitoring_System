import React, { useState, useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { useAuthStore } from "../store/authStore";
import { mockMines } from "../data/mockData";
import { User, Permission, SectorPermission } from "../types";
import { Plus, X, ChevronDown, ChevronUp } from "lucide-react";
import {
  getAllUsers,
  createUser,
  updateUser,
  updateUserRole,
  getAllRoles,
  getRoleNames,
  createRole,
  getAllPermissions,
  updateRolePermissions,
  getRolePermissions,
  updateUserPermissions,
  deleteUser,
} from "../api/userManagement";
import UserLogs from "./UserLogs";

// Define a type for permissions that can be either string or object
type PermissionItem = string | { id: number; permission_name: string };

export function UserManagement() {
  const currentUser = useAuthStore((state) => state.user);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [expandedUsers, setExpandedUsers] = useState<string[]>([]);
  const [showCreateRoleModal, setShowCreateRoleModal] = useState(false);
  const [showUserLogsModal, setShowUserLogsModal] = useState(false);
  const [filterAction, setFilterAction] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  // Real data from backend
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [availablePermissions, setAvailablePermissions] = useState<
    PermissionItem[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add user permissions management
  const [updatedPermissions, setUpdatedPermissions] = useState<string[]>([]);

  // Add success message state at the top of the component
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // When opening the permissions modal, initialize with user's current permissions
  // and find the role_id from the role name
  useEffect(() => {
    if (selectedUser && showPermissionModal) {
      setUpdatedPermissions(selectedUser.permissions || []);

      // Ensure sectorAccess is initialized
      if (!selectedUser.sectorAccess) {
        selectedUser.sectorAccess = [];
      }

      // If role_id is missing but role name is available, try to find the role_id
      if (!selectedUser.role_id && selectedUser.role && roles.length > 0) {
        const matchingRole = roles.find(
          (role) => role.role_name === selectedUser.role
        );
        if (matchingRole) {
          // Set the role_id on the selectedUser
          selectedUser.role_id = matchingRole.id;
        }
      }
    }
  }, [selectedUser, showPermissionModal, roles]);

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch users
        const fetchedUsers = await getAllUsers();
        console.log("Fetched users:", fetchedUsers);
        setUsers(fetchedUsers);

        // Fetch roles
        const fetchedRoles = await getAllRoles();
        console.log("Fetched roles:", fetchedRoles);
        setRoles(fetchedRoles);

        // Fetch permissions and convert to strings if objects
        const fetchedPermissions = await getAllPermissions();
        const normalizedPermissions = fetchedPermissions.map((p: any) =>
          typeof p === "object" && p.permission_name ? p.permission_name : p
        );
        setAvailablePermissions(normalizedPermissions);

        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data. Please try again.");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const [newUser, setNewUser] = useState({
    email: "",
    name: "",
    role_id: "",
    password: "",
    password_confirmation: "",
    permissions: [] as string[],
    sectorAccess: [] as {
      mineId: string;
      sectorId: string;
      permissions: SectorPermission[];
    }[],
  });

  const [newRole, setNewRole] = useState<{
    role_name: string;
    permissions: string[];
  }>({
    role_name: "",
    permissions: [],
  });

  const availableSectorPermissions: SectorPermission[] = [
    "view_sector",
    "manage_sector",
    "view_sector_sensors",
    "manage_sector_sensors",
    "view_sector_alerts",
    "manage_sector_alerts",
    "view_sector_reports",
  ];

  const handlePermissionToggle = (permission: Permission) => {
    setNewUser((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter((p) => p !== permission)
        : [...prev.permissions, permission],
    }));
  };

  const handleSectorPermissionToggle = (
    mineId: string,
    sectorId: string,
    permission: SectorPermission
  ) => {
    setNewUser((prev) => {
      const existingAccess = prev.sectorAccess.find(
        (access) => access.mineId === mineId && access.sectorId === sectorId
      );

      if (existingAccess) {
        // Update existing access
        return {
          ...prev,
          sectorAccess: prev.sectorAccess.map((access) => {
            if (access.mineId === mineId && access.sectorId === sectorId) {
              return {
                ...access,
                permissions: access.permissions.includes(permission)
                  ? access.permissions.filter((p) => p !== permission)
                  : [...access.permissions, permission],
              };
            }
            return access;
          }),
        };
      } else {
        // Add new access
        return {
          ...prev,
          sectorAccess: [
            ...prev.sectorAccess,
            {
              mineId,
              sectorId,
              permissions: [permission],
            },
          ],
        };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Clear previous messages
    setError(null);
    setSuccessMessage(null);

    // Client-side validation first
    if (!selectedUser && (!newUser.password || newUser.password.length < 8)) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (!selectedUser && newUser.password !== newUser.password_confirmation) {
      setError("Password and confirmation do not match");
      return;
    }

    if (!newUser.role_id) {
      setError("Please select a role");
      return;
    }

    try {
      // Prepare user data - only include necessary fields for the API
      const userData = {
        name: newUser.name,
        email: newUser.email,
        password: newUser.password,
        password_confirmation: newUser.password_confirmation,
        role_id: newUser.role_id,
      };

      if (selectedUser) {
        // Update existing user - only include password if it was changed
        const updateData: any = {
          name: newUser.name,
          email: newUser.email,
        };

        // Only include password if it was changed
        if (newUser.password) {
          updateData.password = newUser.password;
          updateData.password_confirmation = newUser.password_confirmation;
        }

        const response = await updateUser(selectedUser.id, updateData);

        // If role was changed, update it separately
        if (newUser.role_id !== selectedUser.role_id) {
          await updateUserRole(selectedUser.id, newUser.role_id);
        }

        // Update user in state
        setUsers(
          users.map((user) =>
            user.id === selectedUser.id ? { ...user, ...response.user } : user
          )
        );

        setSuccessMessage("User updated successfully!");
      } else {
        // Create new user
        const response = await createUser(userData);
        setUsers([...users, response.user]);
        setSuccessMessage("User created successfully!");
      }

      setShowAddModal(false);
      setNewUser({
        email: "",
        name: "",
        role_id: "",
        password: "",
        password_confirmation: "",
        permissions: [],
        sectorAccess: [],
      });
      setSelectedUser(null);

      // Show success message for 3 seconds then clear it
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err: any) {
      console.error("Error saving user:", err);
      // Handle validation errors
      if (err.response?.data?.errors) {
        setError(Object.values(err.response.data.errors).flat().join("\n"));
      } else {
        setError("Failed to save user. Please try again.");
      }
    }
  };

  const toggleUserExpand = (userId: string) => {
    setExpandedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Create the role with permissions in a single request
      const response = await createRole({
        role_name: newRole.role_name,
        permissions: newRole.permissions,
      });

      // Refresh roles list
      const updatedRoles = await getAllRoles();
      setRoles(updatedRoles);

      setShowCreateRoleModal(false);
      setNewRole({
        role_name: "",
        permissions: [],
      });
    } catch (err: any) {
      console.error("Error creating role:", err);
      if (err.response?.data?.errors) {
        setError(Object.values(err.response.data.errors).flat().join("\n"));
      } else {
        setError("Failed to create role. Please try again.");
      }
    }
  };

  const mockLogs = [
    {
      id: 1,
      user: "admin",
      action: "CREATE_USER",
      details: 'Created a new user with role "analytics"',
      created_at: new Date().toISOString(),
    },
    {
      id: 2,
      user: "supervisor",
      action: "UPDATE_PERMISSIONS",
      details:
        'Updated permissions for user "analytics" to include "view_all_mines"',
      created_at: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: 3,
      user: "admin",
      action: "DELETE_USER",
      details: 'Deleted user "supervisor"',
      created_at: new Date(Date.now() - 7200000).toISOString(),
    },
    {
      id: 4,
      user: "analytics",
      action: "VIEW_REPORTS",
      details: 'Viewed reports for "North Shaft Mine, Sector A"',
      created_at: new Date(Date.now() - 10800000).toISOString(),
    },
    {
      id: 5,
      user: "supervisor",
      action: "MANAGE_SECTOR",
      details: 'Managed sector "Deep Core Mine, Sector B"',
      created_at: new Date(Date.now() - 14400000).toISOString(),
    },
  ];

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleFilterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterAction(event.target.value);
  };

  // Function to handle user deletion
  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      // Call the API to delete the user
      const response = await deleteUser(userToDelete.id);

      // Remove the user from the local state
      setUsers(users.filter((user) => user.id !== userToDelete.id));

      // Show success message
      setSuccessMessage("User deleted successfully!");

      // Close the delete modal
      setShowDeleteModal(false);
      setUserToDelete(null);

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err: any) {
      console.error("Error deleting user:", err);
      // Handle specific error cases
      if (err.response?.status === 403) {
        setError("Cannot delete the only admin user.");
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Failed to delete user. Please try again.");
      }
    }
  };

  // Define handleRefresh before it's used
  const handleRefresh = () => {
    // Logic to refresh the logs
    console.log("Refreshing logs...");
  };

  const handlePermissionChange = (permission: PermissionItem) => {
    const permName =
      typeof permission === "object" ? permission.permission_name : permission;
    setUpdatedPermissions((prev) =>
      prev.includes(permName)
        ? prev.filter((p) => p !== permName)
        : [...prev, permName]
    );
  };

  const savePermissions = async () => {
    try {
      if (!selectedUser) return;

      console.log("Saving permissions for user:", selectedUser);

      // Check if user has a role_id
      if (!selectedUser.role_id) {
        console.error("No role_id found for user:", selectedUser);
        setError("Cannot update permissions: user has no assigned role");
        return;
      }

      // Update role permissions instead of user permissions directly
      // This is more appropriate since permissions are attached to roles
      const response = await updateRolePermissions(
        selectedUser.role_id,
        updatedPermissions
      );

      // Update the user in the local state
      setUsers(
        users.map((user) =>
          user.id === selectedUser.id
            ? { ...user, permissions: updatedPermissions }
            : user
        )
      );

      setSuccessMessage("Permissions updated successfully!");
      setShowPermissionModal(false);

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      console.error("Error updating permissions:", err);
      setError("Failed to update permissions. Please try again.");
    }
  };

  // Helper function to extract permission name
  const getPermissionName = (permission: any): string => {
    if (typeof permission === "object" && permission.permission_name) {
      return permission.permission_name;
    }
    return String(permission);
  };

  // Helper function to check if permissions includes permission (by name or id)
  const permissionIncluded = (permissions: any[], permission: any): boolean => {
    if (typeof permission === "object" && permission.id) {
      return permissions.some(
        (p) =>
          (typeof p === "object" && p.id === permission.id) ||
          p === permission.id ||
          p === permission.permission_name
      );
    }
    return permissions.includes(permission);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="ml-64 p-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              User Management
            </h1>
            <p className="mt-1 text-gray-500">
              Manage system users and their permissions
            </p>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add User
            </button>
            <button
              onClick={() => setShowCreateRoleModal(true)}
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Role
            </button>
            <button
              onClick={() => setShowUserLogsModal(true)}
              className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              User Logs
            </button>
          </div>
        </div>

        {/* Add success message alert to the UI */}
        {successMessage && (
          <div className="mb-4 p-3 bg-green-100 text-green-800 rounded-md flex justify-between items-center">
            <span>{successMessage}</span>
            <button
              onClick={() => setSuccessMessage(null)}
              className="text-green-600 hover:text-green-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Show users table when not viewing logs */}
        {!showUserLogsModal && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Name</th>
                    <th className="text-left py-3 px-4">Email</th>
                    <th className="text-left py-3 px-4">Role</th>
                    <th className="text-left py-3 px-4">Mine Assignment</th>
                    <th className="text-left py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="py-8 text-center text-gray-500"
                      >
                        Loading users...
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-red-500">
                        {error}
                      </td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="py-8 text-center text-gray-500"
                      >
                        No users found
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <React.Fragment key={user.id}>
                        <tr className="border-b">
                          <td className="py-3 px-4">{user.name}</td>
                          <td className="py-3 px-4">{user.email}</td>
                          <td className="py-3 px-4 capitalize">{user.role}</td>
                          <td className="py-3 px-4">All Mines</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-3">
                              <button
                                onClick={() => toggleUserExpand(user.id)}
                                className="text-gray-600 hover:text-gray-900"
                              >
                                {expandedUsers.includes(user.id) ? (
                                  <ChevronUp className="w-5 h-5" />
                                ) : (
                                  <ChevronDown className="w-5 h-5" />
                                )}
                              </button>
                              <button
                                onClick={() => {
                                  // Ensure the user has the required properties before opening the modal
                                  // Find role_id if it's missing but role name is available
                                  let role_id = user.role_id;
                                  if (
                                    !role_id &&
                                    user.role &&
                                    roles.length > 0
                                  ) {
                                    const matchingRole = roles.find(
                                      (role) => role.role_name === user.role
                                    );
                                    if (matchingRole) {
                                      role_id = matchingRole.id;
                                    }
                                  }

                                  const userWithDefaults = {
                                    ...user,
                                    role_id: role_id,
                                    permissions: user.permissions || [],
                                    sectorAccess: user.sectorAccess || [],
                                  };
                                  setSelectedUser(userWithDefaults);
                                  setShowPermissionModal(true);
                                }}
                                className="text-blue-500 hover:text-blue-700"
                              >
                                Manage Permissions
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedUser(user);
                                  setNewUser({
                                    name: user.name,
                                    email: user.email,
                                    role_id: user.role_id || "",
                                    password: "",
                                    password_confirmation: "",
                                    permissions: user.permissions || [],
                                    sectorAccess: user.sectorAccess || [],
                                  });
                                  setShowAddModal(true);
                                }}
                                className="text-green-500 hover:text-green-700"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => {
                                  setUserToDelete(user);
                                  setShowDeleteModal(true);
                                }}
                                className="text-red-500 hover:text-red-700"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                        {expandedUsers.includes(user.id) && (
                          <tr>
                            <td colSpan={5} className="bg-gray-50 px-4 py-4">
                              <div className="space-y-4">
                                <div>
                                  <h4 className="font-medium text-gray-900 mb-2">
                                    Global Permissions
                                  </h4>
                                  <div className="flex flex-wrap gap-2">
                                    {user.permissions &&
                                      user.permissions.map(
                                        (permission: string) => (
                                          <span
                                            key={permission}
                                            className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                                          >
                                            {typeof permission === "string"
                                              ? permission.replace(/_/g, " ")
                                              : permission}
                                          </span>
                                        )
                                      )}
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Show logs when the logs modal is open */}
        {showUserLogsModal && (
          <div>
            <div className="mb-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">
                System Activity Logs
              </h2>
              <button
                onClick={() => setShowUserLogsModal(false)}
                className="text-gray-600 hover:text-gray-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <UserLogs />
          </div>
        )}

        {/* Add User Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">
                  {selectedUser ? "Edit User" : "Add New User"}
                </h2>
                <button onClick={() => setShowAddModal(false)}>
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Name
                      </label>
                      <input
                        type="text"
                        value={newUser.name}
                        onChange={(e) =>
                          setNewUser((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        className="w-full p-2 border rounded-md"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        value={newUser.email}
                        onChange={(e) =>
                          setNewUser((prev) => ({
                            ...prev,
                            email: e.target.value,
                          }))
                        }
                        className="w-full p-2 border rounded-md"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Role
                      </label>
                      <select
                        value={newUser.role_id}
                        onChange={(e) =>
                          setNewUser((prev) => ({
                            ...prev,
                            role_id: e.target.value,
                          }))
                        }
                        className="w-full p-2 border rounded-md"
                        required
                      >
                        <option value="">Select a role</option>
                        {roles.map((role) => (
                          <option key={role.id} value={role.id}>
                            {role.role_name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Password
                      </label>
                      <input
                        type="password"
                        value={newUser.password}
                        onChange={(e) =>
                          setNewUser((prev) => ({
                            ...prev,
                            password: e.target.value,
                          }))
                        }
                        className="w-full p-2 border rounded-md"
                        autoComplete="new-password"
                        required={!selectedUser}
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      value={newUser.password_confirmation}
                      onChange={(e) =>
                        setNewUser((prev) => ({
                          ...prev,
                          password_confirmation: e.target.value,
                        }))
                      }
                      className="w-full p-2 border rounded-md"
                      autoComplete="new-password"
                      required={!selectedUser}
                    />
                  </div>
                </div>

                {/* Display error messages */}
                {error && (
                  <div className="mt-4 mb-2 p-3 bg-red-100 text-red-800 rounded-md">
                    {error.split("\n").map((err, i) => (
                      <div key={i} className="mb-1">
                        {err}
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-6 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="mr-3 px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  >
                    {selectedUser ? "Update User" : "Add User"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Manage Permissions Modal */}
        {showPermissionModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-bold">Manage Role Permissions</h2>
                  <p className="text-gray-500">
                    {selectedUser.name} - {selectedUser.role}
                  </p>
                  {selectedUser.role_id ? (
                    <p className="text-xs text-gray-400 mt-1">
                      Editing permissions for the "{selectedUser.role}" role
                    </p>
                  ) : (
                    <p className="text-xs text-red-500 mt-1">
                      User has no assigned role. Please assign a role first.
                    </p>
                  )}
                </div>
                <button onClick={() => setShowPermissionModal(false)}>
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-3">
                    Global Permissions
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {availablePermissions.map((permission) => (
                      <label
                        key={
                          typeof permission === "object"
                            ? String(permission.id || "")
                            : String(permission)
                        }
                        className="flex items-center space-x-2 p-2 bg-gray-50 rounded"
                      >
                        <input
                          type="checkbox"
                          checked={updatedPermissions.includes(
                            typeof permission === "object"
                              ? permission.permission_name
                              : permission
                          )}
                          onChange={() => handlePermissionChange(permission)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm capitalize">
                          {typeof permission === "object" &&
                          permission.permission_name
                            ? (permission as any).permission_name.replace(
                                /_/g,
                                " "
                              )
                            : typeof permission === "string"
                            ? permission.replace(/_/g, " ")
                            : String(permission)}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-3">
                    Sector-Specific Permissions
                  </h3>
                  <div className="space-y-4">
                    {mockMines.map((mine) => (
                      <div key={mine.id} className="border rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-3">
                          {mine.name}
                        </h4>
                        <div className="space-y-4">
                          {mine.sectors.map((sector) => (
                            <div
                              key={sector.id}
                              className="bg-gray-50 p-3 rounded"
                            >
                              <h5 className="font-medium text-gray-700 mb-2">
                                {sector.name}
                              </h5>
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                {availableSectorPermissions.map(
                                  (permission) => (
                                    <label
                                      key={permission}
                                      className="flex items-center space-x-2"
                                    >
                                      <input
                                        type="checkbox"
                                        checked={
                                          selectedUser.sectorAccess &&
                                          selectedUser.sectorAccess.some(
                                            (access) =>
                                              access.mineId === mine.id &&
                                              access.sectorId === sector.id &&
                                              access.permissions.includes(
                                                permission
                                              )
                                          )
                                        }
                                        onChange={() => {
                                          // Update sector permissions logic here
                                        }}
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                      />
                                      <span className="text-sm capitalize">
                                        {typeof permission === "string"
                                          ? permission.replace(/_/g, " ")
                                          : permission}
                                      </span>
                                    </label>
                                  )
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowPermissionModal(false)}
                  className="mr-3 px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={savePermissions}
                  className={`px-4 py-2 rounded-md ${
                    selectedUser.role_id
                      ? "bg-blue-500 text-white hover:bg-blue-600"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                  disabled={!selectedUser.role_id}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {showCreateRoleModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Create New Role</h2>
                <button onClick={() => setShowCreateRoleModal(false)}>
                  <X className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleCreateRole}>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Role Name
                    </label>
                    <input
                      type="text"
                      value={newRole.role_name}
                      onChange={(e) =>
                        setNewRole((prev) => ({
                          ...prev,
                          role_name: e.target.value,
                        }))
                      }
                      className="w-full p-2 border rounded-md"
                      required
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-3">
                      Global Permissions
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {availablePermissions.map((permission) => (
                        <label
                          key={
                            typeof permission === "object"
                              ? permission.id
                              : permission
                          }
                          className="flex items-center space-x-2 p-2 bg-gray-50 rounded"
                        >
                          <input
                            type="checkbox"
                            checked={permissionIncluded(
                              newRole.permissions,
                              permission
                            )}
                            onChange={() =>
                              setNewRole((prev) => ({
                                ...prev,
                                permissions: permissionIncluded(
                                  prev.permissions,
                                  permission
                                )
                                  ? prev.permissions.filter(
                                      (p) =>
                                        p !== getPermissionName(permission) &&
                                        (typeof p !== "object" ||
                                          (p as any).id !==
                                            (typeof permission === "object"
                                              ? permission.id
                                              : null))
                                    )
                                  : [
                                      ...prev.permissions,
                                      getPermissionName(permission),
                                    ],
                              }))
                            }
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm capitalize">
                            {typeof permission === "object" &&
                            permission.permission_name
                              ? permission.permission_name.replace(/_/g, " ")
                              : typeof permission === "string"
                              ? permission.replace(/_/g, " ")
                              : String(permission)}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-3">
                      Sector-Specific Permissions
                    </h3>
                    <div className="space-y-4">
                      {mockMines.map((mine) => (
                        <div key={mine.id} className="border rounded-lg p-4">
                          <h4 className="font-medium text-gray-900 mb-3">
                            {mine.name}
                          </h4>
                          <div className="space-y-4">
                            {mine.sectors.map((sector) => (
                              <div
                                key={sector.id}
                                className="bg-gray-50 p-3 rounded"
                              >
                                <h5 className="font-medium text-gray-700 mb-2">
                                  {sector.name}
                                </h5>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                  {availableSectorPermissions.map(
                                    (permission) => (
                                      <label
                                        key={permission}
                                        className="flex items-center space-x-2"
                                      >
                                        <input
                                          type="checkbox"
                                          checked={newRole.permissions.includes(
                                            `${mine.id}_${sector.id}_${permission}`
                                          )}
                                          onChange={() =>
                                            setNewRole((prev) => ({
                                              ...prev,
                                              permissions:
                                                prev.permissions.includes(
                                                  `${mine.id}_${sector.id}_${permission}`
                                                )
                                                  ? prev.permissions.filter(
                                                      (p) =>
                                                        p !==
                                                        `${mine.id}_${sector.id}_${permission}`
                                                    )
                                                  : [
                                                      ...prev.permissions,
                                                      `${mine.id}_${sector.id}_${permission}`,
                                                    ],
                                            }))
                                          }
                                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="text-sm capitalize">
                                          {typeof permission === "string"
                                            ? permission.replace(/_/g, " ")
                                            : permission}
                                        </span>
                                      </label>
                                    )
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setShowCreateRoleModal(false)}
                    className="mr-3 px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                  >
                    Create Role
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showDeleteModal && userToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-red-600">Delete User</h2>
                <button onClick={() => setShowDeleteModal(false)}>
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="bg-red-50 p-4 rounded-md mb-4">
                <div className="flex items-center mb-3">
                  <svg
                    className="w-6 h-6 text-red-500 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  <span className="font-semibold text-red-700">Warning</span>
                </div>
                <p className="text-gray-700 mb-2">
                  You are about to delete the following user:
                </p>
                <div className="bg-white p-3 rounded border border-gray-300 mb-3">
                  <p className="font-semibold">{userToDelete.name}</p>
                  <p className="text-sm text-gray-500">{userToDelete.email}</p>
                  <p className="text-sm text-gray-500">
                    Role: {userToDelete.role}
                  </p>
                </div>
                <p className="text-sm text-gray-600">
                  This action cannot be undone. The user will lose all access to
                  the system and their account will be permanently removed.
                </p>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="mr-3 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteUser}
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
