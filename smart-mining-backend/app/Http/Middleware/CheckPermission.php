<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CheckPermission
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @param  string  $permission
     * @return mixed
     */
    public function handle(Request $request, Closure $next, $permission)
    {
        // Check if user is authenticated
        if (!Auth::check()) {
            return response()->json(['message' => 'Unauthorized. Please login.'], 401);
        }

        // Check if user has the required permission
        if (!Auth::user()->permissions || !in_array($permission, Auth::user()->permissions)) {
            return response()->json(['message' => 'Unauthorized. Missing permission: ' . $permission], 403);
        }

        return $next($request);
    }
}
