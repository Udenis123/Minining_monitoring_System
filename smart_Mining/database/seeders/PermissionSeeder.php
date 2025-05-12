<?php

namespace Database\Seeders;

use App\Models\Permission;
use Illuminate\Database\Seeder;

class PermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Define default permissions
        $permissions = [
            [
                'name' => 'View Dashboard',
                'slug' => 'view-dashboard',
                'description' => 'Can view the main dashboard'
            ],
            [
                'name' => 'View Mining Map',
                'slug' => 'view-mining-map',
                'description' => 'Can view the mining map'
            ],
            [
                'name' => 'View Sensor Data',
                'slug' => 'view-sensor-data',
                'description' => 'Can view sensor data'
            ],
            [
                'name' => 'Manage Sensors',
                'slug' => 'manage-sensors',
                'description' => 'Can manage sensors (add, edit, delete)'
            ],
            [
                'name' => 'View Reports',
                'slug' => 'view-reports',
                'description' => 'Can view mining reports'
            ],
            [
                'name' => 'Generate Reports',
                'slug' => 'generate-reports',
                'description' => 'Can generate reports'
            ],
            [
                'name' => 'Manage Users',
                'slug' => 'manage-users',
                'description' => 'Can manage users (add, edit, delete)'
            ],
            [
                'name' => 'Manage Roles',
                'slug' => 'manage-roles',
                'description' => 'Can manage roles and permissions'
            ],
            [
                'name' => 'View Alerts',
                'slug' => 'view-alerts',
                'description' => 'Can view system alerts'
            ],
            [
                'name' => 'Manage Alerts',
                'slug' => 'manage-alerts',
                'description' => 'Can manage alerts (acknowledge, resolve)'
            ],
        ];

        // Create each permission if it doesn't exist
        foreach ($permissions as $permission) {
            Permission::updateOrCreate(
                ['slug' => $permission['slug']],
                [
                    'name' => $permission['name'],
                    'description' => $permission['description']
                ]
            );
        }

        $this->command->info('Default permissions created successfully.');
    }
}
