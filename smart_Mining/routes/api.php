<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\UserController;

// Test route for debugging
Route::get('/test', function () {
    return response()->json(['message' => 'API is working']);
});

// Public routes
Route::post('/login', [AuthController::class, 'login']);

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
});

