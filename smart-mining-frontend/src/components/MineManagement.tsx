import React, { useState, useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { mockMines, mockSensorData, mockMiners } from "../data/mockData";
import {
  Plus,
  X,
  Users,
  Activity,
  AlertTriangle,
  Layers,
  ThermometerSun,
  Wind,
  Mountain,
  MapPin,
} from "lucide-react";
import { MineMap } from "./MineMap";
import { Mine, Sector, SensorConfig } from "../types";
import mineService from "../services/mineService";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export function MineManagement() {
  const [mines, setMines] = useState<Mine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedMine, setSelectedMine] = useState<Mine | null>(null);
  const [selectedSector, setSelectedSector] = useState<string>("all");
  const [showAddSectorModal, setShowAddSectorModal] = useState(false);
  const [showAddSensorModal, setShowAddSensorModal] = useState(false);

  const [newMine, setNewMine] = useState({
    name: "",
    location: "",
    status: "active" as "active" | "maintenance" | "emergency",
    areaNumber: "",
    coordinates: {
      lat: "",
      lng: "",
    },
    depth: "",
    description: "",
    sectors: [] as Sector[],
  });

  const [newSector, setNewSector] = useState({
    name: "",
    status: "active" as "active" | "maintenance" | "emergency",
    level: 1,
  });

  const [newSensor, setNewSensor] = useState<{
    type: SensorConfig["type"];
    location: string;
    coordinates: {
      lat: string;
      lng: string;
    };
    specifications: {
      model: string;
      range: string;
      accuracy: string;
      manufacturer: string;
    };
  }>({
    type: "gas",
    location: "",
    coordinates: { lat: "", lng: "" },
    specifications: {
      model: "",
      range: "",
      accuracy: "",
      manufacturer: "",
    },
  });

  useEffect(() => {
    fetchMines();
  }, []);

  const fetchMines = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await mineService.getAllMines();
      setMines(data || []);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch mines";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Error fetching mines:", error);
      setMines([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMine = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (
      !newMine.name ||
      !newMine.location ||
      !newMine.status ||
      !newMine.areaNumber ||
      !newMine.coordinates.lat ||
      !newMine.coordinates.lng ||
      !newMine.depth
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Validate coordinates format
    const lat = parseFloat(newMine.coordinates.lat);
    const lng = parseFloat(newMine.coordinates.lng);
    if (isNaN(lat) || isNaN(lng)) {
      toast.error("Please enter valid coordinates");
      return;
    }

    // Validate depth is a positive number
    const depth = parseFloat(newMine.depth);
    if (isNaN(depth) || depth <= 0) {
      toast.error("Please enter a valid depth");
      return;
    }

    try {
      setLoading(true);
      await mineService.createMine({
        name: newMine.name,
        location: newMine.location,
        status: newMine.status,
        areaNumber: newMine.areaNumber,
        coordinates: {
          lat: parseFloat(newMine.coordinates.lat),
          lng: parseFloat(newMine.coordinates.lng),
        },
        depth: parseFloat(newMine.depth),
        description: newMine.description,
      });

      toast.success("Mine created successfully");
      setShowAddModal(false);
      fetchMines();
      setNewMine({
        name: "",
        location: "",
        status: "active",
        areaNumber: "",
        coordinates: { lat: "", lng: "" },
        depth: "",
        description: "",
        sectors: [],
      });
    } catch (error) {
      toast.error("Failed to create mine");
      console.error("Error creating mine:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSector = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedMine) {
      toast.error("No mine selected");
      return;
    }

    if (!newSector.name || !newSector.status || !newSector.level) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);
      await mineService.createSector(selectedMine.id, {
        name: newSector.name,
        status: newSector.status,
        level: newSector.level,
      });

      toast.success("Sector created successfully");
      setShowAddSectorModal(false);

      // Refresh the selected mine data
      const updatedMine = await mineService.getMine(selectedMine.id);
      setSelectedMine(updatedMine);
      fetchMines();

      setNewSector({
        name: "",
        status: "active",
        level: 1,
      });
    } catch (error) {
      toast.error("Failed to create sector");
      console.error("Error creating sector:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSensor = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedMine || selectedSector === "all") {
      toast.error("Please select a mine and sector");
      return;
    }

    if (
      !newSensor.type ||
      !newSensor.location ||
      !newSensor.coordinates.lat ||
      !newSensor.coordinates.lng ||
      !newSensor.specifications.model ||
      !newSensor.specifications.range ||
      !newSensor.specifications.accuracy ||
      !newSensor.specifications.manufacturer
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);
      await mineService.createSensor(selectedMine.id, selectedSector, {
        type: newSensor.type,
        location: newSensor.location,
        coordinates: {
          lat: parseFloat(newSensor.coordinates.lat),
          lng: parseFloat(newSensor.coordinates.lng),
        },
        specifications: newSensor.specifications,
        status: "active",
      });

      toast.success("Sensor created successfully");
      setShowAddSensorModal(false);

      // Refresh the selected mine data
      const updatedMine = await mineService.getMine(selectedMine.id);
      setSelectedMine(updatedMine);
      fetchMines();

      setNewSensor({
        type: "gas",
        location: "",
        coordinates: { lat: "", lng: "" },
        specifications: {
          model: "",
          range: "",
          accuracy: "",
          manufacturer: "",
        },
      });
    } catch (error) {
      toast.error("Failed to create sensor");
      console.error("Error creating sensor:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleManageClick = async (mine: Mine) => {
    try {
      setLoading(true);
      setError(null);
      // Fetch fresh mine data when opening details
      const freshMineData = await mineService.getMine(mine.id);
      setSelectedMine(freshMineData);
      // Set initial sector selection
      setSelectedSector(
        freshMineData.sectors.length > 0 ? freshMineData.sectors[0].id : "all"
      );
      setShowDetailsModal(true);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch mine details";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Error fetching mine details:", error);
    } finally {
      setLoading(false);
    }
  };

  // Add this helper function to safely render the sectors dropdown
  const renderSectorsDropdown = () => {
    if (!selectedMine) return null;

    return (
      <select
        value={selectedSector}
        onChange={(e) => setSelectedSector(e.target.value)}
        className="px-4 py-2 border rounded-lg bg-white"
      >
        <option value="all">All Sectors</option>
        {selectedMine.sectors.map((sector) => (
          <option key={sector.id} value={sector.id}>
            {sector.name} (Level {sector.level})
          </option>
        ))}
      </select>
    );
  };

  // Add this helper function to safely render the mine details
  const renderMineDetails = () => {
    if (!selectedMine) return null;

    return (
      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Mine Overview</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Status</span>
            <span
              className={`px-3 py-1 rounded-full text-sm ${
                selectedMine.status === "active"
                  ? "bg-green-100 text-green-800"
                  : selectedMine.status === "maintenance"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {selectedMine.status}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Depth</span>
            <span className="font-semibold">{selectedMine.depth}m</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Total Sectors</span>
            <span className="font-semibold">{selectedMine.sectors.length}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Total Sensors</span>
            <span className="font-semibold">
              {selectedMine.sectors.reduce(
                (acc, sector) => acc + (sector.sensors?.length || 0),
                0
              )}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Coordinates</span>
            <span className="font-semibold">
              {selectedMine.coordinates.lat >= 0
                ? `${selectedMine.coordinates.lat.toFixed(4)}°N`
                : `${Math.abs(selectedMine.coordinates.lat).toFixed(4)}°S`}
              ,{" "}
              {selectedMine.coordinates.lng >= 0
                ? `${selectedMine.coordinates.lng.toFixed(4)}°E`
                : `${Math.abs(selectedMine.coordinates.lng).toFixed(4)}°W`}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="ml-64 p-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Mine Management
            </h1>
            <p className="mt-1 text-gray-500">
              Monitor and manage mining operations
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Mining Area
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="text-center text-red-600 p-4">
            <p>{error}</p>
            <button
              onClick={fetchMines}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Retry
            </button>
          </div>
        ) : mines.length === 0 ? (
          <div className="text-center text-gray-500 p-4">
            <p>No mines found. Add your first mine using the button above.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mines.map((mine) => (
              <div
                key={mine.id}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">{mine.name}</h3>
                      <p className="text-gray-500">{mine.location}</p>
                      <p className="text-sm text-gray-400">
                        Area #{mine.areaNumber}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${
                        mine.status === "active"
                          ? "bg-green-100 text-green-800"
                          : mine.status === "maintenance"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {mine.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center mb-2">
                        <Layers className="w-4 h-4 text-purple-500 mr-2" />
                        <span className="text-sm font-medium">Sectors</span>
                      </div>
                      <p className="text-xl font-bold text-purple-700">
                        {mine.sectors.length}
                      </p>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-center mb-2">
                        <Activity className="w-4 h-4 text-blue-500 mr-2" />
                        <span className="text-sm font-medium">Sensors</span>
                      </div>
                      <p className="text-xl font-bold text-blue-700">
                        {mine.sectors.reduce(
                          (acc, sector) => acc + sector.sensors.length,
                          0
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="flex items-center text-gray-600 mb-2">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span>Coordinates</span>
                    </div>
                    <p className="text-sm">
                      {mine.coordinates.lat >= 0
                        ? `${mine.coordinates.lat.toFixed(4)}°N`
                        : `${Math.abs(mine.coordinates.lat).toFixed(4)}°S`}
                      ,{" "}
                      {mine.coordinates.lng >= 0
                        ? `${mine.coordinates.lng.toFixed(4)}°E`
                        : `${Math.abs(mine.coordinates.lng).toFixed(4)}°W`}
                    </p>
                  </div>

                  <button
                    onClick={() => handleManageClick(mine)}
                    className="w-full bg-gray-50 text-gray-700 py-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center"
                  >
                    <Activity className="w-4 h-4 mr-2" />
                    Monitor & Manage
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Mining Area Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-2xl w-full">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Add New Mining Area</h2>
                <button onClick={() => setShowAddModal(false)}>
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleAddMine}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mine Name
                    </label>
                    <input
                      type="text"
                      value={newMine.name}
                      onChange={(e) =>
                        setNewMine((prev) => ({
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
                      Area Number
                    </label>
                    <input
                      type="text"
                      value={newMine.areaNumber}
                      onChange={(e) =>
                        setNewMine((prev) => ({
                          ...prev,
                          areaNumber: e.target.value,
                        }))
                      }
                      className="w-full p-2 border rounded-md"
                      placeholder="e.g., NA-001"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Location
                    </label>
                    <input
                      type="text"
                      value={newMine.location}
                      onChange={(e) =>
                        setNewMine((prev) => ({
                          ...prev,
                          location: e.target.value,
                        }))
                      }
                      className="w-full p-2 border rounded-md"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Depth (meters)
                    </label>
                    <input
                      type="number"
                      value={newMine.depth}
                      onChange={(e) =>
                        setNewMine((prev) => ({
                          ...prev,
                          depth: e.target.value,
                        }))
                      }
                      className="w-full p-2 border rounded-md"
                      placeholder="e.g., 500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Latitude
                    </label>
                    <input
                      type="text"
                      value={newMine.coordinates.lat}
                      onChange={(e) =>
                        setNewMine((prev) => ({
                          ...prev,
                          coordinates: {
                            ...prev.coordinates,
                            lat: e.target.value,
                          },
                        }))
                      }
                      className="w-full p-2 border rounded-md"
                      placeholder="e.g., 51.5074"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Longitude
                    </label>
                    <input
                      type="text"
                      value={newMine.coordinates.lng}
                      onChange={(e) =>
                        setNewMine((prev) => ({
                          ...prev,
                          coordinates: {
                            ...prev.coordinates,
                            lng: e.target.value,
                          },
                        }))
                      }
                      className="w-full p-2 border rounded-md"
                      placeholder="e.g., -0.1278"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={newMine.status}
                      onChange={(e) =>
                        setNewMine((prev) => ({
                          ...prev,
                          status: e.target.value as
                            | "active"
                            | "maintenance"
                            | "emergency",
                        }))
                      }
                      className="w-full p-2 border rounded-md"
                      required
                    >
                      <option value="active">Active</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="emergency">Emergency</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={newMine.description}
                      onChange={(e) =>
                        setNewMine((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      className="w-full p-2 border rounded-md"
                      rows={4}
                    />
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
                    Add Mining Area
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Mine Details Modal */}
        {showDetailsModal && selectedMine && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-7xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-bold">{selectedMine.name}</h2>
                  <p className="text-gray-500">
                    Area #{selectedMine.areaNumber} - {selectedMine.location}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  {renderSectorsDropdown()}
                  <button
                    onClick={() => setShowAddSectorModal(true)}
                    className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 flex items-center"
                    disabled={!selectedMine}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Sector
                  </button>
                  <button onClick={() => setShowDetailsModal(false)}>
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="lg:col-span-2">
                  <div className="bg-white border rounded-lg overflow-hidden mb-6">
                    <MineMap
                      mineId={selectedMine.id}
                      selectedSector={selectedSector}
                    />
                  </div>

                  {/* Sensor Status Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {(() => {
                      // Get sensors from selected sector or all sectors
                      const relevantSensors = selectedMine.sectors
                        .filter(
                          (sector) =>
                            selectedSector === "all" ||
                            sector.id === selectedSector
                        )
                        .flatMap((sector) => sector.sensors);

                      // Group sensors by type and calculate stats
                      const sensorGroups = relevantSensors.reduce(
                        (groups, sensor) => {
                          const key = sensor.type;
                          if (!groups[key]) {
                            groups[key] = {
                              count: 0,
                              status: "normal" as const,
                              type: key,
                              activeCount: 0,
                              maintenanceCount: 0,
                              inactiveCount: 0,
                            };
                          }

                          groups[key].count++;

                          // Update status counters
                          if (sensor.status === "active") {
                            groups[key].activeCount++;
                          } else if (sensor.status === "maintenance") {
                            groups[key].maintenanceCount++;
                            if (groups[key].status === "normal") {
                              groups[key].status = "warning";
                            }
                          } else if (sensor.status === "inactive") {
                            groups[key].inactiveCount++;
                            groups[key].status = "critical";
                          }

                          return groups;
                        },
                        {} as Record<
                          string,
                          {
                            count: number;
                            status: "normal" | "warning" | "critical";
                            type: string;
                            activeCount: number;
                            maintenanceCount: number;
                            inactiveCount: number;
                          }
                        >
                      );

                      // Convert to array and render cards
                      return Object.values(sensorGroups).map((group) => (
                        <div
                          key={group.type}
                          className="bg-white rounded-lg border p-4 shadow-sm"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              {group.type === "gas" && (
                                <Wind className="w-5 h-5 text-blue-500" />
                              )}
                              {group.type === "temperature" && (
                                <ThermometerSun className="w-5 h-5 text-red-500" />
                              )}
                              {group.type === "seismic" && (
                                <Activity className="w-5 h-5 text-purple-500" />
                              )}
                              {group.type === "strain" && (
                                <Mountain className="w-5 h-5 text-green-500" />
                              )}
                              <h3 className="font-medium capitalize">
                                {group.type}
                              </h3>
                            </div>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                group.status === "normal"
                                  ? "bg-green-100 text-green-800"
                                  : group.status === "warning"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {group.status}
                            </span>
                          </div>

                          <div className="mt-3 space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">
                                Total Sensors:
                              </span>
                              <span className="font-medium">{group.count}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Active:</span>
                              <span className="font-medium text-green-600">
                                {group.activeCount}
                              </span>
                            </div>
                            {group.maintenanceCount > 0 && (
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">
                                  In Maintenance:
                                </span>
                                <span className="font-medium text-yellow-600">
                                  {group.maintenanceCount}
                                </span>
                              </div>
                            )}
                            {group.inactiveCount > 0 && (
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Inactive:</span>
                                <span className="font-medium text-red-600">
                                  {group.inactiveCount}
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="mt-3 text-sm text-gray-600">
                            <span className="font-medium">Location: </span>
                            {selectedSector === "all"
                              ? "All Sectors"
                              : selectedMine.sectors.find(
                                  (s) => s.id === selectedSector
                                )?.name || "Unknown"}
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                </div>

                <div className="space-y-6">
                  {renderMineDetails()}
                  <div className="bg-white border rounded-lg p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold">Sensors</h3>
                      <button
                        onClick={() => setShowAddSensorModal(true)}
                        className="text-blue-500 hover:text-blue-600 flex items-center"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add Sensor
                      </button>
                    </div>
                    <div className="space-y-4">
                      {selectedMine.sectors
                        .filter(
                          (sector) =>
                            selectedSector === "all" ||
                            sector.id === selectedSector
                        )
                        .map((sector) => (
                          <div
                            key={sector.id}
                            className="border-b pb-4 last:border-b-0 last:pb-0"
                          >
                            <h4 className="font-medium mb-2">
                              {sector.name} (Level {sector.level})
                            </h4>
                            <div className="space-y-2">
                              {sector.sensors.map((sensor) => (
                                <div
                                  key={sensor.id}
                                  className="flex items-center justify-between"
                                >
                                  <div className="flex items-center">
                                    {sensor.type === "gas" && (
                                      <Wind className="w-4 h-4 text-blue-500 mr-2" />
                                    )}
                                    {sensor.type === "temperature" && (
                                      <ThermometerSun className="w-4 h-4 text-orange-500 mr-2" />
                                    )}
                                    {sensor.type === "seismic" && (
                                      <Activity className="w-4 h-4 text-purple-500 mr-2" />
                                    )}
                                    <span className="capitalize">
                                      {sensor.type}
                                    </span>
                                  </div>
                                  <span
                                    className={`px-2 py-1 rounded-full text-xs ${
                                      sensor.status === "active"
                                        ? "bg-green-100 text-green-800"
                                        : "bg-yellow-100 text-yellow-800"
                                    }`}
                                  >
                                    {sensor.status}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Sector Modal */}
        {showAddSectorModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-xl w-full">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Add New Sector</h2>
                <button onClick={() => setShowAddSectorModal(false)}>
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleAddSector}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sector Name
                    </label>
                    <input
                      type="text"
                      value={newSector.name}
                      onChange={(e) =>
                        setNewSector((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      className="w-full p-2 border rounded-md"
                      placeholder="e.g., Sector A"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={newSector.status}
                      onChange={(e) =>
                        setNewSector((prev) => ({
                          ...prev,
                          status: e.target.value as
                            | "active"
                            | "maintenance"
                            | "emergency",
                        }))
                      }
                      className="w-full p-2 border rounded-md"
                      required
                    >
                      <option value="active">Active</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="emergency">Emergency</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Level
                    </label>
                    <input
                      type="number"
                      value={newSector.level}
                      onChange={(e) =>
                        setNewSector((prev) => ({
                          ...prev,
                          level: parseInt(e.target.value),
                        }))
                      }
                      className="w-full p-2 border rounded-md"
                      required
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setShowAddSectorModal(false)}
                    className="mr-3 px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600"
                  >
                    Add Sector
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Sensor Modal */}
        {showAddSensorModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-2xl w-full">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Add New Sensor</h2>
                <button onClick={() => setShowAddSensorModal(false)}>
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleAddSensor}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sensor Type
                    </label>
                    <select
                      value={newSensor.type}
                      onChange={(e) =>
                        setNewSensor((prev) => ({
                          ...prev,
                          type: e.target.value as SensorConfig["type"],
                        }))
                      }
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="gas">Gas</option>
                      <option value="temperature">Temperature</option>
                      <option value="seismic">Seismic</option>
                      <option value="strain">Structural Strain</option>
                      <option value="geological">Geological</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Location
                    </label>
                    <input
                      type="text"
                      value={newSensor.location}
                      onChange={(e) =>
                        setNewSensor((prev) => ({
                          ...prev,
                          location: e.target.value,
                        }))
                      }
                      className="w-full p-2 border rounded-md"
                      placeholder="e.g., Main Shaft"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Latitude
                    </label>
                    <input
                      type="text"
                      value={newSensor.coordinates.lat}
                      onChange={(e) =>
                        setNewSensor((prev) => ({
                          ...prev,
                          coordinates: {
                            ...prev.coordinates,
                            lat: e.target.value,
                          },
                        }))
                      }
                      className="w-full p-2 border rounded-md"
                      placeholder="e.g., 51.5074"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Longitude
                    </label>
                    <input
                      type="text"
                      value={newSensor.coordinates.lng}
                      onChange={(e) =>
                        setNewSensor((prev) => ({
                          ...prev,
                          coordinates: {
                            ...prev.coordinates,
                            lng: e.target.value,
                          },
                        }))
                      }
                      className="w-full p-2 border rounded-md"
                      placeholder="e.g., -0.1278"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Model
                    </label>
                    <input
                      type="text"
                      value={newSensor.specifications.model}
                      onChange={(e) =>
                        setNewSensor((prev) => ({
                          ...prev,
                          specifications: {
                            ...prev.specifications,
                            model: e.target.value,
                          },
                        }))
                      }
                      className="w-full p-2 border rounded-md"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Range
                    </label>
                    <input
                      type="text"
                      value={newSensor.specifications.range}
                      onChange={(e) =>
                        setNewSensor((prev) => ({
                          ...prev,
                          specifications: {
                            ...prev.specifications,
                            range: e.target.value,
                          },
                        }))
                      }
                      className="w-full p-2 border rounded-md"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Accuracy
                    </label>
                    <input
                      type="text"
                      value={newSensor.specifications.accuracy}
                      onChange={(e) =>
                        setNewSensor((prev) => ({
                          ...prev,
                          specifications: {
                            ...prev.specifications,
                            accuracy: e.target.value,
                          },
                        }))
                      }
                      className="w-full p-2 border rounded-md"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Manufacturer
                    </label>
                    <input
                      type="text"
                      value={newSensor.specifications.manufacturer}
                      onChange={(e) =>
                        setNewSensor((prev) => ({
                          ...prev,
                          specifications: {
                            ...prev.specifications,
                            manufacturer: e.target.value,
                          },
                        }))
                      }
                      className="w-full p-2 border rounded-md"
                      required
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setShowAddSensorModal(false)}
                    className="mr-3 px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  >
                    Add Sensor
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
