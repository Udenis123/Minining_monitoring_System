<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('sectors', function (Blueprint $table) {
            $table->id();
            $table->foreignId('mine_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->integer('level');
            $table->enum('status', ['active', 'maintenance', 'emergency']);
            $table->timestamps();

            // Ensure level is unique per mine
            $table->unique(['mine_id', 'level']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('sectors');
    }
};
