<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('maintenance_tasks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('owner_id')->constrained('owners')->cascadeOnDelete();
            $table->foreignId('property_id')->nullable()->constrained('properties')->nullOnDelete();
            $table->foreignId('unit_id')->nullable()->constrained('units')->nullOnDelete();
            $table->foreignId('service_provider_id')->nullable()->constrained('service_providers')->nullOnDelete();
            $table->string('title', 200);
            $table->text('description')->nullable();
            $table->string('priority', 10); // low, medium, high
            $table->string('status', 20)->default('open'); // open, in_progress, completed, cancelled
            $table->date('scheduled_date')->nullable();
            $table->timestamps();

            $table->index('owner_id');
            $table->index('property_id');
            $table->index('unit_id');
            $table->index('service_provider_id');
        });

        // Add FK constraint from expenses.maintenance_task_id to maintenance_tasks.id
        Schema::table('expenses', function (Blueprint $table) {
            $table->foreign('maintenance_task_id')
                ->references('id')
                ->on('maintenance_tasks')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('expenses', function (Blueprint $table) {
            $table->dropForeign(['maintenance_task_id']);
        });

        Schema::dropIfExists('maintenance_tasks');
    }
};
