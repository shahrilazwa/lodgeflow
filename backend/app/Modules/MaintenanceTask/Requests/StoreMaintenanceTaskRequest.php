<?php

namespace App\Modules\MaintenanceTask\Requests;

use App\Modules\MaintenanceTask\Models\MaintenanceTask;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreMaintenanceTaskRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:200'],
            'description' => ['nullable', 'string'],
            'priority' => ['required', 'string', Rule::in(MaintenanceTask::PRIORITIES)],
            'property_id' => ['nullable', 'integer', 'exists:properties,id'],
            'unit_id' => ['nullable', 'integer', 'exists:units,id'],
            'service_provider_id' => ['nullable', 'integer', 'exists:service_providers,id'],
            'scheduled_date' => ['nullable', 'date'],
        ];
    }
}
