<?php

namespace App\Modules\Payment\Requests;

use App\Modules\Payment\Models\Payment;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'type' => ['required', 'string', Rule::in(Payment::TYPES)],
            'amount' => ['required', 'numeric', 'gt:0', 'max:999999999.99'],
            'payment_date' => ['required', 'date'],
            'payment_method' => ['required', 'string', Rule::in(Payment::METHODS)],
        ];
    }

    public function messages(): array
    {
        return [
            'amount.gt' => 'The amount must be greater than zero.',
        ];
    }
}
