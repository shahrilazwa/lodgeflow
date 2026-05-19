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
            ['name' => 'Bathtub', 'icon' => 'bath', 'category' => 'Bathroom', 'scope' => 'unit'],
            ['name' => 'Hair dryer', 'icon' => 'wind', 'category' => 'Bathroom', 'scope' => 'unit'],
            ['name' => 'Cleaning products', 'icon' => 'spray-can-sparkles', 'category' => 'Bathroom', 'scope' => 'both'],
            ['name' => 'Shampoo', 'icon' => 'pump-soap', 'category' => 'Bathroom', 'scope' => 'unit'],
            ['name' => 'Body soap', 'icon' => 'soap', 'category' => 'Bathroom', 'scope' => 'unit'],
            ['name' => 'Bidet', 'icon' => 'toilet', 'category' => 'Bathroom', 'scope' => 'unit'],
            ['name' => 'Hot water', 'icon' => 'hot-tub-person', 'category' => 'Bathroom', 'scope' => 'unit'],
            ['name' => 'Shower gel', 'icon' => 'pump-soap', 'category' => 'Bathroom', 'scope' => 'unit'],
            ['name' => 'Private bathroom', 'icon' => 'bath', 'category' => 'Bathroom', 'scope' => 'unit'],

            ['name' => 'Washer', 'icon' => 'soap', 'category' => 'Bedroom and laundry', 'scope' => 'both'],
            ['name' => 'Essentials', 'icon' => 'box-open', 'category' => 'Bedroom and laundry', 'scope' => 'unit'],
            ['name' => 'Towels, bed sheets, soap, and toilet paper', 'icon' => 'scroll', 'category' => 'Bedroom and laundry', 'scope' => 'unit'],
            ['name' => 'Hangers', 'icon' => 'shirt', 'category' => 'Bedroom and laundry', 'scope' => 'unit'],
            ['name' => 'Bed linens', 'icon' => 'bed', 'category' => 'Bedroom and laundry', 'scope' => 'unit'],
            ['name' => 'Room-darkening shades', 'icon' => 'window-maximize', 'category' => 'Bedroom and laundry', 'scope' => 'unit'],
            ['name' => 'Iron', 'icon' => 'shirt', 'category' => 'Bedroom and laundry', 'scope' => 'unit'],
            ['name' => 'Drying rack for clothing', 'icon' => 'shirt', 'category' => 'Bedroom and laundry', 'scope' => 'unit'],
            ['name' => 'Clothing storage', 'icon' => 'box-archive', 'category' => 'Bedroom and laundry', 'scope' => 'unit'],

            ['name' => 'TV', 'icon' => 'tv', 'category' => 'Entertainment', 'scope' => 'unit'],
            ['name' => 'Sound system', 'icon' => 'volume-high', 'category' => 'Entertainment', 'scope' => 'unit'],
            ['name' => 'Pool table', 'icon' => 'circle-dot', 'category' => 'Entertainment', 'scope' => 'property'],
            ['name' => 'Arcade games', 'icon' => 'gamepad', 'category' => 'Entertainment', 'scope' => 'property'],

            ['name' => 'Crib', 'icon' => 'baby', 'category' => 'Family', 'scope' => 'unit'],
            ['name' => 'Pack ’n play/Travel crib', 'icon' => 'baby', 'category' => 'Family', 'scope' => 'unit'],
            ['name' => 'Standalone high chair', 'icon' => 'chair', 'category' => 'Family', 'scope' => 'unit'],
            ['name' => 'High chair with food tray', 'icon' => 'chair', 'category' => 'Family', 'scope' => 'unit'],
            ['name' => 'Baby bath', 'icon' => 'baby', 'category' => 'Family', 'scope' => 'unit'],
            ['name' => 'Children’s dinnerware', 'icon' => 'utensils', 'category' => 'Family', 'scope' => 'unit'],
            ['name' => 'Window guards', 'icon' => 'shield-halved', 'category' => 'Family', 'scope' => 'unit'],
            ['name' => 'Family rooms', 'icon' => 'people-roof', 'category' => 'Family', 'scope' => 'both'],

            ['name' => 'Air conditioning', 'icon' => 'snowflake', 'category' => 'Heating and cooling', 'scope' => 'both'],
            ['name' => 'Ceiling fan', 'icon' => 'fan', 'category' => 'Heating and cooling', 'scope' => 'unit'],
            ['name' => 'Portable fans', 'icon' => 'fan', 'category' => 'Heating and cooling', 'scope' => 'unit'],

            ['name' => 'Free WiFi', 'icon' => 'wifi', 'category' => 'Internet and office', 'scope' => 'both'],
            ['name' => 'Dedicated workspace', 'icon' => 'briefcase', 'category' => 'Internet and office', 'scope' => 'unit'],

            ['name' => 'Kitchen', 'icon' => 'utensils', 'category' => 'Kitchen and dining', 'scope' => 'both'],
            ['name' => 'Refrigerator', 'icon' => 'box', 'category' => 'Kitchen and dining', 'scope' => 'unit'],
            ['name' => 'Microwave', 'icon' => 'box', 'category' => 'Kitchen and dining', 'scope' => 'unit'],
            ['name' => 'Cooking basics', 'icon' => 'utensils', 'category' => 'Kitchen and dining', 'scope' => 'unit'],
            ['name' => 'Dishes and silverware', 'icon' => 'utensils', 'category' => 'Kitchen and dining', 'scope' => 'unit'],
            ['name' => 'Stove', 'icon' => 'fire-burner', 'category' => 'Kitchen and dining', 'scope' => 'unit'],
            ['name' => 'Oven', 'icon' => 'fire-burner', 'category' => 'Kitchen and dining', 'scope' => 'unit'],
            ['name' => 'Hot water kettle', 'icon' => 'mug-hot', 'category' => 'Kitchen and dining', 'scope' => 'unit'],
            ['name' => 'Toaster', 'icon' => 'bread-slice', 'category' => 'Kitchen and dining', 'scope' => 'unit'],
            ['name' => 'Rice maker', 'icon' => 'bowl-rice', 'category' => 'Kitchen and dining', 'scope' => 'unit'],
            ['name' => 'Dining table', 'icon' => 'table', 'category' => 'Kitchen and dining', 'scope' => 'unit'],

            ['name' => 'Private entrance', 'icon' => 'door-open', 'category' => 'Location features', 'scope' => 'both'],
            ['name' => 'Resort access', 'icon' => 'umbrella-beach', 'category' => 'Location features', 'scope' => 'property'],

            ['name' => 'Backyard', 'icon' => 'tree', 'category' => 'Outdoor', 'scope' => 'property'],
            ['name' => 'BBQ grill', 'icon' => 'fire-burner', 'category' => 'Outdoor', 'scope' => 'property'],
            ['name' => 'Sun loungers', 'icon' => 'umbrella-beach', 'category' => 'Outdoor', 'scope' => 'property'],
            ['name' => 'Balcony', 'icon' => 'door-open', 'category' => 'Outdoor', 'scope' => 'unit'],

            ['name' => 'Free parking', 'icon' => 'parking', 'category' => 'Parking and facilities', 'scope' => 'property'],
            ['name' => 'Free street parking', 'icon' => 'parking', 'category' => 'Parking and facilities', 'scope' => 'property'],
            ['name' => 'Swimming pool', 'icon' => 'water-ladder', 'category' => 'Parking and facilities', 'scope' => 'property'],
            ['name' => 'Facilities for disabled guests', 'icon' => 'wheelchair', 'category' => 'Parking and facilities', 'scope' => 'both'],

            ['name' => 'Long term stays allowed', 'icon' => 'calendar-days', 'category' => 'Services', 'scope' => 'property'],
            ['name' => 'Self check-in', 'icon' => 'key', 'category' => 'Services', 'scope' => 'property'],
            ['name' => 'Lockbox', 'icon' => 'lock', 'category' => 'Services', 'scope' => 'property'],
            ['name' => 'Room service', 'icon' => 'bell-concierge', 'category' => 'Services', 'scope' => 'property'],

            ['name' => 'Exterior security cameras on property', 'icon' => 'video', 'category' => 'Home safety', 'scope' => 'property'],
            ['name' => 'Fire extinguisher', 'icon' => 'fire-extinguisher', 'category' => 'Home safety', 'scope' => 'both'],
            ['name' => 'First aid kit', 'icon' => 'kit-medical', 'category' => 'Home safety', 'scope' => 'both'],
            ['name' => 'Smoke alarm', 'icon' => 'smog', 'category' => 'Home safety', 'scope' => 'both'],
            ['name' => 'Carbon monoxide alarm', 'icon' => 'triangle-exclamation', 'category' => 'Home safety', 'scope' => 'both'],

            ['name' => 'Non-smoking rooms', 'icon' => 'ban-smoking', 'category' => 'Policy', 'scope' => 'both'],
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
            'Bathtub',
            'Hair dryer',
            'Cleaning products',
            'Shampoo',
            'Body soap',
            'Bidet',
            'Hot water',
            'Shower gel',
            'Private bathroom',
            'Washer',
            'Essentials',
            'Towels, bed sheets, soap, and toilet paper',
            'Hangers',
            'Bed linens',
            'Room-darkening shades',
            'Iron',
            'Drying rack for clothing',
            'Clothing storage',
            'TV',
            'Sound system',
            'Pool table',
            'Arcade games',
            'Crib',
            'Pack ’n play/Travel crib',
            'Standalone high chair',
            'High chair with food tray',
            'Baby bath',
            'Children’s dinnerware',
            'Window guards',
            'Family rooms',
            'Air conditioning',
            'Ceiling fan',
            'Portable fans',
            'Free WiFi',
            'Dedicated workspace',
            'Kitchen',
            'Refrigerator',
            'Microwave',
            'Cooking basics',
            'Dishes and silverware',
            'Stove',
            'Oven',
            'Hot water kettle',
            'Toaster',
            'Rice maker',
            'Dining table',
            'Private entrance',
            'Resort access',
            'Backyard',
            'BBQ grill',
            'Sun loungers',
            'Balcony',
            'Free parking',
            'Free street parking',
            'Swimming pool',
            'Facilities for disabled guests',
            'Long term stays allowed',
            'Self check-in',
            'Lockbox',
            'Room service',
            'Exterior security cameras on property',
            'Fire extinguisher',
            'First aid kit',
            'Smoke alarm',
            'Carbon monoxide alarm',
            'Non-smoking rooms',
        ])->delete();
    }
};
