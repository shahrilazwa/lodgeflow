<?php

namespace Database\Seeders;

use App\Modules\Facility\Models\Facility;
use Illuminate\Database\Seeder;

class FacilitySeeder extends Seeder
{
    public function run(): void
    {
        $facilities = [
            ['name' => 'Free WiFi', 'icon' => 'wifi', 'category' => 'Connectivity', 'scope' => Facility::SCOPE_BOTH],
            ['name' => 'Free parking', 'icon' => 'parking', 'category' => 'Parking', 'scope' => Facility::SCOPE_PROPERTY],
            ['name' => 'Kitchen', 'icon' => 'kitchen', 'category' => 'Kitchen', 'scope' => Facility::SCOPE_BOTH],
            ['name' => 'Air conditioning', 'icon' => 'air-conditioner', 'category' => 'Comfort', 'scope' => Facility::SCOPE_BOTH],
            ['name' => 'Swimming pool', 'icon' => 'water-ladder', 'category' => 'Leisure', 'scope' => Facility::SCOPE_PROPERTY],
            ['name' => 'Room service', 'icon' => 'bell-concierge', 'category' => 'Service', 'scope' => Facility::SCOPE_PROPERTY],
            ['name' => 'Non-smoking rooms', 'icon' => 'ban-smoking', 'category' => 'Policy', 'scope' => Facility::SCOPE_BOTH],
            ['name' => 'Family rooms', 'icon' => 'people-roof', 'category' => 'Room', 'scope' => Facility::SCOPE_BOTH],
            ['name' => 'Facilities for disabled guests', 'icon' => 'wheelchair', 'category' => 'Accessibility', 'scope' => Facility::SCOPE_BOTH],
            ['name' => 'Washing machine', 'icon' => 'soap', 'category' => 'Laundry', 'scope' => Facility::SCOPE_BOTH],
            ['name' => 'TV', 'icon' => 'tv', 'category' => 'Entertainment', 'scope' => Facility::SCOPE_UNIT],
            ['name' => 'Private bathroom', 'icon' => 'bath', 'category' => 'Bathroom', 'scope' => Facility::SCOPE_UNIT],
            ['name' => 'Balcony', 'icon' => 'door-open', 'category' => 'Outdoor', 'scope' => Facility::SCOPE_UNIT],
            ['name' => 'BBQ area', 'icon' => 'fire-burner', 'category' => 'Outdoor', 'scope' => Facility::SCOPE_PROPERTY],
        ];

        foreach ($facilities as $facility) {
            Facility::updateOrCreate(['name' => $facility['name']], $facility);
        }
    }
}
