<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('guests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('owner_id')->constrained('owners')->cascadeOnDelete();
            $table->string('full_name', 100);
            $table->string('phone', 15);
            $table->string('email', 254)->nullable();
            $table->string('identification_number', 50)->nullable();
            $table->timestamps();

            $table->index('owner_id');
            $table->unique(['owner_id', 'phone']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('guests');
    }
};
