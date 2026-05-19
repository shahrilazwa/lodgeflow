<?php

namespace App\Modules\Unit\Requests;

use App\Modules\Unit\Models\Unit;
use App\Modules\Unit\Models\UnitBed;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateUnitRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $unitId = $this->route('id');

        return [
            'name' => [
                'sometimes',
                'required',
                'string',
                'max:100',
                Rule::unique('units', 'name')
                    ->where('property_id', $this->input('property_id', 0))
                    ->ignore($unitId),
            ],
            'type' => ['sometimes', 'required', 'string', Rule::in(Unit::TYPES)],
            'description' => ['nullable', 'string', 'max:500'],
            'price_per_night' => ['nullable', 'numeric', 'min:0', 'max:99999999.99'],
            'max_occupancy' => ['nullable', 'integer', 'min:1', 'max:999'],
            'occupancy_source' => ['nullable', 'string', Rule::in(Unit::OCCUPANCY_SOURCES)],
            'beds' => ['nullable', 'array'],
            'beds.*.bed_type' => ['required_with:beds', 'string', Rule::in(UnitBed::TYPES)],
            'beds.*.quantity' => ['required_with:beds', 'integer', 'min:1', 'max:99'],
            'beds.*.capacity_per_bed' => ['nullable', 'integer', 'min:1', 'max:20'],
            'facility_ids' => ['nullable', 'array'],
            'facility_ids.*' => ['integer', 'exists:facilities,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.unique' => 'A unit with this name already exists in this property.',
        ];
    }
}
