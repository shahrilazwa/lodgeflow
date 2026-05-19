<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->boolean('allow_customer_cancellation')->default(false)->after('net_paid_amount');
            $table->boolean('allow_customer_modification')->default(false)->after('allow_customer_cancellation');
        });
    }

    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropColumn(['allow_customer_cancellation', 'allow_customer_modification']);
        });
    }
};
