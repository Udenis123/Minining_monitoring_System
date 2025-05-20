<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\MineController;
use App\Http\Controllers\SectorController;
use App\Http\Controllers\SensorController;
use Illuminate\Support\Facades\Mail;

// Test route for debugging
Route::get('/test', function () {
    return response()->json(['message' => 'API is working']);
});

// Public routes
Route::post('/login', [AuthController::class, 'login']);
Route::post('/forgot-password', [AuthController::class, 'sendResetPasswordCode']);
Route::post('/verify-reset-code', [AuthController::class, 'verifyResetCode']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);

// Protected routes - require authentication
Route::middleware('auth:sanctum')->group(function () {
    // Role management
    Route::get('/roles', [RoleController::class, 'getAllRoles']);
    Route::get('/role-names', [RoleController::class, 'getRoleNames']);
    Route::post('/roles', [RoleController::class, 'createRole']);
    Route::put('/roles/{id}/permissions', [RoleController::class, 'updateRolePermissions']);
    Route::get('/roles/{id}/permissions', [RoleController::class, 'getRolePermissions']);
    Route::get('/roles/users', [RoleController::class, 'getUsersByRole']);

    // Permissions
    Route::get('/permissions', [RoleController::class, 'getAllPermissions']);

    // User management
    Route::get('/users', [UserController::class, 'getAllUsers']);
    Route::post('/users', [UserController::class, 'createUser']);
    Route::put('/users/{id}/role', [UserController::class, 'updateUserRole']);
    Route::put('/users/{id}', [UserController::class, 'updateUser']);
    Route::delete('/users/{id}', [UserController::class, 'deleteUser']);
    Route::put('/users/{id}/permissions', [UserController::class, 'updateUserPermissions']);

    // Mine management
    Route::prefix('mines')->group(function () {
        Route::get('/', [MineController::class, 'getAllMines']);
        Route::post('/', [MineController::class, 'createMine']);
        Route::get('/{id}', [MineController::class, 'getMine']);
        Route::put('/{id}', [MineController::class, 'updateMine']);
        Route::delete('/{id}', [MineController::class, 'deleteMine']);

        // Sector management
        Route::get('/{mineId}/sectors', [SectorController::class, 'getSectors']);
        Route::post('/{mineId}/sectors', [SectorController::class, 'createSector']);
        Route::get('/{mineId}/sectors/{sectorId}', [SectorController::class, 'getSector']);
        Route::put('/{mineId}/sectors/{sectorId}', [SectorController::class, 'updateSector']);
        Route::delete('/{mineId}/sectors/{sectorId}', [SectorController::class, 'deleteSector']);

        // Sensor management
        Route::get('/{mineId}/sectors/{sectorId}/sensors', [SensorController::class, 'getSensors']);
        Route::post('/{mineId}/sectors/{sectorId}/sensors', [SensorController::class, 'createSensor']);
        Route::get('/{mineId}/sectors/{sectorId}/sensors/{sensorId}', [SensorController::class, 'getSensor']);
        Route::put('/{mineId}/sectors/{sectorId}/sensors/{sensorId}', [SensorController::class, 'updateSensor']);
        Route::delete('/{mineId}/sectors/{sectorId}/sensors/{sensorId}', [SensorController::class, 'deleteSensor']);
    });
});

