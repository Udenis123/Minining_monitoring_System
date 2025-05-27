<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use App\Models\Permission;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class PermissionsRolesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create permissions
        $permissions = [
            'view_all_mines',
            'manage_users',
            'view_reports',
            'view_sensors',
            'view_predective_data'
        ];

        foreach ($permissions as $permissionName) {
            Permission::updateOrCreate(['permission_name' => $permissionName]);
        }

        // Create admin role
        $adminRole = Role::updateOrCreate(
            ['role_name' => 'admin'],
        );

        // Attach all permissions to admin role
        $allPermissions = Permission::all();
        $adminRole->permissions()->sync($allPermissions);

        // Create admin user if not exists
        if (!User::where('email', 'admin@smartmining.com')->exists()) {
            $admin = User::create([
                'name' => 'Admin',
                'email' => 'admin@smartmining.com',
                'password' => Hash::make('denis123'),
                'role_id' => $adminRole->id,
                'email_verified_at' => now()
            ]);
        } else {
            // Update existing admin user with the new role
            $admin = User::where('email', 'admin@smartmining.com')->first();
            $admin->role_id = $adminRole->id;
            $admin->save();
        }
    }
}
