<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Sector;
use App\Models\Sensor;
use App\Services\LogService;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;

class SensorController extends Controller
{
    public function __construct()
    {
        // No middleware checks here
    }

    public function createSensor(Request $request, $mineId, $sectorId)
    {
        $sector = Sector::where('mine_id', $mineId)
            ->where('id', $sectorId)
            ->first();

        if (!$sector) {
            return response()->json(['message' => 'Sector not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'type' => 'required|in:gas,temperature,seismic,strain',
            'location' => 'required|string|max:255',
            'coordinates.lat' => 'required|numeric|between:-90,90',
            'coordinates.lng' => 'required|numeric|between:-180,180',
            'specifications.model' => 'required|string|max:255',
            'specifications.range' => 'required|string|max:255',
            'specifications.accuracy' => 'required|string|max:255',
            'specifications.manufacturer' => 'required|string|max:255'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $sensor = Sensor::create([
            'sector_id' => $sectorId,
            'type' => $request->type,
            'location' => $request->location,
            'latitude' => $request->coordinates['lat'],
            'longitude' => $request->coordinates['lng'],
            'status' => 'active',
            'installation_date' => now(),
            'last_calibration' => now(),
            'model' => $request->specifications['model'],
            'range' => $request->specifications['range'],
            'accuracy' => $request->specifications['accuracy'],
            'manufacturer' => $request->specifications['manufacturer']
        ]);

        // Log the create action
        LogService::createLog(
            'Sensor',
            $sensor->id,
            $sensor->toArray(),
            $request
        );

        return response()->json([
            'message' => 'Sensor created successfully',
            'data' => $sensor
        ], 201);
    }

    public function getSensors(Request $request, $mineId, $sectorId)
    {
        $sector = Sector::where('mine_id', $mineId)
            ->where('id', $sectorId)
            ->first();

        if (!$sector) {
            return response()->json(['message' => 'Sector not found'], 404);
        }

        // Log the view action
        LogService::viewLog('Sensor');

        $sensors = Sensor::where('sector_id', $sectorId)->get();

        return response()->json(['data' => $sensors]);
    }

    public function getSensor(Request $request, $mineId, $sectorId, $sensorId)
    {
        $sensor = Sensor::where('sector_id', $sectorId)
            ->where('id', $sensorId)
            ->first();

        if (!$sensor) {
            return response()->json(['message' => 'Sensor not found'], 404);
        }

        // Log the view action
        LogService::viewLog('Sensor', $sensorId);

        return response()->json(['data' => $sensor]);
    }

    public function updateSensor(Request $request, $mineId, $sectorId, $sensorId)
    {
        $sensor = Sensor::where('sector_id', $sectorId)
            ->where('id', $sensorId)
            ->first();

        if (!$sensor) {
            return response()->json(['message' => 'Sensor not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'type' => 'sometimes|in:gas,temperature,seismic,strain',
            'location' => 'sometimes|string|max:255',
            'coordinates.lat' => 'sometimes|numeric|between:-90,90',
            'coordinates.lng' => 'sometimes|numeric|between:-180,180',
            'status' => 'sometimes|in:active,inactive,maintenance',
            'specifications.model' => 'sometimes|string|max:255',
            'specifications.range' => 'sometimes|string|max:255',
            'specifications.accuracy' => 'sometimes|string|max:255',
            'specifications.manufacturer' => 'sometimes|string|max:255'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Store old values for logging
        $oldValues = $sensor->toArray();

        $updateData = [
            'type' => $request->type ?? $sensor->type,
            'location' => $request->location ?? $sensor->location,
            'status' => $request->status ?? $sensor->status
        ];

        if (isset($request->coordinates)) {
            $updateData['latitude'] = $request->coordinates['lat'] ?? $sensor->latitude;
            $updateData['longitude'] = $request->coordinates['lng'] ?? $sensor->longitude;
        }

        if (isset($request->specifications)) {
            $updateData['model'] = $request->specifications['model'] ?? $sensor->model;
            $updateData['range'] = $request->specifications['range'] ?? $sensor->range;
            $updateData['accuracy'] = $request->specifications['accuracy'] ?? $sensor->accuracy;
            $updateData['manufacturer'] = $request->specifications['manufacturer'] ?? $sensor->manufacturer;
        }

        $sensor->update($updateData);

        // Log the update action
        LogService::updateLog(
            'Sensor',
            $sensor->id,
            $oldValues,
            $sensor->toArray(),
            $request
        );

        return response()->json([
            'message' => 'Sensor updated successfully',
            'data' => $sensor
        ]);
    }

    public function deleteSensor(Request $request, $mineId, $sectorId, $sensorId)
    {
        $sensor = Sensor::where('sector_id', $sectorId)
            ->where('id', $sensorId)
            ->first();

        if (!$sensor) {
            return response()->json(['message' => 'Sensor not found'], 404);
        }

        // Store sensor data for logging before deletion
        $sensorData = $sensor->toArray();

        $sensor->delete();

        // Log the delete action
        LogService::deleteLog(
            'Sensor',
            $sensorId,
            $sensorData,
            $request
        );

        return response()->json(['message' => 'Sensor deleted successfully']);
    }
}
