<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\PasswordResetController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\PermissionController;

// Test route for debugging
Route::get('/test', function () {
    return response()->json(['message' => 'API is working']);
});

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Email Verification Routes
Route::get('/email/verify/{id}/{hash}', [AuthController::class, 'verifyEmail'])
    ->name('verification.verify');
Route::post('/email/verification-notification', [AuthController::class, 'resendVerificationEmail'])
    ->middleware(['auth:sanctum', 'throttle:6,1'])
    ->name('verification.send');

// Password Reset Routes (API)
Route::post('/forgot-password', [PasswordResetController::class, 'forgotPassword'])
    ->name('password.email');

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);

    // Permission and role checking
    Route::post('/check-permission', [AuthController::class, 'checkPermission']);
    Route::post('/check-role', [AuthController::class, 'checkRole']);
    Route::get('/user-permissions', [AuthController::class, 'getUserPermissions']);
});

// Admin routes
Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    // User management
    Route::get('/users', [AdminController::class, 'getAllUsers']);
    Route::get('/users/pending', [AdminController::class, 'getPendingApprovals']);
    Route::post('/users', [AdminController::class, 'createUser']);
    Route::patch('/users/{id}/approve', [AdminController::class, 'approveUser']);
    Route::delete('/users/{id}/reject', [AdminController::class, 'rejectUser']);
    Route::patch('/users/{id}/role', [AdminController::class, 'updateUserRole']);

    // Role management
    Route::get('/roles', [RoleController::class, 'getAllRoles']);
    Route::get('/roles/users', [RoleController::class, 'getUsersByRole']);
    Route::patch('/roles/users/{id}', [RoleController::class, 'assignRole']);

    // Permission management
    Route::get('/permissions', [PermissionController::class, 'getAllPermissions']);
    Route::get('/roles/{roleId}/permissions', [PermissionController::class, 'getRolePermissions']);
    Route::patch('/roles/{roleId}/permissions', [PermissionController::class, 'updateRolePermissions']);
});

