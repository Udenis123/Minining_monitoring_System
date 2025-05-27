<?php

namespace App\Http\Controllers;

use App\Models\UserLog;
use App\Services\LogService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use App\Http\Resources\UserLogResource;

class UserLogController extends Controller
{
    /**
     * Get all user logs with pagination
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        // Only log this view action if not explicitly excluded
        $exclude_self_logging = $request->query('no_log', false);
        if (!$exclude_self_logging) {
            LogService::viewLog('UserLog');
        }

        // Get query parameters for filtering
        $user_id = $request->query('user_id');
        $action = $request->query('action');
        $entity_type = $request->query('entity_type');
        $entity_id = $request->query('entity_id');
        $from_date = $request->query('from_date');
        $to_date = $request->query('to_date');
        $per_page = $request->query('per_page', 15);
        $exclude_entity = $request->query('exclude_entity');
        $exclude_action = $request->query('exclude_action');

        // Start with a base query
        $query = UserLog::with('user')
            ->orderBy('created_at', 'desc');

        // Apply filters if provided
        if ($user_id) {
            $query->where('user_id', $user_id);
        }

        if ($action) {
            $query->where('action', $action);
        }

        if ($entity_type) {
            $query->where('entity_type', $entity_type);
        }

        if ($entity_id) {
            $query->where('entity_id', $entity_id);
        }

        if ($from_date) {
            $query->whereDate('created_at', '>=', $from_date);
        }

        if ($to_date) {
            $query->whereDate('created_at', '<=', $to_date);
        }

        // Exclude logs if specified
        if ($exclude_entity && $exclude_action) {
            $query->where(function($q) use ($exclude_entity, $exclude_action) {
                $q->where('entity_type', '!=', $exclude_entity)
                  ->orWhere('action', '!=', $exclude_action);
            });
        }

        // Exclude "Viewed UserLog list" logs specifically
        $query->where(function($q) {
            $q->where('entity_type', '!=', 'UserLog')
              ->orWhere('action', '!=', 'view')
              ->orWhere('description', '!=', 'Viewed UserLog list');
        });

        // Paginate the results
        $logs = $query->paginate($per_page);

        return response()->json([
            'success' => true,
            'data' => UserLogResource::collection($logs),
            'meta' => [
                'current_page' => $logs->currentPage(),
                'from' => $logs->firstItem(),
                'last_page' => $logs->lastPage(),
                'path' => $logs->path(),
                'per_page' => $logs->perPage(),
                'to' => $logs->lastItem(),
                'total' => $logs->total(),
            ],
            'message' => 'User logs retrieved successfully'
        ]);
    }

    /**
     * Get logs for the authenticated user
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function myLogs(Request $request): JsonResponse
    {
        // Only log this view action if not explicitly excluded
        $exclude_self_logging = $request->query('no_log', false);
        if (!$exclude_self_logging) {
            LogService::viewLog('UserLog');
        }

        $per_page = $request->query('per_page', 15);
        $query = UserLog::where('user_id', Auth::id())
            ->orderBy('created_at', 'desc');
        
        // Exclude "Viewed UserLog list" logs specifically
        $query->where(function($q) {
            $q->where('entity_type', '!=', 'UserLog')
              ->orWhere('action', '!=', 'view')
              ->orWhere('description', '!=', 'Viewed UserLog list');
        });
        
        $logs = $query->paginate($per_page);

        return response()->json([
            'success' => true,
            'data' => UserLogResource::collection($logs),
            'meta' => [
                'current_page' => $logs->currentPage(),
                'from' => $logs->firstItem(),
                'last_page' => $logs->lastPage(),
                'path' => $logs->path(),
                'per_page' => $logs->perPage(),
                'to' => $logs->lastItem(),
                'total' => $logs->total(),
            ],
            'message' => 'Your logs retrieved successfully'
        ]);
    }

    /**
     * Get logs by specific action type
     *
     * @param Request $request
     * @param string $action
     * @return JsonResponse
     */
    public function getByAction(Request $request, string $action): JsonResponse
    {
        // Only log this view action if not explicitly excluded
        $exclude_self_logging = $request->query('no_log', false);
        if (!$exclude_self_logging) {
            LogService::viewLog('UserLog');
        }

        $per_page = $request->query('per_page', 15);
        $query = UserLog::where('action', $action)
            ->with('user')
            ->orderBy('created_at', 'desc');
        
        // If action is 'view', exclude UserLog views
        if ($action === 'view') {
            $query->where(function($q) {
                $q->where('entity_type', '!=', 'UserLog')
                  ->orWhere('description', '!=', 'Viewed UserLog list');
            });
        }
        
        $logs = $query->paginate($per_page);

        return response()->json([
            'success' => true,
            'data' => UserLogResource::collection($logs),
            'meta' => [
                'current_page' => $logs->currentPage(),
                'from' => $logs->firstItem(),
                'last_page' => $logs->lastPage(),
                'path' => $logs->path(),
                'per_page' => $logs->perPage(),
                'to' => $logs->lastItem(),
                'total' => $logs->total(),
            ],
            'message' => "{$action} logs retrieved successfully"
        ]);
    }

    /**
     * Get logs for a specific entity
     *
     * @param Request $request
     * @param string $entityType
     * @param int $entityId
     * @return JsonResponse
     */
    public function getEntityLogs(
        Request $request,
        string $entityType,
        int $entityId
    ): JsonResponse {
        // Only log this view action if not explicitly excluded
        $exclude_self_logging = $request->query('no_log', false);
        if (!$exclude_self_logging) {
            LogService::viewLog('UserLog');
        }

        $per_page = $request->query('per_page', 15);
        $logs = UserLog::where('entity_type', $entityType)
            ->where('entity_id', $entityId)
            ->with('user')
            ->orderBy('created_at', 'desc')
            ->paginate($per_page);

        return response()->json([
            'success' => true,
            'data' => UserLogResource::collection($logs),
            'meta' => [
                'current_page' => $logs->currentPage(),
                'from' => $logs->firstItem(),
                'last_page' => $logs->lastPage(),
                'path' => $logs->path(),
                'per_page' => $logs->perPage(),
                'to' => $logs->lastItem(),
                'total' => $logs->total(),
            ],
            'message' => "{$entityType} logs retrieved successfully"
        ]);
    }

    /**
     * Get a summary of activity (count by action type)
     *
     * @return JsonResponse
     */
    public function getActivitySummary(): JsonResponse
    {
        // Only log this view action if not explicitly excluded
        $exclude_self_logging = request()->query('no_log', false);
        if (!$exclude_self_logging) {
            LogService::viewLog('UserLog');
        }

        // Exclude UserLog view actions from the summary
        $summary = UserLog::selectRaw('action, COUNT(*) as count')
            ->where(function($q) {
                $q->where('entity_type', '!=', 'UserLog')
                  ->orWhere('action', '!=', 'view')
                  ->orWhere('description', '!=', 'Viewed UserLog list');
            })
            ->groupBy('action')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $summary,
            'message' => 'Activity summary retrieved successfully'
        ]);
    }
}
