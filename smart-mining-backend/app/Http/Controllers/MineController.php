<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Mine;
use App\Services\LogService;
use Illuminate\Support\Facades\Validator;

class MineController extends Controller
{
    public function createMine(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:mines',
            'location' => 'required|string|max:255',
            'status' => 'required|in:active,maintenance,emergency',
            'areaNumber' => 'required|string|max:50|unique:mines,area_number',
            'coordinates.lat' => 'required|numeric|between:-90,90',
            'coordinates.lng' => 'required|numeric|between:-180,180',
            'depth' => 'required|numeric|min:0',
            'description' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $mine = Mine::create([
            'name' => $request->name,
            'location' => $request->location,
            'status' => $request->status,
            'area_number' => $request->areaNumber,
            'latitude' => $request->coordinates['lat'],
            'longitude' => $request->coordinates['lng'],
            'depth' => $request->depth,
            'description' => $request->description
        ]);

        // Log the create action
        LogService::createLog(
            'Mine',
            $mine->id,
            $mine->toArray(),
            $request
        );

        return response()->json([
            'message' => 'Mine created successfully',
            'data' => $mine
        ], 201);
    }

    public function getAllMines(Request $request)
    {
        // Log the view action
        LogService::viewLog('Mine');

        $mines = Mine::with(['sectors.sensors'])->get();
        return response()->json(['data' => $mines]);
    }

    public function getMine(Request $request, $id)
    {
        $mine = Mine::with(['sectors.sensors'])->find($id);

        if (!$mine) {
            return response()->json(['message' => 'Mine not found'], 404);
        }

        // Log the view action
        LogService::viewLog('Mine', $id);

        return response()->json(['data' => $mine]);
    }

    public function updateMine(Request $request, $id)
    {
        $mine = Mine::find($id);

        if (!$mine) {
            return response()->json(['message' => 'Mine not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255|unique:mines,name,' . $id,
            'location' => 'sometimes|string|max:255',
            'status' => 'sometimes|in:active,maintenance,emergency',
            'areaNumber' => 'sometimes|string|max:50|unique:mines,area_number,' . $id,
            'coordinates.lat' => 'sometimes|numeric|between:-90,90',
            'coordinates.lng' => 'sometimes|numeric|between:-180,180',
            'depth' => 'sometimes|numeric|min:0',
            'description' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Store old values for logging
        $oldValues = $mine->toArray();

        $mine->update([
            'name' => $request->name ?? $mine->name,
            'location' => $request->location ?? $mine->location,
            'status' => $request->status ?? $mine->status,
            'area_number' => $request->areaNumber ?? $mine->area_number,
            'latitude' => $request->coordinates['lat'] ?? $mine->latitude,
            'longitude' => $request->coordinates['lng'] ?? $mine->longitude,
            'depth' => $request->depth ?? $mine->depth,
            'description' => $request->description ?? $mine->description
        ]);

        // Log the update action
        LogService::updateLog(
            'Mine',
            $mine->id,
            $oldValues,
            $mine->toArray(),
            $request
        );

        return response()->json([
            'message' => 'Mine updated successfully',
            'data' => $mine
        ]);
    }

    public function deleteMine(Request $request, $id)
    {
        $mine = Mine::find($id);

        if (!$mine) {
            return response()->json(['message' => 'Mine not found'], 404);
        }

        // Store mine data for logging before deletion
        $mineData = $mine->toArray();

        $mine->delete();

        // Log the delete action
        LogService::deleteLog(
            'Mine',
            $id,
            $mineData,
            $request
        );

        return response()->json(['message' => 'Mine deleted successfully']);
    }
}
