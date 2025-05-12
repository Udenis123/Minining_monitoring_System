<?php

namespace App\Http\Controllers;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Http\Request;

class PermissionController extends Controller
{
    public function __construct()
    {
        $this->middleware(['auth:sanctum', 'admin']);
    }

    /**
     * Get all permissions
     */
    public function getAllPermissions()
    {
        $permissions = Permission::all();

        return response()->json([
            'permissions' => $permissions
        ]);
    }

    /**
     * Get permissions for a specific role
     */
    public function getRolePermissions($roleId)
    {
        $role = Role::findOrFail($roleId);
        $permissions = $role->permissions;

        return response()->json([
            'role' => [
                'id' => $role->id,
                'name' => $role->name,
                'slug' => $role->slug
            ],
            'permissions' => $permissions
        ]);
    }

    /**
     * Update role permissions
     */
    public function updateRolePermissions(Request $request, $roleId)
    {
        $validated = $request->validate([
            'permissions' => ['required', 'array'],
            'permissions.*' => ['required', 'integer', 'exists:permissions,id']
        ]);

        $role = Role::findOrFail($roleId);
        $role->permissions()->sync($validated['permissions']);

        return response()->json([
            'message' => 'Role permissions updated successfully',
            'role' => [
                'id' => $role->id,
                'name' => $role->name,
                'slug' => $role->slug
            ],
            'permissions' => $role->permissions()->get()
        ]);
    }
}
