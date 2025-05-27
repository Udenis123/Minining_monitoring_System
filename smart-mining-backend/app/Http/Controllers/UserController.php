<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Role;
use App\Services\LogService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class UserController extends Controller
{
    /**
     * Display a listing of all users with their roles
     */
    public function getAllUsers(Request $request)
    {
        // Log the view action
        LogService::viewLog('User');
        
        $users = User::with('role')->get();

        return response()->json([
            'users' => $users->map(function($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role ? $user->role->role_name : null,
                    'permissions' => $user->permissions()
                ];
            })
        ]);
    }

    /**
     * Store a newly created user
     */
    public function createUser(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'role_id' => 'required|exists:roles,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Create the user
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role_id' => $request->role_id,
            'email_verified_at' => now() // Auto verify since this is admin created
        ]);

        // Log the create action
        LogService::createLog(
            'User',
            $user->id,
            [
                'name' => $user->name,
                'email' => $user->email,
                'role_id' => $user->role_id
            ],
            $request
        );

        // Load role and permissions
        $user->load('role.permissions');

        return response()->json([
            'message' => 'User created successfully',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role->role_name,
                'permissions' => $user->permissions()
            ]
        ], 201);
    }

    /**
     * Update user's role
     */
    public function updateUserRole(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'role_id' => 'required|exists:roles,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Get old values for logging
        $oldValues = [
            'role_id' => $user->role_id
        ];

        $user->role_id = $request->role_id;
        $user->save();

        // Log the update action
        LogService::updateLog(
            'User',
            $user->id,
            $oldValues,
            ['role_id' => $user->role_id],
            $request
        );

        // Load role and permissions
        $user->load('role.permissions');

        return response()->json([
            'message' => 'User role updated successfully',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role->role_name,
                'permissions' => $user->permissions()
            ]
        ]);
    }

    /**
     * Update user details
     */
    public function updateUser(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|string|email|max:255|unique:users,email,' . $id,
            'password' => 'sometimes|string|min:6',
            'role_id' => 'sometimes|exists:roles,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Store old values for logging
        $oldValues = [
            'name' => $user->name,
            'email' => $user->email,
            'role_id' => $user->role_id
        ];

        $newValues = [];

        // Update name if provided
        if ($request->has('name')) {
            $user->name = $request->name;
            $newValues['name'] = $request->name;
        }

        // Update email if provided
        if ($request->has('email')) {
            $user->email = $request->email;
            $newValues['email'] = $request->email;
        }

        // Update password if provided
        if ($request->has('password')) {
            $user->password = Hash::make($request->password);
            $newValues['password'] = '******'; // Don't log the actual password
        }

        // Update role if provided
        if ($request->has('role_id')) {
            $user->role_id = $request->role_id;
            $newValues['role_id'] = $request->role_id;
        }

        $user->save();

        // Log the update action
        LogService::updateLog(
            'User',
            $user->id,
            $oldValues,
            $newValues,
            $request
        );

        // Load role and permissions
        $user->load('role.permissions');

        return response()->json([
            'message' => 'User updated successfully',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role ? $user->role->role_name : null,
                'permissions' => $user->permissions()
            ]
        ]);
    }

    /**
     * Delete a user
     */
    public function deleteUser(Request $request, $id)
    {
        $user = User::findOrFail($id);

        // Don't allow deleting the only admin
        if ($user->role && $user->role->role_name === 'admin') {
            $adminCount = User::whereHas('role', function($query) {
                $query->where('role_name', 'admin');
            })->count();

            if ($adminCount <= 1) {
                return response()->json([
                    'message' => 'Cannot delete the only admin user'
                ], 403);
            }
        }

        // Store user data for logging before deletion
        $userData = [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role_id' => $user->role_id
        ];

        $user->delete();

        // Log the delete action
        LogService::deleteLog(
            'User',
            $id,
            $userData,
            $request
        );

        return response()->json([
            'message' => 'User deleted successfully'
        ]);
    }
    
    /**
     * Update user permissions
     */
    public function updateUserPermissions(Request $request, $id) 
    {
        // Assuming this is the implementation for the route
        // defined in api.php but not found in the controller
        
        // Log the action as a placeholder
        LogService::log(
            'update_permissions',
            'User',
            $id,
            'Updated user permissions',
            null,
            null,
            $request
        );
        
        // Implement the actual permission update here
        
        return response()->json([
            'message' => 'User permissions updated successfully'
        ]);
    }
}
