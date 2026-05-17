<?php

namespace App\Modules\MaintenanceTask\Requests;

use App\Modules\MaintenanceTask\Models\MaintenanceTask;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateMaintenanceTaskRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['sometimes', 'required', 'string', 'max:200'],
            'description' => ['nullable', 'string'],
            'priority' => ['sometimes', 'required', 'string', Rule::in(MaintenanceTask::PRIORITIES)],
            'status' => ['sometimes', 'required', 'string', Rule::in(MaintenanceTask::STATUSES)],
            'property_id' => ['nullable', 'integer', 'exists:properties,id'],
            'unit_id' => ['nullable', 'integer', 'exists:units,id'],
            'service_provider_id' => ['nullable', 'integer', 'exists:service_providers,id'],
            'scheduled_date' => ['nullable', 'date'],
        ];
    }
}
