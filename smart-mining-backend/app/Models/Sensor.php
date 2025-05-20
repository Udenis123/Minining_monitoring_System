<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Sensor extends Model
{
    use HasFactory;

    protected $fillable = [
        'sector_id',
        'type',
        'location',
        'latitude',
        'longitude',
        'status',
        'installation_date',
        'last_calibration',
        'model',
        'range',
        'accuracy',
        'manufacturer'
    ];

    protected $casts = [
        'latitude' => 'float',
        'longitude' => 'float',
        'installation_date' => 'datetime',
        'last_calibration' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    public function sector()
    {
        return $this->belongsTo(Sector::class);
    }
}
