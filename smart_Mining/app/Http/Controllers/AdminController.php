<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class AdminController extends Controller
{
    public function __construct()
    {
        $this->middleware(['auth:sanctum', 'admin']);
    }

    // Get all users
    public function getAllUsers()
    {
        $users = User::all();
        return response()->json($users);
    }

    // Get pending approvals
    public function getPendingApprovals()
    {
        $users = User::where('is_approved', false)->get();
        return response()->json($users);
    }

    // Approve user
    public function approveUser($id)
    {
        $user = User::findOrFail($id);
        $user->is_approved = true;
        $user->save();

        return response()->json([
            'message' => 'User approved successfully',
            'user' => $user
        ]);
    }

    // Reject/Delete user
    public function rejectUser($id)
    {
        $user = User::findOrFail($id);
        $user->delete();

        return response()->json([
            'message' => 'User rejected and deleted successfully'
        ]);
    }

    // Create new user
    public function createUser(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'confirmed', Password::defaults()],
            'role' => ['required', 'string', 'in:admin,manager,user'],
            'is_approved' => ['boolean']
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
            'is_approved' => $validated['is_approved'] ?? true,
            'email_verified_at' => now() // Auto verify email for admin-created users
        ]);

        return response()->json([
            'message' => 'User created successfully',
            'user' => $user
        ], 201);
    }

    // Update user role
    public function updateUserRole(Request $request, $id)
    {
        $validated = $request->validate([
            'role' => ['required', 'string', 'in:admin,manager,user']
        ]);

        $user = User::findOrFail($id);
        $user->role = $validated['role'];
        $user->save();

        return response()->json([
            'message' => 'User role updated successfully',
            'user' => $user
        ]);
    }
}
