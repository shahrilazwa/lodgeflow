<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('units', function (Blueprint $table) {
            $table->unsignedInteger('max_occupancy')->nullable();
            $table->string('occupancy_source', 20)->default('calculated');
        });

        Schema::create('unit_beds', function (Blueprint $table) {
            $table->id();
            $table->foreignId('unit_id')->constrained()->cascadeOnDelete();
            $table->string('bed_type', 50);
            $table->unsignedInteger('quantity');
            $table->unsignedInteger('capacity_per_bed');
            $table->timestamps();

            $table->index(['unit_id', 'bed_type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('unit_beds');

        Schema::table('units', function (Blueprint $table) {
            $table->dropColumn(['max_occupancy', 'occupancy_source']);
        });
    }
};
