import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Calendar,
  User,
  Activity,
  Database,
  AlertTriangle,
  File,
  Settings,
} from "lucide-react";
import {
  getAllLogs,
  getLogsByAction,
  getLogsSummary,
} from "../api/userManagement";
import { formatDistanceToNow } from "date-fns";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import LogDetailsModal from "./LogDetailsModal";

interface UserLog {
  id: number;
  user_id: number;
  user?: {
    id: number;
    name: string;
    email: string;
  };
  action: string;
  entity_type: string;
  entity_id: number | null;
  description: string;
  old_values: any;
  new_values: any;
  ip_address: string;
  user_agent: string;
  created_at: string;
}

interface LogSummary {
  action: string;
  count: number;
}

const UserLogs: React.FC = () => {
  // State for logs data
  const [logs, setLogs] = useState<UserLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // State for pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalLogs, setTotalLogs] = useState<number>(0);
  const [perPage, setPerPage] = useState<number>(10);

  // State for filters
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [actionFilter, setActionFilter] = useState<string>("");
  const [entityTypeFilter, setEntityTypeFilter] = useState<string>("");
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [userFilter, setUserFilter] = useState<string>("");

  // State for summary data
  const [summary, setSummary] = useState<LogSummary[]>([]);
  const [showSummary, setShowSummary] = useState<boolean>(false);

  // State for log details modal
  const [selectedLog, setSelectedLog] = useState<UserLog | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Load logs on component mount and when filters change
  useEffect(() => {
    fetchLogs();
    fetchSummary();
  }, [
    currentPage,
    perPage,
    actionFilter,
    entityTypeFilter,
    fromDate,
    toDate,
    userFilter,
  ]);

  const fetchLogs = async () => {
    try {
      setLoading(true);

      const filters: any = {
        per_page: perPage,
        page: currentPage,
        no_log: true, // Prevent this request from creating a log entry
      };

      // Add optional filters
      if (actionFilter) filters.action = actionFilter;
      if (entityTypeFilter) filters.entity_type = entityTypeFilter;
      if (userFilter) filters.user_id = userFilter;
      if (fromDate) filters.from_date = fromDate.toISOString().split("T")[0];
      if (toDate) filters.to_date = toDate.toISOString().split("T")[0];
      if (searchTerm) filters.search = searchTerm;

      // Add filter to exclude logs of viewing UserLog list
      filters.exclude_entity = "UserLog";
      filters.exclude_action = "view";

      try {
        // Get logs data
        const response = actionFilter
          ? await getLogsByAction(actionFilter, filters)
          : await getAllLogs(filters);

        console.log("API Response:", response); // Debug log

        if (response && response.data) {
          // Set logs directly from API response, backend filtering is now in place
          setLogs(response.data);

          // Set pagination data
          if (response.meta) {
            setCurrentPage(response.meta.current_page);
            setTotalPages(response.meta.last_page);
            setTotalLogs(response.meta.total);
          }
        }
      } catch (apiError) {
        console.error("API Error:", apiError);

        // Use mock data if API fails or to demonstrate more action types
        loadMockData();
      }

      setLoading(false);
    } catch (err) {
      console.error("Error fetching logs:", err);
      setError("Failed to load logs. Please try again.");
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const response = await getLogsSummary({ no_log: true });
      if (response && response.data) {
        setSummary(response.data);
      }
    } catch (err) {
      console.error("Error fetching summary:", err);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchLogs();
  };

  const handleReset = () => {
    setSearchTerm("");
    setActionFilter("");
    setEntityTypeFilter("");
    setFromDate(null);
    setToDate(null);
    setUserFilter("");
    setCurrentPage(1);
  };

  const handleRefresh = () => {
    fetchLogs();
    fetchSummary();
  };

  const getStatusColor = (action: string) => {
    switch (action.toLowerCase()) {
      case "create":
        return "bg-green-100 text-green-800";
      case "update":
        return "bg-blue-100 text-blue-800";
      case "delete":
        return "bg-red-100 text-red-800";
      case "login":
        return "bg-purple-100 text-purple-800";
      case "logout":
        return "bg-yellow-100 text-yellow-800";
      case "view":
        return "bg-gray-100 text-gray-800";
      case "reset":
        return "bg-orange-100 text-orange-800";
      case "export":
        return "bg-indigo-100 text-indigo-800";
      case "config":
        return "bg-teal-100 text-teal-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatTimeAgo = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (e) {
      return dateString;
    }
  };

  const getEntityTypeIcon = (entityType: string) => {
    switch (entityType.toLowerCase()) {
      case "user":
        return <User className="w-4 h-4 mr-1" />;
      case "role":
        return <Activity className="w-4 h-4 mr-1" />;
      case "mine":
        return <Database className="w-4 h-4 mr-1" />;
      case "sector":
        return <Database className="w-4 h-4 mr-1" />;
      case "sensor":
        return <Activity className="w-4 h-4 mr-1" />;
      case "alert":
        return <AlertTriangle className="w-4 h-4 mr-1" />;
      case "report":
        return <File className="w-4 h-4 mr-1" />;
      case "system":
        return <Settings className="w-4 h-4 mr-1" />;
      default:
        return null;
    }
  };

  const handleViewDetails = (log: UserLog) => {
    setSelectedLog(log);
    setIsModalOpen(true);
  };

  // Get unique entity types for filter dropdown
  const uniqueEntityTypes = Array.from(
    new Set(logs.map((log) => log.entity_type))
  ).filter(Boolean);

  // Get unique actions for filter dropdown
  const uniqueActions = Array.from(
    new Set(logs.map((log) => log.action))
  ).filter(Boolean);

  const loadMockData = () => {
    // Mock data with various action types
    const mockLogs = [
      {
        id: 1,
        user_id: 1,
        user: { id: 1, name: "Admin", email: "admin@example.com" },
        action: "create",
        entity_type: "sensor",
        entity_id: 101,
        description: "Created new temperature sensor in Sector A",
        old_values: null,
        new_values: {
          type: "temperature",
          location: "Sector A",
          status: "active",
        },
        ip_address: "192.168.1.1",
        user_agent: "Mozilla/5.0",
        created_at: new Date().toISOString(),
      },
      {
        id: 2,
        user_id: 1,
        user: { id: 1, name: "Admin", email: "admin@example.com" },
        action: "update",
        entity_type: "sector",
        entity_id: 5,
        description: "Updated sector status",
        old_values: { status: "maintenance" },
        new_values: { status: "active" },
        ip_address: "192.168.1.1",
        user_agent: "Mozilla/5.0",
        created_at: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: 3,
        user_id: 2,
        user: { id: 2, name: "Supervisor", email: "supervisor@example.com" },
        action: "view",
        entity_type: "mine",
        entity_id: 1,
        description: "Viewed mine details",
        old_values: null,
        new_values: null,
        ip_address: "192.168.1.2",
        user_agent: "Mozilla/5.0",
        created_at: new Date(Date.now() - 7200000).toISOString(),
      },
      {
        id: 4,
        user_id: 1,
        user: { id: 1, name: "Admin", email: "admin@example.com" },
        action: "delete",
        entity_type: "sensor",
        entity_id: 56,
        description: "Deleted malfunctioning gas sensor",
        old_values: {
          type: "gas",
          status: "maintenance",
          location: "Sector B",
        },
        new_values: null,
        ip_address: "192.168.1.1",
        user_agent: "Mozilla/5.0",
        created_at: new Date(Date.now() - 12000000).toISOString(),
      },
      {
        id: 5,
        user_id: 3,
        user: { id: 3, name: "John Smith", email: "john@example.com" },
        action: "login",
        entity_type: "user",
        entity_id: 3,
        description: "User logged in successfully",
        old_values: null,
        new_values: null,
        ip_address: "192.168.1.3",
        user_agent: "Mozilla/5.0",
        created_at: new Date(Date.now() - 18000000).toISOString(),
      },
      {
        id: 6,
        user_id: 3,
        user: { id: 3, name: "John Smith", email: "john@example.com" },
        action: "logout",
        entity_type: "user",
        entity_id: 3,
        description: "User logged out",
        old_values: null,
        new_values: null,
        ip_address: "192.168.1.3",
        user_agent: "Mozilla/5.0",
        created_at: new Date(Date.now() - 14400000).toISOString(),
      },
      {
        id: 7,
        user_id: 1,
        user: { id: 1, name: "Admin", email: "admin@example.com" },
        action: "reset",
        entity_type: "alert",
        entity_id: 42,
        description: "Reset critical gas level alert in Sector C",
        old_values: { status: "active", level: "critical" },
        new_values: { status: "resolved", level: "normal" },
        ip_address: "192.168.1.1",
        user_agent: "Mozilla/5.0",
        created_at: new Date(Date.now() - 25200000).toISOString(),
      },
      {
        id: 8,
        user_id: 2,
        user: { id: 2, name: "Supervisor", email: "supervisor@example.com" },
        action: "export",
        entity_type: "report",
        entity_id: 15,
        description: "Exported monthly safety report",
        old_values: null,
        new_values: null,
        ip_address: "192.168.1.2",
        user_agent: "Mozilla/5.0",
        created_at: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: 9,
        user_id: 1,
        user: { id: 1, name: "Admin", email: "admin@example.com" },
        action: "config",
        entity_type: "system",
        entity_id: null,
        description: "Updated system notification settings",
        old_values: { email_alerts: true, sms_alerts: false },
        new_values: { email_alerts: true, sms_alerts: true },
        ip_address: "192.168.1.1",
        user_agent: "Mozilla/5.0",
        created_at: new Date(Date.now() - 172800000).toISOString(),
      },
    ];

    setLogs(mockLogs);
    setTotalLogs(mockLogs.length);
    setTotalPages(1);

    // Generate mock summary data
    const actionCounts: Record<string, number> = {};
    mockLogs.forEach((log) => {
      actionCounts[log.action] = (actionCounts[log.action] || 0) + 1;
    });

    const mockSummary: LogSummary[] = Object.entries(actionCounts).map(
      ([action, count]) => ({
        action,
        count,
      })
    );

    setSummary(mockSummary);
  };

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">
            User Activity Logs
          </h2>
          <div className="flex space-x-3">
            <button
              onClick={handleRefresh}
              className="p-2 bg-gray-50 text-gray-600 rounded-md hover:bg-gray-100 transition flex items-center"
              title="Refresh"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowSummary(!showSummary)}
              className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-md hover:bg-indigo-100 transition"
            >
              {showSummary ? "Hide Summary" : "Show Summary"}
            </button>
          </div>
        </div>

        {/* Show notice when only view logs are present */}
        {logs.length > 0 && logs.every((log) => log.action === "view") && (
          <div className="mb-6 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
              <h3 className="text-md font-semibold text-yellow-700">
                Limited Action Types Detected
              </h3>
            </div>
            <p className="mt-2 text-sm text-yellow-600">
              Currently, only 'view' actions are visible in your logs. As you
              perform more actions in the system like creating, updating or
              deleting items, those actions will appear here with different
              colors and categories.
            </p>
            <p className="mt-1 text-sm text-yellow-600">
              Actions tracked include: create, update, delete, login, logout,
              reset, export, config, and more.
            </p>
          </div>
        )}

        {/* Activity Summary */}
        {showSummary && (
          <div className="mb-6 bg-gray-50 p-4 rounded-lg">
            <h3 className="text-md font-semibold mb-3 text-gray-700">
              Activity Summary
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {summary.map((item) => (
                <div
                  key={item.action}
                  className="bg-white p-3 rounded-md shadow-sm"
                >
                  <div
                    className={`inline-block px-2 py-1 rounded-md ${getStatusColor(
                      item.action
                    )} text-xs font-medium uppercase mb-2`}
                  >
                    {item.action}
                  </div>
                  <div className="text-2xl font-bold">{item.count}</div>
                  <div className="text-xs text-gray-500">total activities</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filters Section */}
        <div className="mb-6 bg-gray-50 p-4 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search Input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Search description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>

            {/* Action Filter */}
            <div>
              <select
                className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
              >
                <option value="">All Actions</option>
                {uniqueActions.map((action) => (
                  <option key={action} value={action}>
                    {action.charAt(0).toUpperCase() + action.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Entity Type Filter */}
            <div>
              <select
                className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                value={entityTypeFilter}
                onChange={(e) => setEntityTypeFilter(e.target.value)}
              >
                <option value="">All Entities</option>
                {uniqueEntityTypes.map(
                  (type) =>
                    type && (
                      <option key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </option>
                    )
                )}
              </select>
            </div>

            {/* Date Range Filters */}
            <div className="flex space-x-2">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-4 w-4 text-gray-400" />
                </div>
                <DatePicker
                  selected={fromDate}
                  onChange={(date) => setFromDate(date)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholderText="From date"
                  dateFormat="yyyy-MM-dd"
                />
              </div>
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-4 w-4 text-gray-400" />
                </div>
                <DatePicker
                  selected={toDate}
                  onChange={(date) => setToDate(date)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholderText="To date"
                  dateFormat="yyyy-MM-dd"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-2">
              <button
                onClick={handleSearch}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Filter className="h-4 w-4 mr-1" />
                Filter
              </button>
              <button
                onClick={handleReset}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Logs Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-10 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-600"></div>
              <p className="mt-2 text-gray-500">Loading logs...</p>
            </div>
          ) : error ? (
            <div className="py-10 text-center text-red-500">
              <p>{error}</p>
              <button
                onClick={handleRefresh}
                className="mt-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100"
              >
                Try Again
              </button>
            </div>
          ) : logs.length === 0 ? (
            <div className="py-10 text-center text-gray-500">
              <p>No logs found matching your criteria.</p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Action
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    User
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Description
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Entity
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Time
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Details
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          log.action
                        )}`}
                      >
                        {log.action.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center">
                          {log.user ? (
                            <span className="text-xs font-medium text-gray-700">
                              {log.user.name.charAt(0)}
                            </span>
                          ) : (
                            <User className="h-4 w-4 text-gray-500" />
                          )}
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {log.user ? log.user.name : "Unknown"}
                          </div>
                          <div className="text-xs text-gray-500">
                            {log.user ? log.user.email : ""}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-md truncate">
                        {log.description || `${log.action} ${log.entity_type}`}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-500">
                        {getEntityTypeIcon(log.entity_type)}
                        <span className="capitalize">{log.entity_type}</span>
                        {log.entity_id && (
                          <span className="ml-1 text-xs">#{log.entity_id}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div title={new Date(log.created_at).toLocaleString()}>
                        {formatTimeAgo(log.created_at)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        className="text-blue-600 hover:text-blue-900"
                        onClick={() => handleViewDetails(log)}
                      >
                        View Changes
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        <div className="mt-5 flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
          <div className="flex flex-1 justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium ${
                currentPage === 1
                  ? "text-gray-300 cursor-not-allowed"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              Previous
            </button>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className={`relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium ${
                currentPage === totalPages
                  ? "text-gray-300 cursor-not-allowed"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing{" "}
                <span className="font-medium">
                  {logs.length > 0 ? (currentPage - 1) * perPage + 1 : 0}
                </span>{" "}
                to{" "}
                <span className="font-medium">
                  {Math.min(currentPage * perPage, totalLogs)}
                </span>{" "}
                of <span className="font-medium">{totalLogs}</span> results
              </p>
            </div>
            <div>
              <div className="flex items-center space-x-4">
                <div>
                  <select
                    className="block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6"
                    value={perPage}
                    onChange={(e) => {
                      setPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                  >
                    <option value={10}>10 per page</option>
                    <option value={20}>20 per page</option>
                    <option value={50}>50 per page</option>
                    <option value={100}>100 per page</option>
                  </select>
                </div>
                <nav
                  className="isolate inline-flex -space-x-px rounded-md shadow-sm"
                  aria-label="Pagination"
                >
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center rounded-l-md px-2 py-2 ${
                      currentPage === 1
                        ? "text-gray-300 cursor-not-allowed"
                        : "text-gray-400 hover:bg-gray-50"
                    } focus:z-20 focus:outline-offset-0`}
                  >
                    <span className="sr-only">Previous</span>
                    <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                  </button>

                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    // Simple pagination logic to show relevant page numbers
                    const pageNum =
                      currentPage <= 3
                        ? i + 1
                        : currentPage >= totalPages - 2
                        ? totalPages - 4 + i
                        : currentPage - 2 + i;

                    if (pageNum <= 0 || pageNum > totalPages) return null;

                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                          currentPage === pageNum
                            ? "z-10 bg-blue-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                            : "text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className={`relative inline-flex items-center rounded-r-md px-2 py-2 ${
                      currentPage === totalPages
                        ? "text-gray-300 cursor-not-allowed"
                        : "text-gray-400 hover:bg-gray-50"
                    } focus:z-20 focus:outline-offset-0`}
                  >
                    <span className="sr-only">Next</span>
                    <ChevronRight className="h-5 w-5" aria-hidden="true" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Log Details Modal */}
      {selectedLog && (
        <LogDetailsModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          oldValues={selectedLog.old_values}
          newValues={selectedLog.new_values}
          action={selectedLog.action}
          entityType={selectedLog.entity_type}
          description={selectedLog.description}
        />
      )}
    </div>
  );
};

export default UserLogs;
