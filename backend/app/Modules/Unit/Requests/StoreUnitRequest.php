<?php

namespace App\Modules\Unit\Requests;

use App\Modules\Unit\Models\Unit;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreUnitRequest extends FormRequest
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
        return [
            'name' => [
                'required',
                'string',
                'max:100',
                Rule::unique('units', 'name')->where('property_id', $this->route('propertyId')),
            ],
            'type' => ['required', 'string', Rule::in(Unit::TYPES)],
            'description' => ['nullable', 'string', 'max:500'],
            'price_per_night' => ['nullable', 'numeric', 'min:0', 'max:99999999.99'],
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
