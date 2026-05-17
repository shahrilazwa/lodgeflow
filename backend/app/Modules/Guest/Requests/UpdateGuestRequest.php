<?php

namespace App\Modules\Guest\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateGuestRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $guestId = $this->route('id');

        return [
            'full_name' => ['sometimes', 'required', 'string', 'max:100'],
            'phone' => [
                'sometimes',
                'required',
                'string',
                'regex:/^\d{7,15}$/',
                Rule::unique('guests', 'phone')
                    ->where('owner_id', $this->user()->id)
                    ->ignore($guestId),
            ],
            'email' => ['nullable', 'string', 'email', 'max:254'],
            'identification_number' => ['nullable', 'string', 'max:50'],
        ];
    }

    public function messages(): array
    {
        return [
            'phone.regex' => 'The phone number must consist of 7 to 15 numeric digits.',
            'phone.unique' => 'A guest with this phone number already exists.',
        ];
    }
}
