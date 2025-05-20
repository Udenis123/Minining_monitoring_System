<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Mine extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'location',
        'status',
        'area_number',
        'latitude',
        'longitude',
        'depth',
        'description'
    ];

    protected $casts = [
        'depth' => 'float',
        'latitude' => 'float',
        'longitude' => 'float',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    public function sectors()
    {
        return $this->hasMany(Sector::class);
    }
}
