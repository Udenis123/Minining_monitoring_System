<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Models\Permission;
use App\Models\Role;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Define the messaging permissions
        $permissions = [
            'access_messaging',
            'send_messages',
            'read_messages',
            'delete_messages'
        ];

        // Add each permission to the database
        foreach ($permissions as $permissionName) {
            Permission::firstOrCreate(['permission_name' => $permissionName]);
        }

        // Get the admin role
        $adminRole = Role::where('role_name', 'admin')->first();

        if ($adminRole) {
            // Get all new permissions
            $messagingPermissions = Permission::whereIn('permission_name', $permissions)->get();

            // Add these permissions to the admin role (without removing existing ones)
            $currentPermissions = $adminRole->permissions()->pluck('permissions.id')->toArray();
            $newPermissions = array_merge($currentPermissions, $messagingPermissions->pluck('id')->toArray());
            $adminRole->permissions()->sync($newPermissions);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Remove the added permissions
        $permissions = [
            'access_messaging',
            'send_messages',
            'read_messages',
            'delete_messages'
        ];

        Permission::whereIn('permission_name', $permissions)->delete();
    }
};
