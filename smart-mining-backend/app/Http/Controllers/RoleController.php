<?php

namespace App\Http\Controllers;

use App\Models\Role;
use App\Models\Permission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class RoleController extends Controller
{
    /**
     * Display a listing of all roles
     */
    public function getAllRoles()
    {
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

        // Get permission IDs
        $permissions = Permission::whereIn('permission_name', $request->permissions)->get();

        // Sync permissions
        $role->permissions()->sync($permissions);

        return response()->json([
            'message' => 'Role permissions updated successfully',
            'role' => $role->load('permissions')
        ]);
    }

    /**
     * Get role permissions
     */
    public function getRolePermissions($id)
    {
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
    public function getRoleNames()
    {
        $roles = Role::select('id', 'role_name')->get();
        return response()->json(['roles' => $roles]);
    }

    /**
     * Get a list of all permissions in the system
     */
    public function getAllPermissions()
    {
        $permissions = Permission::select('id', 'permission_name')->get();
        return response()->json(['permissions' => $permissions]);
    }
}
