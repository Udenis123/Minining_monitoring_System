<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

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

    /**
     * Send reset password verification code to user's email
     */
    public function sendResetPasswordCode(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        // Check if user exists
        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        // Generate 6-digit code
        $resetCode = sprintf('%06d', mt_rand(1, 999999));

        // Set expiration time (30 minutes from now)
        $expiresAt = Carbon::now()->addMinutes(30);

        // Save code and expiration to user
        $user->reset_password_code = $resetCode;
        $user->reset_password_code_expires_at = $expiresAt;
        $user->save();

        // Send email with code
        try {
            // Turn on error reporting
            ini_set('display_errors', 1);
            error_reporting(E_ALL);

            // Temporarily disable SSL verification for testing
            $previousValue = ini_get('openssl.cafile');
            ini_set('openssl.cafile', '');

            $details = [
                'title' => 'Password Reset Verification Code',
                'code' => $resetCode,
                'name' => $user->name
            ];

            // Log attempt
            \Log::info('Attempting to send email to: ' . $user->email);

            config(['mail.mailers.smtp.verify_peer' => false]);
            config(['mail.mailers.smtp.verify_peer_name' => false]);

            Mail::send('emails.reset-password-code', $details, function($message) use ($user) {
                $message->to($user->email)
                        ->subject('Password Reset Verification Code')
                        ->from('denisdideho@gmail.com', 'Smart Mining System');
            });

            // Restore SSL settings
            ini_set('openssl.cafile', $previousValue);

            \Log::info('Successfully sent email to: ' . $user->email);

            return response()->json([
                'message' => 'Password reset code sent to your email',
                'expires_at' => $expiresAt
            ]);

        } catch (\Exception $e) {
            // Log the full exception details
            \Log::error('Mail sending error: ' . $e->getMessage());
            \Log::error($e->getTraceAsString());

            return response()->json([
                'message' => 'Failed to send reset code email',
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ], 500);
        }
    }

    /**
     * Verify password reset code
     */
    public function verifyResetCode(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'code' => 'required|string|size:6',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        // Check if the code exists and is not expired
        if (!$user->reset_password_code) {
            return response()->json(['message' => 'No reset code found. Please request a new code.'], 400);
        }

        if (Carbon::parse($user->reset_password_code_expires_at)->isPast()) {
            return response()->json(['message' => 'Reset code has expired. Please request a new code.'], 400);
        }

        // Verify the code
        if ($user->reset_password_code !== $request->code) {
            return response()->json(['message' => 'Invalid reset code.'], 400);
        }

        return response()->json(['message' => 'Code verified successfully']);
    }

    /**
     * Reset password with verified code
     */
    public function resetPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'code' => 'required|string|size:6',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        // Check if the code exists and is not expired
        if (!$user->reset_password_code) {
            return response()->json(['message' => 'No reset code found. Please request a new code.'], 400);
        }

        if (Carbon::parse($user->reset_password_code_expires_at)->isPast()) {
            return response()->json(['message' => 'Reset code has expired. Please request a new code.'], 400);
        }

        // Verify the code
        if ($user->reset_password_code !== $request->code) {
            return response()->json(['message' => 'Invalid reset code.'], 400);
        }

        // Update the password
        $user->password = Hash::make($request->password);

        // Clear the reset code
        $user->reset_password_code = null;
        $user->reset_password_code_expires_at = null;

        $user->save();

        return response()->json(['message' => 'Password has been reset successfully']);
    }
}
