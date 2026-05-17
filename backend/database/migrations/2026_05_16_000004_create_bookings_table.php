<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('owner_id')->constrained('owners')->cascadeOnDelete();
            $table->foreignId('unit_id')->constrained('units')->cascadeOnDelete();
            $table->foreignId('guest_id')->constrained('guests')->cascadeOnDelete();
            $table->date('check_in_date');
            $table->date('check_out_date');
            $table->decimal('total_amount', 12, 2);
            $table->string('status', 20)->default('confirmed');
            $table->string('payment_status', 20)->default('unpaid');
            $table->decimal('net_paid_amount', 12, 2)->default(0.00);
            $table->timestamps();

            $table->index('owner_id');
            $table->index('unit_id');
            $table->index('guest_id');
        });

        // Add CHECK constraint for PostgreSQL
        DB::statement('ALTER TABLE bookings ADD CONSTRAINT bookings_check_dates CHECK (check_out_date > check_in_date)');
    }

    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};
