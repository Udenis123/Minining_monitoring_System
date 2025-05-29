<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Mine;
use App\Models\Sector;
use App\Services\LogService;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;

class SectorController extends Controller
{
    public function __construct()
    {
        // No middleware checks here
    }

    public function createSector(Request $request, $mineId)
    {
        $mine = Mine::find($mineId);

        if (!$mine) {
            return response()->json(['message' => 'Mine not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'level' => 'required|integer|min:1',
            'status' => 'required|in:active,maintenance,emergency'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Check if level already exists in this mine
        $existingLevel = Sector::where('mine_id', $mineId)
            ->where('level', $request->level)
            ->exists();

        if ($existingLevel) {
            return response()->json([
                'message' => 'A sector with this level already exists in the mine'
            ], 422);
        }

        $sector = Sector::create([
            'mine_id' => $mineId,
            'name' => $request->name,
            'level' => $request->level,
            'status' => $request->status
        ]);

        // Log the create action
        LogService::createLog(
            'Sector',
            $sector->id,
            [
                'mine_id' => $sector->mine_id,
                'name' => $sector->name,
                'level' => $sector->level,
                'status' => $sector->status
            ],
            $request
        );

        return response()->json([
            'message' => 'Sector created successfully',
            'data' => $sector
        ], 201);
    }

    public function getSectors(Request $request, $mineId)
    {
        $mine = Mine::find($mineId);

        if (!$mine) {
            return response()->json(['message' => 'Mine not found'], 404);
        }

        // Log the view action
        LogService::viewLog('Sector');

        $sectors = Sector::where('mine_id', $mineId)
            ->with('sensors')
            ->get();

        return response()->json(['data' => $sectors]);
    }

    public function getSector(Request $request, $mineId, $sectorId)
    {
        $sector = Sector::where('mine_id', $mineId)
            ->where('id', $sectorId)
            ->with('sensors')
            ->first();

        if (!$sector) {
            return response()->json(['message' => 'Sector not found'], 404);
        }

        // Log the view action
        LogService::viewLog('Sector', $sectorId);

        return response()->json(['data' => $sector]);
    }

    public function updateSector(Request $request, $mineId, $sectorId)
    {
        $sector = Sector::where('mine_id', $mineId)
            ->where('id', $sectorId)
            ->first();

        if (!$sector) {
            return response()->json(['message' => 'Sector not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'level' => 'sometimes|integer|min:1',
            'status' => 'sometimes|in:active,maintenance,emergency'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Check level uniqueness if level is being updated
        if ($request->has('level') && $request->level !== $sector->level) {
            $existingLevel = Sector::where('mine_id', $mineId)
                ->where('level', $request->level)
                ->where('id', '!=', $sectorId)
                ->exists();

            if ($existingLevel) {
                return response()->json([
                    'message' => 'A sector with this level already exists in the mine'
                ], 422);
            }
        }

        // Store old values for logging
        $oldValues = $sector->toArray();

        $sector->update([
            'name' => $request->name ?? $sector->name,
            'level' => $request->level ?? $sector->level,
            'status' => $request->status ?? $sector->status
        ]);

        // Log the update action
        LogService::updateLog(
            'Sector',
            $sector->id,
            $oldValues,
            $sector->toArray(),
            $request
        );

        return response()->json([
            'message' => 'Sector updated successfully',
            'data' => $sector
        ]);
    }

    public function deleteSector(Request $request, $mineId, $sectorId)
    {
        $sector = Sector::where('mine_id', $mineId)
            ->where('id', $sectorId)
            ->first();

        if (!$sector) {
            return response()->json(['message' => 'Sector not found'], 404);
        }

        // Store sector data for logging before deletion
        $sectorData = $sector->toArray();

        $sector->delete();

        // Log the delete action
        LogService::deleteLog(
            'Sector',
            $sectorId,
            $sectorData,
            $request
        );

        return response()->json(['message' => 'Sector deleted successfully']);
    }
}
