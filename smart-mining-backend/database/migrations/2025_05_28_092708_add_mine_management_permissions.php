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
        // Define the mine management permissions
        $permissions = [
            'create_mine',
            'edit_mine',
            'delete_mine',
            'manage_mines',
            'create_sector',
            'edit_sector',
            'delete_sector',
            'manage_sectors',
            'create_sensor',
            'edit_sensor',
            'delete_sensor',
            'manage_sensors',
        ];

        // Add each permission to the database
        foreach ($permissions as $permissionName) {
            Permission::firstOrCreate(['permission_name' => $permissionName]);
        }

        // Get the admin role
        $adminRole = Role::where('role_name', 'admin')->first();

        if ($adminRole) {
            // Get all new permissions
            $minePermissions = Permission::whereIn('permission_name', $permissions)->get();

            // Add these permissions to the admin role (without removing existing ones)
            $currentPermissions = $adminRole->permissions()->pluck('permissions.id')->toArray();
            $newPermissions = array_merge($currentPermissions, $minePermissions->pluck('id')->toArray());
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
            'create_mine',
            'edit_mine',
            'delete_mine',
            'manage_mines',
            'create_sector',
            'edit_sector',
            'delete_sector',
            'manage_sectors',
            'create_sensor',
            'edit_sensor',
            'delete_sensor',
            'manage_sensors',
        ];

        Permission::whereIn('permission_name', $permissions)->delete();
    }
};
