import React, { useState } from "react";
import { Sidebar } from "./Sidebar";
import { useAuthStore } from "../store/authStore";
import { mockUsers, mockMines } from "../data/mockData";
import { User, Permission, SectorPermission } from "../types";
import { Plus, X, ChevronDown, ChevronUp } from "lucide-react";

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

  const [newUser, setNewUser] = useState({
    email: "",
    name: "",
    role: "miner",
    mineId: "",
    password: "",
    permissions: [] as Permission[],
    sectorAccess: [] as {
      mineId: string;
      sectorId: string;
      permissions: SectorPermission[];
    }[],
  });

  const [newRole, setNewRole] = useState<{
    name: string;
    permissions: (Permission | `${string}_${string}_${SectorPermission}`)[];
  }>({
    name: "",
    permissions: [],
  });

  const availablePermissions: Permission[] = [
    "view_all_mines",
    "manage_users",
    "view_reports",
    "view_sensors",
    "view_predective_data",
  ];

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUser) {
      // Update user logic here
      console.log("Updated user:", newUser);
    } else {
      // Add user logic here
      console.log("New user:", newUser);
    }
    setShowAddModal(false);
    setNewUser({
      email: "",
      name: "",
      role: "miner",
      mineId: "",
      password: "",
      permissions: [],
      sectorAccess: [],
    });
    setSelectedUser(null);
  };

  const toggleUserExpand = (userId: string) => {
    setExpandedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleCreateRole = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("New role:", newRole);
    setShowCreateRoleModal(false);
    setNewRole({
      name: "",
      permissions: [],
    });
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

  // Define handleRefresh before it's used
  const handleRefresh = () => {
    // Logic to refresh the logs
    console.log("Refreshing logs...");
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
                {mockUsers.map((user) => (
                  <React.Fragment key={user.id}>
                    <tr className="border-b">
                      <td className="py-3 px-4">{user.name}</td>
                      <td className="py-3 px-4">{user.email}</td>
                      <td className="py-3 px-4 capitalize">{user.role}</td>
                      <td className="py-3 px-4">
                        {user.mineId || "All Mines"}
                      </td>
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
                              setSelectedUser(user);
                              setShowPermissionModal(true);
                            }}
                            className="text-blue-500 hover:text-blue-700"
                          >
                            Manage Permissions
                          </button>
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setShowAddModal(true);
                            }}
                            className="text-green-500 hover:text-green-700"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              console.log("Delete user:", user.id);
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
                                {user.permissions.map((permission) => (
                                  <span
                                    key={permission}
                                    className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                                  >
                                    {permission.replace(/_/g, " ")}
                                  </span>
                                ))}
                              </div>
                            </div>
                            {user.sectorAccess.length > 0 && (
                              <div>
                                <h4 className="font-medium text-gray-900 mb-2">
                                  Sector Access
                                </h4>
                                <div className="space-y-2">
                                  {user.sectorAccess.map((access, index) => (
                                    <div
                                      key={index}
                                      className="bg-white p-3 rounded border"
                                    >
                                      <div className="font-medium text-gray-700 mb-1">
                                        {
                                          mockMines.find(
                                            (m) => m.id === access.mineId
                                          )?.name
                                        }{" "}
                                        -
                                        {
                                          mockMines
                                            .find((m) => m.id === access.mineId)
                                            ?.sectors.find(
                                              (s) => s.id === access.sectorId
                                            )?.name
                                        }
                                      </div>
                                      <div className="flex flex-wrap gap-2">
                                        {access.permissions.map(
                                          (permission) => (
                                            <span
                                              key={permission}
                                              className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                                            >
                                              {permission.replace(/_/g, " ")}
                                            </span>
                                          )
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>

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
                        value={newUser.role}
                        onChange={(e) =>
                          setNewUser((prev) => ({
                            ...prev,
                            role: e.target.value as User["role"],
                          }))
                        }
                        className="w-full p-2 border rounded-md"
                      >
                        <option value="miner">Miner</option>
                        <option value="supervisor">Supervisor</option>
                        <option value="analyst">Analyst</option>
                        <option value="admin">Admin</option>
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
                        required
                      />
                    </div>
                  </div>
                </div>

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
                  <h2 className="text-xl font-bold">Manage Permissions</h2>
                  <p className="text-gray-500">{selectedUser.name}</p>
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
                        key={permission}
                        className="flex items-center space-x-2 p-2 bg-gray-50 rounded"
                      >
                        <input
                          type="checkbox"
                          checked={selectedUser.permissions.includes(
                            permission
                          )}
                          onChange={() => {
                            // Update permissions logic here
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm capitalize">
                          {permission.replace(/_/g, " ")}
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
                                        checked={selectedUser.sectorAccess.some(
                                          (access) =>
                                            access.mineId === mine.id &&
                                            access.sectorId === sector.id &&
                                            access.permissions.includes(
                                              permission
                                            )
                                        )}
                                        onChange={() => {
                                          // Update sector permissions logic here
                                        }}
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                      />
                                      <span className="text-sm capitalize">
                                        {permission.replace(/_/g, " ")}
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
                  onClick={() => {
                    // Save permissions logic here
                    setShowPermissionModal(false);
                  }}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
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
                      value={newRole.name}
                      onChange={(e) =>
                        setNewRole((prev) => ({
                          ...prev,
                          name: e.target.value,
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
                          key={permission}
                          className="flex items-center space-x-2 p-2 bg-gray-50 rounded"
                        >
                          <input
                            type="checkbox"
                            checked={newRole.permissions.includes(permission)}
                            onChange={() =>
                              setNewRole((prev) => ({
                                ...prev,
                                permissions: prev.permissions.includes(
                                  permission
                                )
                                  ? prev.permissions.filter(
                                      (p) => p !== permission
                                    )
                                  : [...prev.permissions, permission],
                              }))
                            }
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm capitalize">
                            {permission.replace(/_/g, " ")}
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
                                          {permission.replace(/_/g, " ")}
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

        {showUserLogsModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">User Logs</h2>
                <button onClick={() => setShowUserLogsModal(false)}>
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div>
                {/* Search and Filter Controls */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      placeholder="Search logs..."
                      className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={searchTerm}
                      onChange={handleSearch}
                    />
                  </div>

                  <div className="sm:w-48">
                    <div className="relative">
                      <select
                        className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                        value={filterAction}
                        onChange={handleFilterChange}
                      >
                        <option value="">All Actions</option>
                        <option value="CREATE_USER">Create User</option>
                        <option value="UPDATE_PERMISSIONS">
                          Update Permissions
                        </option>
                        <option value="DELETE_USER">Delete User</option>
                        <option value="VIEW_REPORTS">View Reports</option>
                        <option value="MANAGE_SECTOR">Manage Sector</option>
                      </select>
                    </div>
                  </div>

                  <button
                    onClick={handleRefresh}
                    className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  >
                    Refresh
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
