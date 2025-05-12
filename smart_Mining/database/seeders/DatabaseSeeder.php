<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Run seeders in the correct order
        $this->call([
            PermissionSeeder::class,
            RoleSeeder::class,
            AdminUserSeeder::class,
            DemoUsersSeeder::class,
        ]);

        // Create a demo user if needed
        if (!User::where('email', 'demo@smartmining.com')->exists()) {
            User::factory()->create([
                'name' => 'Demo User',
                'email' => 'demo@smartmining.com',
                'password' => bcrypt('demo123'),
                'role' => 'user',
                'is_approved' => true,
                'email_verified_at' => now()
            ]);
        }
    }
}
