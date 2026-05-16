<?php

namespace App\Modules\Unit\Requests;

use App\Modules\Unit\Models\Unit;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateUnitRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
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
                    ->where('property_id', $this->input('property_id', $this->unit?->property_id ?? 0))
                    ->ignore($unitId),
            ],
            'type' => ['sometimes', 'required', 'string', Rule::in(Unit::TYPES)],
            'description' => ['nullable', 'string', 'max:500'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.unique' => 'A unit with this name already exists in this property.',
        ];
    }
}
