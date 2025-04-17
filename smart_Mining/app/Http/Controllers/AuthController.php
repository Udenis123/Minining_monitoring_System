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
            ]);

            try {
                $verificationUrl = url('/api/email/verify/' . $user->id . '/' . sha1($user->email));
                Mail::to($user->email)->send(new VerificationEmail($verificationUrl));
                Log::info('Verification email sent successfully to: ' . $user->email);
            } catch (\Exception $e) {
                Log::error('Failed to send verification email: ' . $e->getMessage());
                // Don't expose the error to the user, but log it
            }

            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json('Registration successful! Please check your email for verification link.', 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json($e->errors(), 422);
        } catch (\Exception $e) {
            Log::error('Registration error: ' . $e->getMessage());
            return response()->json('An error occurred during registration. Please try again.', 500);
        }
    }

    // Login
    public function login(Request $request)
    {
        $validated = $request->validate([
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
        ]);

        if (!Auth::attempt($validated)) {
            return response()->json('Invalid login credentials', 401);
        }

        $user = User::where('email', $validated['email'])->first();

        if (!$user->hasVerifiedEmail()) {
            return response()->json('Please verify your email address first. Check your email for the verification link.', 403);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json('Logged in successfully');
    }

    // Logout
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json('Logged out successfully');
    }

    public function user(Request $request)
    {
        return response()->json($request->user());
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
}
