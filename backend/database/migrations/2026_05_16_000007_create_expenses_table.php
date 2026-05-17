<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('expenses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('owner_id')->constrained('owners')->cascadeOnDelete();
            $table->foreignId('property_id')->constrained('properties')->cascadeOnDelete();
            $table->foreignId('unit_id')->nullable()->constrained('units')->nullOnDelete();
            $table->foreignId('booking_id')->nullable()->constrained('bookings')->nullOnDelete();
            $table->foreignId('service_provider_id')->nullable()->constrained('service_providers')->nullOnDelete();
            // cleaning_task_id and maintenance_task_id: FK constraints will be added
            // when those tables are created in v0.5.0 (Tasks 5.1-5.4)
            $table->unsignedBigInteger('cleaning_task_id')->nullable();
            $table->unsignedBigInteger('maintenance_task_id')->nullable();
            $table->decimal('amount', 12, 2);
            $table->date('date');
            $table->string('category', 30);
            $table->text('description')->nullable();
            $table->timestamps();

            $table->index('owner_id');
            $table->index('property_id');
            $table->index('unit_id');
            $table->index('booking_id');
            $table->index('service_provider_id');
            $table->index('cleaning_task_id');
            $table->index('maintenance_task_id');
        });

        DB::statement('ALTER TABLE expenses ADD CONSTRAINT expenses_amount_positive CHECK (amount > 0)');
    }

    public function down(): void
    {
        Schema::dropIfExists('expenses');
    }
};
