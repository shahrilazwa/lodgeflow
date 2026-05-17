<?php

namespace App\Modules\Expense\Requests;

use App\Modules\Expense\Models\Expense;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateExpenseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'amount' => ['sometimes', 'required', 'numeric', 'gt:0', 'max:999999999.99'],
            'date' => ['sometimes', 'required', 'date'],
            'category' => ['sometimes', 'required', 'string', Rule::in(Expense::CATEGORIES)],
            'property_id' => ['sometimes', 'required', 'integer', 'exists:properties,id'],
            'description' => ['nullable', 'string', 'max:500'],
            'unit_id' => ['nullable', 'integer'],
            'booking_id' => ['nullable', 'integer'],
            'service_provider_id' => ['nullable', 'integer'],
            'cleaning_task_id' => ['nullable', 'integer'],
            'maintenance_task_id' => ['nullable', 'integer'],
        ];
    }

    public function messages(): array
    {
        return [
            'amount.gt' => 'The amount must be greater than zero.',
        ];
    }
}
