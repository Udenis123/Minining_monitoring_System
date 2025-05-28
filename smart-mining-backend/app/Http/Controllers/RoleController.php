<?php

namespace App\Http\Controllers;

use App\Models\Role;
use App\Models\Permission;
use App\Services\LogService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class RoleController extends Controller
{
    /**
     * Display a listing of all roles
     */
    public function getAllRoles(Request $request)
    {
        // Log the view action
        LogService::viewLog('Role');

        $roles = Role::with('permissions')->get();
        return response()->json(['roles' => $roles]);
    }

    /**
     * Store a newly created role
     */
    public function createRole(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'role_name' => 'required|string|unique:roles,role_name',
            'permissions' => 'required|array',
            'permissions.*' => 'string|exists:permissions,permission_name',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Create the role
        $role = Role::create([
            'role_name' => $request->role_name,
        ]);

        // Attach permissions
        $permissions = Permission::whereIn('permission_name', $request->permissions)->get();
        $role->permissions()->attach($permissions);

        // Log the create action
        LogService::createLog(
            'Role',
            $role->id,
            [
                'role_name' => $role->role_name,
                'permissions' => $request->permissions
            ],
            $request
        );

        return response()->json([
            'message' => 'Role created successfully',
            'role' => $role->load('permissions')
        ], 201);
    }

    /**
     * Update role permissions
     */
    public function updateRolePermissions(Request $request, $id)
    {
        $role = Role::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'permissions' => 'required|array',
            'permissions.*' => 'string|exists:permissions,permission_name',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Get old permissions for logging
        $oldPermissions = $role->permissions()->pluck('permission_name')->toArray();

        // Get permission IDs
        $permissions = Permission::whereIn('permission_name', $request->permissions)->get();

        // Sync permissions
        $role->permissions()->sync($permissions);

        // Log the update action
        LogService::updateLog(
            'Role',
            $role->id,
            ['permissions' => $oldPermissions],
            ['permissions' => $request->permissions],
            $request
        );

        return response()->json([
            'message' => 'Role permissions updated successfully',
            'role' => $role->load('permissions')
        ]);
    }

    /**
     * Get role permissions
     */
    public function getRolePermissions(Request $request, $id)
    {
        // Log the view action
        LogService::viewLog('Role', $id);

        $role = Role::with('permissions')->findOrFail($id);

        return response()->json([
            'role' => $role->role_name,
            'permissions' => $role->permissions()->pluck('permission_name')
        ]);
    }

    /**
     * Get all users with a specific role
     */
    public function getUsersByRole(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'role_id' => 'required|exists:roles,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Log the view action
        LogService::viewLog('Role', $request->role_id);

        $role = Role::with('users')->findOrFail($request->role_id);

        return response()->json([
            'role' => $role->role_name,
            'users' => $role->users->map(function($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email
                ];
            })
        ]);
    }

    /**
     * Get a list of role names with their IDs
     */
    public function getRoleNames(Request $request)
    {
        // Log the view action
        LogService::viewLog('Role');

        $roles = Role::select('id', 'role_name')->get();
        return response()->json(['roles' => $roles]);
    }

    /**
     * Get a list of all permissions in the system
     */
    public function getAllPermissions(Request $request)
    {
        // Log the view action
        LogService::viewLog('Permission');

        $permissions = Permission::select('id', 'permission_name')->get();
        return response()->json(['permissions' => $permissions]);
    }
}
