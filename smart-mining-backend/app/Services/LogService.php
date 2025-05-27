<?php

namespace App\Services;

use App\Models\UserLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class LogService
{
    /**
     * Log a user action
     *
     * @param string $action The type of action (login, logout, create, update, delete, view)
     * @param string|null $entityType The type of entity affected (User, Mine, Sector, etc.)
     * @param int|null $entityId The ID of the entity affected
     * @param string|null $description A detailed description of the action
     * @param array|null $oldValues Previous values in case of update
     * @param array|null $newValues New values in case of update
     * @param Request|null $request The HTTP request (for IP and user agent)
     * @return UserLog
     */
    public static function log(
        string $action,
        ?string $entityType = null,
        ?int $entityId = null,
        ?string $description = null,
        ?array $oldValues = null,
        ?array $newValues = null,
        ?Request $request = null
    ): UserLog {
        $request = $request ?? request();
        
        return UserLog::create([
            'user_id' => Auth::id(),
            'action' => $action,
            'entity_type' => $entityType,
            'entity_id' => $entityId,
            'description' => $description,
            'old_values' => $oldValues,
            'new_values' => $newValues,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);
    }

    /**
     * Log a login action
     *
     * @param Request|null $request
     * @return UserLog
     */
    public static function loginLog(?Request $request = null): UserLog
    {
        return self::log(
            'login',
            'User',
            Auth::id(),
            'User logged in',
            null,
            null,
            $request
        );
    }

    /**
     * Log a logout action
     *
     * @param Request|null $request
     * @return UserLog
     */
    public static function logoutLog(?Request $request = null): UserLog
    {
        return self::log(
            'logout',
            'User',
            Auth::id(),
            'User logged out',
            null,
            null,
            $request
        );
    }

    /**
     * Log a create action
     *
     * @param string $entityType
     * @param int $entityId
     * @param array $newValues
     * @param Request|null $request
     * @return UserLog
     */
    public static function createLog(
        string $entityType,
        int $entityId,
        array $newValues,
        ?Request $request = null
    ): UserLog {
        return self::log(
            'create',
            $entityType,
            $entityId,
            "Created new {$entityType}",
            null,
            $newValues,
            $request
        );
    }

    /**
     * Log an update action
     *
     * @param string $entityType
     * @param int $entityId
     * @param array $oldValues
     * @param array $newValues
     * @param Request|null $request
     * @return UserLog
     */
    public static function updateLog(
        string $entityType,
        int $entityId,
        array $oldValues,
        array $newValues,
        ?Request $request = null
    ): UserLog {
        return self::log(
            'update',
            $entityType,
            $entityId,
            "Updated {$entityType}",
            $oldValues,
            $newValues,
            $request
        );
    }

    /**
     * Log a delete action
     *
     * @param string $entityType
     * @param int $entityId
     * @param array $oldValues
     * @param Request|null $request
     * @return UserLog
     */
    public static function deleteLog(
        string $entityType,
        int $entityId,
        array $oldValues,
        ?Request $request = null
    ): UserLog {
        return self::log(
            'delete',
            $entityType,
            $entityId,
            "Deleted {$entityType}",
            $oldValues,
            null,
            $request
        );
    }

    /**
     * Log a view action
     *
     * @param string $entityType
     * @param int|null $entityId
     * @param Request|null $request
     * @return UserLog
     */
    public static function viewLog(
        string $entityType,
        ?int $entityId = null,
        ?Request $request = null
    ): UserLog {
        $description = $entityId 
            ? "Viewed {$entityType} with ID {$entityId}" 
            : "Viewed {$entityType} list";
            
        return self::log(
            'view',
            $entityType,
            $entityId,
            $description,
            null,
            null,
            $request
        );
    }
} 