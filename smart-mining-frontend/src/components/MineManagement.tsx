import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { mockMines, mockSensorData, mockMiners } from '../data/mockData';
import { Plus, X, Users, Activity, AlertTriangle, Layers, ThermometerSun, Wind, Mountain, MapPin } from 'lucide-react';
import { MineMap } from './MineMap';
import { Mine, Sector, SensorConfig } from '../types';

export function MineManagement() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedMine, setSelectedMine] = useState<Mine | null>(null);
  const [selectedSector, setSelectedSector] = useState<string>('all');
  const [showAddSectorModal, setShowAddSectorModal] = useState(false);
  const [showAddSensorModal, setShowAddSensorModal] = useState(false);

  const [newMine, setNewMine] = useState({
    name: '',
    location: '',
    status: 'active' as 'active' | 'maintenance' | 'emergency',
    areaNumber: '',
    coordinates: {
      lat: '',
      lng: ''
    },
    depth: '',
    description: '',
    sectors: [] as Sector[]
  });

  const [newSector, setNewSector] = useState({
    name: '',
    status: 'active' as 'active' | 'maintenance' | 'emergency',
    sensors: [] as SensorConfig[],
    id: ''
  });

  const [newSensor, setNewSensor] = useState({
    type: 'gas' as const,
    location: '',
    coordinates: {
      lat: '',
      lng: ''
    },
    specifications: {
      model: '',
      range: '',
      accuracy: '',
      manufacturer: ''
    }
  });

  const handleAddMine = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!newMine.name || !newMine.location || !newMine.status || 
        !newMine.areaNumber || !newMine.coordinates.lat || 
        !newMine.coordinates.lng || !newMine.depth) {
      alert('Please fill in all required fields');
      return;
    }

    // Validate coordinates format
    const lat = parseFloat(newMine.coordinates.lat);
    const lng = parseFloat(newMine.coordinates.lng);
    if (isNaN(lat) || isNaN(lng)) {
      alert('Please enter valid coordinates');
      return;
    }

    // Validate depth is a positive number
    const depth = parseFloat(newMine.depth);
    if (isNaN(depth) || depth <= 0) {
      alert('Please enter a valid depth');
      return;
    }

    // Create new mine object with proper types
    const newMineData = {
      ...newMine,
      id: `mine${Date.now()}`, // Generate a unique ID
      coordinates: {
        lat: parseFloat(newMine.coordinates.lat),
        lng: parseFloat(newMine.coordinates.lng)
      },
      depth: parseFloat(newMine.depth),
      sectors: [] // Initialize with empty sectors array
    };

    // Here you would typically make an API call to save the new mine
    // For now, we'll just close the modal and reset the form
    setShowAddModal(false);
    setNewMine({
      name: '',
      location: '',
      status: 'active',
      areaNumber: '',
      coordinates: { lat: '', lng: '' },
      depth: '',
      description: '',
      sectors: []
    });
  };

  const handleAddSector = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!newSector.name || !newSector.status) {
      alert('Please fill in all required fields');
      return;
    }

    // Create new sector object with proper types
    const newSectorData = {
      ...newSector,
      id: `sector-${Date.now()}`, // Generate a unique ID
      sensors: [] // Initialize with empty sensors array
    };

    // Here you would typically make an API call to save the new sector
    // For now, we'll just close the modal and reset the form
    setShowAddSectorModal(false);
    setNewSector({
      name: '',
      status: 'active',
      sensors: [],
      id: ''
    });
  };

  const handleAddSensor = (e: React.FormEvent) => {
    e.preventDefault();
    setShowAddSensorModal(false);
    setNewSensor({
      type: 'gas',
      location: '',
      coordinates: { lat: '', lng: '' },
      specifications: {
        model: '',
        range: '',
        accuracy: '',
        manufacturer: ''
      }
    });
  };

  const handleManageClick = (mine: Mine) => {
    setSelectedMine(mine);
    setSelectedSector(mine.sectors.length > 0 ? mine.sectors[0].id : '');
    setShowDetailsModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="ml-64 p-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mine Management</h1>
            <p className="mt-1 text-gray-500">Monitor and manage mining operations</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Mining Area
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockMines.map(mine => (
            <div key={mine.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">{mine.name}</h3>
                    <p className="text-gray-500">{mine.location}</p>
                    <p className="text-sm text-gray-400">Area #{mine.areaNumber}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    mine.status === 'active' ? 'bg-green-100 text-green-800' :
                    mine.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
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
                      {mine.sectors.reduce((acc, sector) => acc + sector.sensors.length, 0)}
                    </p>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex items-center text-gray-600 mb-2">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span>GPS Coordinates</span>
                  </div>
                  <p className="text-sm">
                    {mine.coordinates.lat.toFixed(4)}°N, {mine.coordinates.lng.toFixed(4)}°W
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
                      onChange={e => setNewMine(prev => ({ ...prev, name: e.target.value }))}
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
                      onChange={e => setNewMine(prev => ({ ...prev, areaNumber: e.target.value }))}
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
                      onChange={e => setNewMine(prev => ({ ...prev, location: e.target.value }))}
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
                      onChange={e => setNewMine(prev => ({ ...prev, depth: e.target.value }))}
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
                      onChange={e => setNewMine(prev => ({
                        ...prev,
                        coordinates: { ...prev.coordinates, lat: e.target.value }
                      }))}
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
                      onChange={e => setNewMine(prev => ({
                        ...prev,
                        coordinates: { ...prev.coordinates, lng: e.target.value }
                      }))}
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
                      onChange={e => setNewMine(prev => ({ ...prev, status: e.target.value as 'active' | 'maintenance' | 'emergency' }))}
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
                      onChange={e => setNewMine(prev => ({ ...prev, description: e.target.value }))}
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
                  <p className="text-gray-500">Area #{selectedMine.areaNumber} - {selectedMine.location}</p>
                </div>
                <div className="flex items-center gap-4">
                <select
                      value={selectedSector}
                      onChange={(e) => setSelectedSector(e.target.value)}
                      className="px-4 py-2 border rounded-lg bg-white"
                    >
                      {selectedMine.sectors.length > 0 ? (
                        <>
                          {selectedMine.sectors.map(sector => (
                            <option key={sector.id} value={sector.id}>
                              {sector.name} (Level {sector.level})
                            </option>
                          ))}
                        </>
                      ) : (
                        <option value="">No sectors available</option>
                      )}
                    </select> 
                  <button
                    onClick={() => setShowAddSectorModal(true)}
                    className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 flex items-center"
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
                  <div className="bg-white border rounded-lg overflow-hidden">
                    <MineMap mineId={selectedMine.id} selectedSector={selectedSector} />
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-white border rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">Mine Overview</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Status</span>
                        <span className={`px-3 py-1 rounded-full text-sm ${
                          selectedMine.status === 'active' ? 'bg-green-100 text-green-800' :
                          selectedMine.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
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
                          {selectedMine.sectors.reduce((acc, sector) => acc + sector.sensors.length, 0)}
                        </span>
                      </div>
                    </div>
                  </div>

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
                        .filter(sector => selectedSector === 'all' || sector.id === selectedSector)
                        .map(sector => (
                          <div key={sector.id} className="border-b pb-4 last:border-b-0 last:pb-0">
                            <h4 className="font-medium mb-2">{sector.name} (Level {sector.level})</h4>
                            <div className="space-y-2">
                              {sector.sensors.map(sensor => (
                                <div key={sensor.id} className="flex items-center justify-between">
                                  <div className="flex items-center">
                                    {sensor.type === 'gas' && <Wind className="w-4 h-4 text-blue-500 mr-2" />}
                                    {sensor.type === 'temperature' && <ThermometerSun className="w-4 h-4 text-orange-500 mr-2" />}
                                    {sensor.type === 'seismic' && <Activity className="w-4 h-4 text-purple-500 mr-2" />}
                                    <span className="capitalize">{sensor.type}</span>
                                  </div>
                                  <span className={`px-2 py-1 rounded-full text-xs ${
                                    sensor.status === 'active' ? 'bg-green-100 text-green-800' :
                                    'bg-yellow-100 text-yellow-800'
                                  }`}>
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
                      onChange={e => setNewSector(prev => ({ ...prev, name: e.target.value }))}
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
                      onChange={e => setNewSector(prev => ({ ...prev, status: e.target.value as 'active' | 'maintenance' | 'emergency' }))}
                      className="w-full p-2 border rounded-md"
                      required
                    >
                      <option value="active">Active</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="emergency">Emergency</option>
                    </select>
                  </div>

                  {/* Initial Sensors Section */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Initial Sensors
                    </label>
                    <div className="bg-gray-50 p-4 rounded-md">
                      <p className="text-sm text-gray-500 mb-2">
                        Sensors can be added to this sector after creation using the "Add Sensor" button in the sector details.
                      </p>
                      <div className="flex items-center text-sm text-gray-600">
                        <Activity className="w-4 h-4 mr-2" />
                        <span>Sensors will be initialized as an empty array</span>
                      </div>
                    </div>
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
                      onChange={e => setNewSensor(prev => ({
                        ...prev,
                        type: e.target.value as 'gas' | 'temperature' | 'seismic' | 'strain'
                      }))}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="gas">Gas</option>
                      <option value="temperature">Temperature</option>
                      <option value="seismic">Seismic</option>
                      <option value="strain">Structural Strain</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Location
                    </label>
                    <input
                      type="text"
                      value={newSensor.location}
                      onChange={e => setNewSensor(prev => ({ ...prev, location: e.target.value }))}
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
                      onChange={e => setNewSensor(prev => ({
                        ...prev,
                        coordinates: { ...prev.coordinates, lat: e.target.value }
                      }))}
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
                      onChange={e => setNewSensor(prev => ({
                        ...prev,
                        coordinates: { ...prev.coordinates, lng: e.target.value }
                      }))}
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
                      onChange={e => setNewSensor(prev => ({
                        ...prev,
                        specifications: { ...prev.specifications, model: e.target.value }
                      }))}
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
                      onChange={e => setNewSensor(prev => ({
                        ...prev,
                        specifications: { ...prev.specifications, range: e.target.value }
                      }))}
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
                      onChange={e => setNewSensor(prev => ({
                        ...prev,
                        specifications: { ...prev.specifications, accuracy: e.target.value }
                      }))}
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
                      onChange={e => setNewSensor(prev => ({
                        ...prev,
                        specifications: { ...prev.specifications, manufacturer: e.target.value }
                      }))}
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