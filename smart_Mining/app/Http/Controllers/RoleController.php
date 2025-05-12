<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class RoleController extends Controller
{
    public function __construct()
    {
        $this->middleware(['auth:sanctum', 'admin']);
    }

    /**
     * Get all available roles
     */
    public function getAllRoles()
    {
        $roles = ['admin', 'manager', 'user'];

        return response()->json([
            'roles' => $roles
        ]);
    }

    /**
     * Get users by role
     */
    public function getUsersByRole(Request $request)
    {
        $validated = $request->validate([
            'role' => ['required', 'string', 'in:admin,manager,user']
        ]);

        $users = User::where('role', $validated['role'])->get();

        return response()->json([
            'users' => $users
        ]);
    }

    /**
     * Assign role to user
     */
    public function assignRole(Request $request, $id)
    {
        $validated = $request->validate([
            'role' => ['required', 'string', 'in:admin,manager,user']
        ]);

        $user = User::findOrFail($id);
        $user->role = $validated['role'];
        $user->save();

        return response()->json([
            'message' => 'Role assigned successfully',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role
            ]
        ]);
    }
}
