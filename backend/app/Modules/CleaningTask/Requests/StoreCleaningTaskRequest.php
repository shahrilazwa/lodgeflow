<?php

namespace App\Modules\CleaningTask\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCleaningTaskRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'unit_id' => ['required', 'integer', 'exists:units,id'],
            'booking_id' => ['nullable', 'integer', 'exists:bookings,id'],
        ];
    }
}
