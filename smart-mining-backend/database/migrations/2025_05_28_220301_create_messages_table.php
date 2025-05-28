<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('messages', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('sender_id');
            $table->unsignedBigInteger('recipient_id');
            $table->text('content');
            $table->timestamp('read_at')->nullable();
            $table->boolean('is_deleted_by_sender')->default(false);
            $table->boolean('is_deleted_by_recipient')->default(false);
            $table->timestamps();

            // Foreign keys
            $table->foreign('sender_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('recipient_id')->references('id')->on('users')->onDelete('cascade');

            // Indexes for faster queries
            $table->index('sender_id');
            $table->index('recipient_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('messages');
    }
};
