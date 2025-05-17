<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\HelloController;
use Illuminate\Support\Facades\Mail;
use App\Http\Controllers\PasswordResetController;
use App\Http\Controllers\AuthController;

Route::get('/hello', [HelloController::class, 'index']);


// use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

// Password Reset Routes
Route::get('/reset-password/{token}', [PasswordResetController::class, 'showResetForm'])
    ->name('password.reset');
Route::post('/reset-password', [PasswordResetController::class, 'resetPassword'])
    ->name('password.update');
Route::post('/forgot-password', [PasswordResetController::class, 'forgotPassword'])
    ->name('password.email');
Route::get('/forgot-password', [PasswordResetController::class, 'showForgotPasswordForm'])
    ->name('password.request');

// Test email route
Route::get('/test-email', function () {
    try {
        Mail::raw('Test email from Smart Mining System', function ($message) {
            $message->to('murenzif01@gmail.com')
                   ->subject('Email Configuration Test');
        });
        return 'Test email sent successfully! Please check your inbox.';
    } catch (\Exception $e) {
        return 'Error sending email: ' . $e->getMessage();
    }
});

// Email Verification Routes
Route::get('/api/email/verify/{id}/{hash}', [AuthController::class, 'verifyEmail'])
    ->name('verification.verify');
Route::post('/api/email/resend', [AuthController::class, 'resendVerificationEmail'])
    ->middleware(['auth:sanctum'])
    ->name('verification.resend');
