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
        Schema::table('users', function (Blueprint $table) {
            // Drop the existing role column if it exists
            if (Schema::hasColumn('users', 'role')) {
                $table->dropColumn('role');
            }

            // Add role_id foreign key
            $table->unsignedBigInteger('role_id')->nullable();
            $table->foreign('role_id')->references('id')->on('roles')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Drop the foreign key
            $table->dropForeign(['role_id']);
            $table->dropColumn('role_id');

            // Add back the role column
            $table->string('role')->default('user');
        });
    }
};
