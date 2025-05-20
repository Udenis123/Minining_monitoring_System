<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Mine;
use App\Models\Sector;
use Illuminate\Support\Facades\Validator;

class SectorController extends Controller
{
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

        return response()->json([
            'message' => 'Sector created successfully',
            'data' => $sector
        ], 201);
    }

    public function getSectors($mineId)
    {
        $mine = Mine::find($mineId);

        if (!$mine) {
            return response()->json(['message' => 'Mine not found'], 404);
        }

        $sectors = Sector::where('mine_id', $mineId)
            ->with('sensors')
            ->get();

        return response()->json(['data' => $sectors]);
    }

    public function getSector($mineId, $sectorId)
    {
        $sector = Sector::where('mine_id', $mineId)
            ->where('id', $sectorId)
            ->with('sensors')
            ->first();

        if (!$sector) {
            return response()->json(['message' => 'Sector not found'], 404);
        }

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

        $sector->update([
            'name' => $request->name ?? $sector->name,
            'level' => $request->level ?? $sector->level,
            'status' => $request->status ?? $sector->status
        ]);

        return response()->json([
            'message' => 'Sector updated successfully',
            'data' => $sector
        ]);
    }

    public function deleteSector($mineId, $sectorId)
    {
        $sector = Sector::where('mine_id', $mineId)
            ->where('id', $sectorId)
            ->first();

        if (!$sector) {
            return response()->json(['message' => 'Sector not found'], 404);
        }

        $sector->delete();

        return response()->json(['message' => 'Sector deleted successfully']);
    }
}
