<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\Permission;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Define default roles with permissions
        $roles = [
            [
                'name' => 'Administrator',
                'slug' => 'admin',
                'description' => 'Administrator with all permissions',
                'permissions' => [
                    'view-dashboard', 'view-mining-map', 'view-sensor-data',
                    'manage-sensors', 'view-reports', 'generate-reports',
                    'manage-users', 'manage-roles', 'view-alerts', 'manage-alerts'
                ]
            ],
            [
                'name' => 'Manager',
                'slug' => 'manager',
                'description' => 'Mining operation manager',
                'permissions' => [
                    'view-dashboard', 'view-mining-map', 'view-sensor-data',
                    'manage-sensors', 'view-reports', 'generate-reports',
                    'view-alerts', 'manage-alerts'
                ]
            ],
            [
                'name' => 'User',
                'slug' => 'user',
                'description' => 'Regular system user',
                'permissions' => [
                    'view-dashboard', 'view-mining-map', 'view-sensor-data',
                    'view-reports', 'view-alerts'
                ]
            ]
        ];

        // Create roles if they don't exist and attach permissions
        foreach ($roles as $roleData) {
            $role = Role::updateOrCreate(
                ['slug' => $roleData['slug']],
                [
                    'name' => $roleData['name'],
                    'description' => $roleData['description']
                ]
            );

            // Get permission IDs
            $permissions = Permission::whereIn('slug', $roleData['permissions'])->get();

            // Sync permissions for this role
            $role->permissions()->sync($permissions->pluck('id')->toArray());
        }

        $this->command->info('Default roles created successfully.');
    }
}
