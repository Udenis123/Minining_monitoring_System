<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    // Login
    public function login(Request $request)
    {
        $validated = $request->validate([
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
        ]);

        if (!Auth::guard('web')->attempt($validated)) {
            return response()->json(['message' => 'Invalid login credentials'], 401);
        }

        $user = User::with('role.permissions')->where('email', $validated['email'])->first();

        $token = $user->createToken('auth_token')->plainTextToken;

        // Get permissions from role
        $permissions = $user->permissions();

        return response()->json([
            'message' => 'Logged in successfully',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role ? $user->role->role_name : null,
                'permissions' => $permissions
            ],
            'token' => $token
        ]);
    }
}
