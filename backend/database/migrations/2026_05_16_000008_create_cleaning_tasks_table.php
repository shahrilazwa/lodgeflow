<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cleaning_tasks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('owner_id')->constrained('owners')->cascadeOnDelete();
            $table->foreignId('unit_id')->constrained('units')->cascadeOnDelete();
            $table->foreignId('booking_id')->nullable()->constrained('bookings')->nullOnDelete();
            $table->string('status', 20)->default('pending');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index('owner_id');
            $table->index('unit_id');
            $table->index('booking_id');
        });

        // Add FK constraint from expenses.cleaning_task_id to cleaning_tasks.id
        Schema::table('expenses', function (Blueprint $table) {
            $table->foreign('cleaning_task_id')
                ->references('id')
                ->on('cleaning_tasks')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('expenses', function (Blueprint $table) {
            $table->dropForeign(['cleaning_task_id']);
        });

        Schema::dropIfExists('cleaning_tasks');
    }
};
