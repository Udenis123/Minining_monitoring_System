<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('sensors', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sector_id')->constrained()->onDelete('cascade');
            $table->enum('type', ['gas', 'temperature', 'seismic', 'strain']);
            $table->string('location');
            $table->decimal('latitude', 10, 8);
            $table->decimal('longitude', 11, 8);
            $table->enum('status', ['active', 'inactive', 'maintenance'])->default('active');
            $table->timestamp('installation_date')->useCurrent();
            $table->timestamp('last_calibration')->useCurrent();
            $table->string('model');
            $table->string('range');
            $table->string('accuracy');
            $table->string('manufacturer');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('sensors');
    }
};
