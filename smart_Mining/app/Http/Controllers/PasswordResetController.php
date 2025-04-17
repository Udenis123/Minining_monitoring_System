<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Hash;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;
use App\Mail\ResetPasswordMail;
use Illuminate\Support\Facades\Mail;

class PasswordResetController extends Controller
{
    public function forgotPassword(Request $request)
    {
        try {
            $request->validate(['email' => 'required|email|exists:users,email']);

            $token = Password::createToken(
                Password::getUser($request->only('email'))
            );

            Mail::to($request->email)
                ->send(new ResetPasswordMail($token, $request->email));

            Log::info('Password reset email sent to: ' . $request->email);
            return response()->json('Password reset link sent to your email');

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json($e->errors()['email'][0], 400);
        } catch (\Exception $e) {
            Log::error('Password reset error: ' . $e->getMessage());
            return response()->json('An error occurred while processing your request', 500);
        }
    }

    // Show the reset password form
    public function showResetForm(Request $request, $token)
    {
        return view('auth.reset-password', [
            'token' => $token,
            'email' => $request->email
        ]);
    }

    public function resetPassword(Request $request)
    {
        try {
            $request->validate([
                'token' => 'required',
                'email' => 'required|email|exists:users,email',
                'password' => ['required', 'confirmed', \Illuminate\Validation\Rules\Password::defaults()],
            ]);

            $status = Password::reset(
                $request->only('email', 'password', 'password_confirmation', 'token'),
                function ($user, $password) {
                    $user->forceFill([
                        'password' => Hash::make($password)
                    ])->setRememberToken(Str::random(60));

                    $user->save();

                    event(new PasswordReset($user));
                }
            );

            if ($status === Password::PASSWORD_RESET) {
                if ($request->wantsJson()) {
                    return redirect()->route('login')->with('status', 'Password reset successfully');
                }
                return redirect()->route('login')->with('status', 'Password has been reset successfully');
            }

            $errorMessage = trans($status);
            if ($request->wantsJson()) {
                return response()->json($errorMessage, 400);
            }
            return back()->withErrors(['email' => $errorMessage]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            if ($request->wantsJson()) {
                return response()->json($e->errors(), 422);
            }
            return back()->withErrors($e->errors());
        } catch (\Exception $e) {
            Log::error('Password reset error: ' . $e->getMessage());
            if ($request->wantsJson()) {
                return response()->json('An error occurred while processing your request', 500);
            }
            return back()->with('error', 'An error occurred while resetting your password');
        }
    }
} 