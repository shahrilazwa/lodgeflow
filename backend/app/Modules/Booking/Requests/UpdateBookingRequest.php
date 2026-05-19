<?php

namespace App\Modules\Booking\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateBookingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'check_in_date' => ['sometimes', 'required', 'date'],
            'check_out_date' => ['sometimes', 'required', 'date', 'after:check_in_date'],
            'total_amount' => ['sometimes', 'required', 'numeric', 'between:0.01,999999999.99'],
            'allow_customer_cancellation' => ['sometimes', 'boolean'],
            'allow_customer_modification' => ['sometimes', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'check_out_date.after' => 'The check-out date must be after the check-in date.',
        ];
    }
}
