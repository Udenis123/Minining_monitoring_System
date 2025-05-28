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
        // Define the new user management permissions
        $permissions = [
            'view_user_logs',
            'edit_user',
            'create_user',
            'delete_user',
            'create_role',
            'manage_permissions'
        ];

        // Add each permission to the database
        foreach ($permissions as $permissionName) {
            Permission::firstOrCreate(['permission_name' => $permissionName]);
        }

        // Get the admin role
        $adminRole = Role::where('role_name', 'admin')->first();
        
        if ($adminRole) {
            // Get all permissions including the new ones
            $allPermissions = Permission::all();
            
            // Assign all permissions to the admin role
            $adminRole->permissions()->sync($allPermissions->pluck('id')->toArray());
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Remove the added permissions
        $permissions = [
            'view_user_logs',
            'edit_user',
            'create_user',
            'delete_user',
            'create_role',
            'manage_permissions'
        ];

        Permission::whereIn('permission_name', $permissions)->delete();
    }
};
