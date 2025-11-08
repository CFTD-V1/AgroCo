<?php

namespace App\Http\Requests;

use Carbon\Carbon;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Validator;

class StoreLotRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'name' => Str::squish((string) $this->input('name')),
            'crop' => Str::lower((string) $this->input('crop')),
        ]);
    }

    public function rules(): array
    {
        return [
            'name'        => ['required', 'string', 'min:3', 'max:120', 'regex:/^[\pL\pM0-9\'\s\.\-]+$/u'],
            'area_ha'     => ['required', 'numeric', 'min:0.1', 'max:1000'],
            'crop'        => ['required', 'in:arroz'],
            'location'    => ['nullable', 'array'],
            'sowing_date' => ['nullable', 'date_format:Y-m-d'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            if (!$this->filled('sowing_date')) {
                return;
            }

            try {
                $sowing = Carbon::createFromFormat('Y-m-d', $this->input('sowing_date'))->startOfDay();
            } catch (\Throwable $e) {
                $validator->errors()->add('sowing_date', 'La fecha de siembra debe tener el formato YYYY-MM-DD.');
                return;
            }

            $minDate = now()->subYears(2)->startOfDay();
            $today   = now()->startOfDay();

            if ($sowing->lt($minDate)) {
                $validator->errors()->add('sowing_date', 'La fecha de siembra no puede ser anterior a dos años.');
            }

            if ($sowing->gt($today)) {
                $validator->errors()->add('sowing_date', 'La fecha de siembra no puede estar en el futuro.');
            }
        });
    }

    public function messages(): array
    {
        return [
            'name.required' => 'El nombre del lote es obligatorio.',
            'name.min'      => 'El nombre del lote debe tener al menos 3 caracteres.',
            'name.max'      => 'El nombre del lote no puede superar los 120 caracteres.',
            'name.regex'    => 'El nombre del lote contiene caracteres no permitidos.',

            'area_ha.required' => 'Debes indicar el área en hectáreas.',
            'area_ha.min'      => 'El área mínima admitida es de 0.1 hectáreas.',
            'area_ha.max'      => 'El área no puede superar 1000 hectáreas.',

            'crop.required' => 'Debes indicar el cultivo.',
            'crop.in'       => 'Actualmente solo se admite el cultivo de arroz.',

            'sowing_date.date_format' => 'La fecha de siembra debe tener el formato YYYY-MM-DD.',
        ];
    }
}
