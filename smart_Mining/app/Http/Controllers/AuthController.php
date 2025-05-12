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
        // Disable public registration
        return response()->json([
            'message' => 'Public registration is disabled. Please contact an administrator to create an account.'
        ], 403);

        /* Old code removed - only admin can create users now
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
        */
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

        // Get user permissions
        $permissions = [];

        // Map Laravel permissions to frontend expected format
        $permissionMap = [
            'view-dashboard' => 'view_dashboard',
            'view-mining-map' => 'view_all_mines',
            'view-sensor-data' => 'view_sensors',
            'manage-sensors' => 'manage_sensors',
            'view-reports' => 'view_reports',
            'generate-reports' => 'generate_reports',
            'manage-users' => 'manage_users',
            'manage-roles' => 'manage_roles',
            'view-alerts' => 'view_alerts',
            'manage-alerts' => 'manage_alerts',
        ];

        if ($user->isAdmin()) {
            // Admin gets additional permissions matching frontend expectations
            $permissions = [
                'view_all_mines',
                'manage_users',
                'view_reports',
                'view_sensors',
                'view_predective_data'
            ];
        } else {
            // Get permissions from user's role
            $role = \App\Models\Role::where('slug', $user->role)->first();
            if ($role) {
                $backendPermissions = $role->permissions->pluck('slug')->toArray();

                // Map backend permissions to frontend format
                foreach ($backendPermissions as $permission) {
                    if (isset($permissionMap[$permission])) {
                        $permissions[] = $permissionMap[$permission];
                    }
                }
            }
        }

        return response()->json([
            'message' => 'Logged in successfully',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'permissions' => $permissions
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

        // Get user permissions
        $permissions = [];

        // Map Laravel permissions to frontend expected format
        $permissionMap = [
            'view-dashboard' => 'view_dashboard',
            'view-mining-map' => 'view_all_mines',
            'view-sensor-data' => 'view_sensors',
            'manage-sensors' => 'manage_sensors',
            'view-reports' => 'view_reports',
            'generate-reports' => 'generate_reports',
            'manage-users' => 'manage_users',
            'manage-roles' => 'manage_roles',
            'view-alerts' => 'view_alerts',
            'manage-alerts' => 'manage_alerts',
        ];

        if ($user->isAdmin()) {
            // Admin gets additional permissions matching frontend expectations
            $permissions = [
                'view_all_mines',
                'manage_users',
                'view_reports',
                'view_sensors',
                'view_predective_data'
            ];
        } else {
            // Get permissions from user's role
            $role = \App\Models\Role::where('slug', $user->role)->first();
            if ($role) {
                $backendPermissions = $role->permissions->pluck('slug')->toArray();

                // Map backend permissions to frontend format
                foreach ($backendPermissions as $permission) {
                    if (isset($permissionMap[$permission])) {
                        $permissions[] = $permissionMap[$permission];
                    }
                }
            }
        }

        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'is_approved' => $user->is_approved,
                'permissions' => $permissions
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

        $frontendPermission = $validated['permission'];

        // Map frontend permission to backend permission
        $permissionMap = [
            'view_dashboard' => 'view-dashboard',
            'view_all_mines' => 'view-mining-map',
            'view_sensors' => 'view-sensor-data',
            'manage_sensors' => 'manage-sensors',
            'view_reports' => 'view-reports',
            'generate_reports' => 'generate-reports',
            'manage_users' => 'manage-users',
            'manage_roles' => 'manage-roles',
            'view_alerts' => 'view-alerts',
            'manage_alerts' => 'manage-alerts',
        ];

        // If admin, they have access to everything
        if ($request->user()->isAdmin()) {
            return response()->json([
                'permission' => $frontendPermission,
                'has_permission' => true
            ]);
        }

        // If it's a special frontend permission that doesn't map directly
        if (!isset($permissionMap[$frontendPermission])) {
            // Special handling for admin-only permissions
            if (in_array($frontendPermission, ['view_predective_data'])) {
                return response()->json([
                    'permission' => $frontendPermission,
                    'has_permission' => false // Only admin has these permissions
                ]);
            }
        }

        // For permissions that have a backend mapping
        $backendPermission = $permissionMap[$frontendPermission] ?? $frontendPermission;
        $hasPermission = $request->user()->hasPermission($backendPermission);

        return response()->json([
            'permission' => $frontendPermission,
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

        // Map Laravel permissions to frontend expected format
        $permissionMap = [
            'view-dashboard' => 'view_dashboard',
            'view-mining-map' => 'view_all_mines',
            'view-sensor-data' => 'view_sensors',
            'manage-sensors' => 'manage_sensors',
            'view-reports' => 'view_reports',
            'generate-reports' => 'generate_reports',
            'manage-users' => 'manage_users',
            'manage-roles' => 'manage_roles',
            'view-alerts' => 'view_alerts',
            'manage-alerts' => 'manage_alerts',
        ];

        // If admin, return frontend-style admin permissions
        if ($user->isAdmin()) {
            return response()->json([
                'permissions' => [
                    'view_all_mines',
                    'manage_users',
                    'view_reports',
                    'view_sensors',
                    'view_predective_data'
                ]
            ]);
        }

        // Otherwise get permissions from user's role
        $role = \App\Models\Role::where('slug', $user->role)->first();
        if (!$role) {
            return response()->json([
                'permissions' => []
            ]);
        }

        $backendPermissions = $role->permissions->pluck('slug')->toArray();
        $frontendPermissions = [];

        // Map backend permissions to frontend format
        foreach ($backendPermissions as $permission) {
            if (isset($permissionMap[$permission])) {
                $frontendPermissions[] = $permissionMap[$permission];
            }
        }

        return response()->json([
            'permissions' => $frontendPermissions
        ]);
    }
}
