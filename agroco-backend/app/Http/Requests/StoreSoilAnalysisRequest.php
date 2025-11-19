<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class StoreSoilAnalysisRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'sampled_at'        => $this->input('sampled_at', $this->input('fecha_muestra')),
            'yield_target_t_ha' => $this->input('yield_target_t_ha', $this->input('objetivo_t_ha')),

            'p_mgkg'  => $this->input('p_mgkg',  $this->input('P_mgkg')),
            'k_cmol'  => $this->input('k_cmol',  $this->input('K_cmolkg')),
            'ca_cmol' => $this->input('ca_cmol', $this->input('Ca_cmolkg')),
            'mg_cmol' => $this->input('mg_cmol', $this->input('Mg_cmolkg')),
            's_mgkg'  => $this->input('s_mgkg',  $this->input('S_mgkg')),

            'b_mgkg'  => $this->input('b_mgkg',  $this->input('B_mgkg')),
            'fe_mgkg' => $this->input('fe_mgkg', $this->input('Fe_mgkg')),
            'mn_mgkg' => $this->input('mn_mgkg', $this->input('Mn_mgkg')),
            'zn_mgkg' => $this->input('zn_mgkg', $this->input('Zn_mgkg')),
            'cu_mgkg' => $this->input('cu_mgkg', $this->input('Cu_mgkg')),
        ]);
    }

    public function rules(): array
    {
        return [
            'sampled_at'        => ['nullable', 'date'],
            'yield_target_t_ha' => ['required', 'numeric', 'min:4', 'max:12'],

            'p_mgkg'  => ['nullable', 'numeric', 'min:0', 'max:200'],
            'k_cmol'  => ['nullable', 'numeric', 'min:0', 'max:5'],
            'ca_cmol' => ['nullable', 'numeric', 'min:0', 'max:40'],
            'mg_cmol' => ['nullable', 'numeric', 'min:0', 'max:15'],
            's_mgkg'  => ['nullable', 'numeric', 'min:0', 'max:200'],

            'b_mgkg'  => ['nullable', 'numeric', 'min:0', 'max:5'],
            'fe_mgkg' => ['nullable', 'numeric', 'min:0', 'max:200'],
            'mn_mgkg' => ['nullable', 'numeric', 'min:0', 'max:200'],
            'zn_mgkg' => ['nullable', 'numeric', 'min:0', 'max:20'],
            'cu_mgkg' => ['nullable', 'numeric', 'min:0', 'max:20'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            if (! $this->filled('sampled_at')) {
                return;
            }

            try {
                $sampleDate = $this->date('sampled_at');
            } catch (\Throwable $e) {
                $validator->errors()->add('sampled_at', 'La fecha de muestreo no es válida.');
                return;
            }

            $today = now()->startOfDay();
            if ($sampleDate->gt($today)) {
                $validator->errors()->add('sampled_at', 'La fecha de muestreo no puede ser mayor a la fecha actual.');
            }

            $lot = $this->route('lot');
            if ($lot && $lot->fecha_siembra) {
                try {
                    $sowing = $lot->fecha_siembra instanceof \Carbon\Carbon
                        ? $lot->fecha_siembra->copy()->startOfDay()
                        : \Carbon\Carbon::parse($lot->fecha_siembra)->startOfDay();
                    if ($sampleDate->lt($sowing)) {
                        $validator->errors()->add(
                            'sampled_at',
                            'La fecha de muestreo no puede ser anterior a la fecha de siembra del lote.'
                        );
                    }
                } catch (\Throwable $e) {
                    // si la fecha de siembra es inválida, no rompemos la validación
                }
            }
        });
    }
}
