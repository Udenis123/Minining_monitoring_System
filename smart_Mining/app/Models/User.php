<?php

namespace App\Models;

use Laravel\Sanctum\HasApiTokens;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role_id',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    /**
     * Get the role that owns the user
     */
    public function role()
    {
        return $this->belongsTo(Role::class);
    }

    /**
     * Get all permissions for the user via their role
     */
    public function permissions()
    {
        if ($this->role) {
            return $this->role->permissions()->pluck('permission_name')->toArray();
        }
        return [];
    }

    /**
     * Check if user is an admin - keeping for backward compatibility
     */
    public function isAdmin()
    {
        if ($this->role) {
            return $this->role->role_name === 'admin';
        }
        return false;
    }

    /**
     * Check if user has a specific role
     */
    public function hasRole($roleName)
    {
        if ($this->role) {
            return $this->role->role_name === $roleName;
        }
        return false;
    }

    /**
     * Check if user has a specific permission
     */
    public function hasPermission($permissionName)
    {
        if ($this->role) {
            return $this->role->permissions->contains('permission_name', $permissionName);
        }
        return false;
    }
}
