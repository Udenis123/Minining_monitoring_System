<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DemoUsersSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Define demo users that match the frontend mock data
        $demoUsers = [
            [
                'name' => 'Admin User',
                'email' => 'admin@example.com',
                'password' => 'admin123',
                'role' => 'admin',
            ],
            [
                'name' => 'Manager User',
                'email' => 'manager@example.com',
                'password' => 'manager123',
                'role' => 'manager',
            ],
            [
                'name' => 'Regular User',
                'email' => 'user@example.com',
                'password' => 'user123',
                'role' => 'user',
            ]
        ];

        foreach ($demoUsers as $userData) {
            // Check if user exists
            $userExists = User::where('email', $userData['email'])->exists();

            if (!$userExists) {
                User::create([
                    'name' => $userData['name'],
                    'email' => $userData['email'],
                    'password' => Hash::make($userData['password']),
                    'role' => $userData['role'],
                    'is_approved' => true,
                    'email_verified_at' => now() // Pre-verify demo users
                ]);

                $this->command->info("Demo user {$userData['email']} created successfully.");
            } else {
                $this->command->info("Demo user {$userData['email']} already exists.");
            }
        }
    }
}
