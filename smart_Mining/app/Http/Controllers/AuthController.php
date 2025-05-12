<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Illuminate\Auth\Events\Registered;
use Illuminate\Auth\Events\Verified;
use Illuminate\Support\Facades\Mail;
use App\Mail\VerificationEmail;
use Illuminate\Support\Facades\Log;

class AuthController extends Controller
{
    // Register
    public function register(Request $request)
    {
        try {
            $validated = $request->validate([
                'name' => ['required', 'string', 'max:255'],
                'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
                'password' => ['required', 'confirmed', Password::defaults()],
            ]);

            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'role' => 'user', // Default role
                'is_approved' => false, // Default to not approved
            ]);

            try {
                $verificationUrl = url('/api/email/verify/' . $user->id . '/' . sha1($user->email));
                Mail::to($user->email)->send(new VerificationEmail($verificationUrl));
                Log::info('Verification email sent successfully to: ' . $user->email);
            } catch (\Exception $e) {
                Log::error('Failed to send verification email: ' . $e->getMessage());
                // Don't expose the error to the user, but log it
            }

            return response()->json([
                'message' => 'Registration successful! Please check your email for verification link.',
                'user' => [
                    'name' => $user->name,
                    'email' => $user->email
                ]
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json($e->errors(), 422);
        } catch (\Exception $e) {
            Log::error('Registration error: ' . $e->getMessage());
            return response()->json(['message' => 'An error occurred during registration. Please try again.'], 500);
        }
    }

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

        $user = User::where('email', $validated['email'])->first();

        if (!$user->hasVerifiedEmail()) {
            return response()->json(['message' => 'Please verify your email address first. Check your email for the verification link.'], 403);
        }

        if (!$user->is_approved) {
            return response()->json(['message' => 'Your account is pending approval by an administrator.'], 403);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Logged in successfully',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
            ],
            'token' => $token
        ]);
    }

    // Logout
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out successfully']);
    }

    public function user(Request $request)
    {
        $user = $request->user();

        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'is_approved' => $user->is_approved,
                'email_verified_at' => $user->email_verified_at
            ]
        ]);
    }

    public function verifyEmail(Request $request)
    {
        try {
            $user = User::find($request->route('id'));

            if (!$user) {
                return response()->json('User not found', 404);
            }

            if (!hash_equals((string) $request->route('hash'), sha1($user->getEmailForVerification()))) {
                return response()->json('Invalid verification link', 400);
            }

            if ($user->hasVerifiedEmail()) {
                return response()->json('Email already verified');
            }

            if ($user->markEmailAsVerified()) {
                event(new Verified($user));
                return response()->json('Email verified successfully! You can now log in.');
            }

            return response()->json('Email verification failed. Please try again.', 400);

        } catch (\Exception $e) {
            Log::error('Email verification error: ' . $e->getMessage());
            return response()->json('An error occurred during email verification. Please try again.', 500);
        }
    }

    public function resendVerificationEmail(Request $request)
    {
        try {
            if ($request->user()->hasVerifiedEmail()) {
                return response()->json('Email already verified');
            }

            $verificationUrl = url('/api/email/verify/' . $request->user()->id . '/' . sha1($request->user()->email));
            Mail::to($request->user()->email)->send(new VerificationEmail($verificationUrl));
            Log::info('Verification email resent to: ' . $request->user()->email);

            return response()->json('A new verification link has been sent to your email address.');

        } catch (\Exception $e) {
            Log::error('Resend verification email error: ' . $e->getMessage());
            return response()->json('Failed to resend verification email. Please try again later.', 500);
        }
    }

    /**
     * Check if a user has a specific permission
     */
    public function checkPermission(Request $request)
    {
        $validated = $request->validate([
            'permission' => ['required', 'string']
        ]);

        $hasPermission = $request->user()->hasPermission($validated['permission']);

        return response()->json([
            'permission' => $validated['permission'],
            'has_permission' => $hasPermission
        ]);
    }

    /**
     * Check if a user has a specific role
     */
    public function checkRole(Request $request)
    {
        $validated = $request->validate([
            'role' => ['required', 'string']
        ]);

        $hasRole = $request->user()->hasRole($validated['role']);

        return response()->json([
            'role' => $validated['role'],
            'has_role' => $hasRole
        ]);
    }

    /**
     * Get user permissions
     */
    public function getUserPermissions(Request $request)
    {
        $user = $request->user();

        // If admin, return all permissions
        if ($user->isAdmin()) {
            $permissions = \App\Models\Permission::all();
            return response()->json([
                'permissions' => $permissions
            ]);
        }

        // Otherwise get permissions from user's role
        $role = \App\Models\Role::where('slug', $user->role)->first();
        if (!$role) {
            return response()->json([
                'permissions' => []
            ]);
        }

        return response()->json([
            'permissions' => $role->permissions
        ]);
    }
}
