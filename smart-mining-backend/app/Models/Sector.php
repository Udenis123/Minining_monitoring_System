<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Sector extends Model
{
    use HasFactory;

    protected $fillable = [
        'mine_id',
        'name',
        'level',
        'status'
    ];

    protected $casts = [
        'level' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    public function mine()
    {
        return $this->belongsTo(Mine::class);
    }

    public function sensors()
    {
        return $this->hasMany(Sensor::class);
    }
}
