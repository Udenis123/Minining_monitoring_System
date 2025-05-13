<?php

/*
SUGGESTED CHANGES TO UserController.php

In the getAllUsers method, add the role_id to the user data response:
*/

public function getAllUsers()
{
    $users = User::with('role')->get();

    return response()->json([
        'users' => $users->map(function($user) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role ? $user->role->role_name : null,
                'role_id' => $user->role_id,
                'permissions' => $user->permissions()
            ];
        })
    ]);
}

/*
Similarly, update all other methods that return user data to include role_id:
*/

// Update in createUser method
return response()->json([
    'message' => 'User created successfully',
    'user' => [
        'id' => $user->id,
        'name' => $user->name,
        'email' => $user->email,
        'role' => $user->role->role_name,
        'role_id' => $user->role_id,
        'permissions' => $user->permissions()
    ]
], 201);

// Update in updateUserRole method
return response()->json([
    'message' => 'User role updated successfully',
    'user' => [
        'id' => $user->id,
        'name' => $user->name,
        'email' => $user->email,
        'role' => $user->role->role_name,
        'role_id' => $user->role_id,
        'permissions' => $user->permissions()
    ]
]);

// Update in updateUser method
return response()->json([
    'message' => 'User updated successfully',
    'user' => [
        'id' => $user->id,
        'name' => $user->name,
        'email' => $user->email,
        'role' => $user->role ? $user->role->role_name : null,
        'role_id' => $user->role_id,
        'permissions' => $user->permissions()
    ]
]); 