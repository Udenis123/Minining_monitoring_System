import React, { useState } from "react";
import { Sidebar } from "./Sidebar";
import { useAuthStore } from "../store/authStore";
import { mockSensorData } from "../data/mockData";
import { Plus, Settings, X } from "lucide-react";
import { SensorData as SensorDataType } from "../types";

export function SensorData() {
  const user = useAuthStore((state) => state.user);
  const userMineId = user?.mineId;
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedSensor, setSelectedSensor] = useState<SensorDataType | null>(
    null
  );
  const [thresholds, setThresholds] = useState({
    gas: { warning: 30, critical: 50 },
    temperature: { warning: 30, critical: 40 },
    geological: { warning: 0.5, critical: 0.8 },
  });

  // Filter sensor data based on user's mine assignment
  const sensorData = userMineId
    ? mockSensorData[userMineId]
    : Object.values(mockSensorData).flat();

  const handleThresholdChange = (
    sensorType: "gas" | "temperature" | "geological",
    level: "warning" | "critical",
    value: number
  ) => {
    setThresholds((prev) => ({
      ...prev,
      [sensorType]: {
        ...prev[sensorType],
        [level]: value,
      },
    }));
  };

  const [newSensor, setNewSensor] = useState({
    type: "gas" as "gas" | "temperature" | "geological",
    location: "",
    mineId: userMineId || "",
  });

  const handleAddSensor = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would make an API call
    console.log("New sensor:", newSensor);
    setShowAddModal(false);
    setNewSensor({
      type: "gas",
      location: "",
      mineId: userMineId || "",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="ml-64 p-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Sensor Data</h1>
            <p className="mt-1 text-gray-500">
              Real-time sensor readings and analytics
            </p>
          </div>
          {user?.role === "admin" && (
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfigModal(true)}
                className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-200 flex items-center"
              >
                <Settings className="w-4 h-4 mr-2" />
                Configure Thresholds
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Sensor
              </button>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <table className="min-w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Sensor ID</th>
                  <th className="text-left py-3 px-4">Type</th>
                  <th className="text-left py-3 px-4">Value</th>
                  <th className="text-left py-3 px-4">Location</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Last Updated</th>
                  {user?.role === "admin" && (
                    <th className="text-left py-3 px-4">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {sensorData.map((sensor) => (
                  <tr key={sensor.id} className="border-b">
                    <td className="py-3 px-4">{sensor.id}</td>
                    <td className="py-3 px-4 capitalize">{sensor.type}</td>
                    <td className="py-3 px-4">
                      {sensor.value} {sensor.unit}
                    </td>
                    <td className="py-3 px-4">{sensor.location}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-sm ${
                          sensor.status === "normal"
                            ? "bg-green-100 text-green-800"
                            : sensor.status === "warning"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {sensor.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {sensor.timestamp.toLocaleString()}
                    </td>
                    {user?.role === "admin" && (
                      <td className="py-3 px-4">
                        <button
                          onClick={() => setSelectedSensor(sensor)}
                          className="text-blue-500 hover:text-blue-700 mr-2"
                        >
                          Configure
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Threshold Configuration Modal */}
        {showConfigModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-8 max-w-2xl w-full">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Sensor Thresholds</h2>
                <button onClick={() => setShowConfigModal(false)}>
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {Object.entries(thresholds).map(([type, levels]) => (
                  <div key={type} className="border-b pb-4">
                    <h3 className="text-lg font-semibold capitalize mb-3">
                      {type} Sensors
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Warning Threshold
                        </label>
                        <input
                          type="number"
                          value={levels.warning}
                          onChange={(e) =>
                            handleThresholdChange(
                              type as keyof typeof thresholds,
                              "warning",
                              parseFloat(e.target.value)
                            )
                          }
                          className="w-full p-2 border rounded-md"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Critical Threshold
                        </label>
                        <input
                          type="number"
                          value={levels.critical}
                          onChange={(e) =>
                            handleThresholdChange(
                              type as keyof typeof thresholds,
                              "critical",
                              parseFloat(e.target.value)
                            )
                          }
                          className="w-full p-2 border rounded-md"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowConfigModal(false)}
                  className="mr-3 px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    console.log("Saving thresholds:", thresholds);
                    setShowConfigModal(false);
                  }}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Sensor Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-8 max-w-2xl w-full">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Add New Sensor</h2>
                <button onClick={() => setShowAddModal(false)}>
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleAddSensor}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sensor Type
                    </label>
                    <select
                      value={newSensor.type}
                      onChange={(e) =>
                        setNewSensor((prev) => ({
                          ...prev,
                          type: e.target.value as
                            | "gas"
                            | "geological"
                            | "temperature",
                        }))
                      }
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="gas">Gas</option>
                      <option value="temperature">Temperature</option>
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
                      placeholder="e.g., Level 1, Section A"
                      required
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
