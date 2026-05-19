<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Seed default facilities so the selector works in existing environments
     * where database seeders were not run manually.
     */
    public function up(): void
    {
        $now = now();

        $facilities = [
            ['name' => 'Free WiFi', 'icon' => 'wifi', 'category' => 'Connectivity', 'scope' => 'both'],
            ['name' => 'Free parking', 'icon' => 'parking', 'category' => 'Parking', 'scope' => 'property'],
            ['name' => 'Kitchen', 'icon' => 'kitchen', 'category' => 'Kitchen', 'scope' => 'both'],
            ['name' => 'Air conditioning', 'icon' => 'air-conditioner', 'category' => 'Comfort', 'scope' => 'both'],
            ['name' => 'Swimming pool', 'icon' => 'water-ladder', 'category' => 'Leisure', 'scope' => 'property'],
            ['name' => 'Room service', 'icon' => 'bell-concierge', 'category' => 'Service', 'scope' => 'property'],
            ['name' => 'Non-smoking rooms', 'icon' => 'ban-smoking', 'category' => 'Policy', 'scope' => 'both'],
            ['name' => 'Family rooms', 'icon' => 'people-roof', 'category' => 'Room', 'scope' => 'both'],
            ['name' => 'Facilities for disabled guests', 'icon' => 'wheelchair', 'category' => 'Accessibility', 'scope' => 'both'],
            ['name' => 'Washing machine', 'icon' => 'soap', 'category' => 'Laundry', 'scope' => 'both'],
            ['name' => 'TV', 'icon' => 'tv', 'category' => 'Entertainment', 'scope' => 'unit'],
            ['name' => 'Private bathroom', 'icon' => 'bath', 'category' => 'Bathroom', 'scope' => 'unit'],
            ['name' => 'Balcony', 'icon' => 'door-open', 'category' => 'Outdoor', 'scope' => 'unit'],
            ['name' => 'BBQ area', 'icon' => 'fire-burner', 'category' => 'Outdoor', 'scope' => 'property'],
        ];

        foreach ($facilities as $facility) {
            DB::table('facilities')->updateOrInsert(
                ['name' => $facility['name']],
                [
                    'icon' => $facility['icon'],
                    'category' => $facility['category'],
                    'scope' => $facility['scope'],
                    'created_at' => $now,
                    'updated_at' => $now,
                ]
            );
        }
    }

    public function down(): void
    {
        DB::table('facilities')->whereIn('name', [
            'Free WiFi',
            'Free parking',
            'Kitchen',
            'Air conditioning',
            'Swimming pool',
            'Room service',
            'Non-smoking rooms',
            'Family rooms',
            'Facilities for disabled guests',
            'Washing machine',
            'TV',
            'Private bathroom',
            'Balcony',
            'BBQ area',
        ])->delete();
    }
};
