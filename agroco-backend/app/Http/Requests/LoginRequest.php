<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Validator;

class LoginRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $fullName = Str::squish((string) $this->input('nombre_completo'));
        $document = preg_replace('/\D+/', '', (string) $this->input('documento_identidad'));

        $this->merge([
            'nombre_completo'     => $fullName,
            'documento_identidad' => $document,
        ]);
    }

    public function rules(): array
    {
        return [
            'nombre_completo' => [
                'required',
                'string',
                'min:5',
                'max:150',
                'regex:/^[\pL\pM\'\.\s]+$/u',
            ],
            'documento_identidad' => [
                'required',
                'string',
                'regex:/^\d{6,12}$/',
            ],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            $fullName = (string) $this->input('nombre_completo');
            $parts = array_values(array_filter(explode(' ', $fullName)));

            if (count($parts) < 3) {
                $validator->errors()->add(
                    'nombre_completo',
                    'El nombre completo debe incluir por lo menos un nombre y dos apellidos.'
                );
            }
        });
    }

    public function messages(): array
    {
        return [
            'nombre_completo.required' => 'Debes indicar tu nombre completo.',
            'nombre_completo.min'      => 'El nombre completo debe tener al menos 5 caracteres.',
            'nombre_completo.max'      => 'El nombre completo no puede superar los 150 caracteres.',
            'nombre_completo.regex'    => 'El nombre completo solo puede contener letras, espacios, apóstrofes y puntos.',

            'documento_identidad.required' => 'El número de identificación es obligatorio.',
            'documento_identidad.regex'    => 'El número de identificación debe tener entre 6 y 12 dígitos.',
        ];
    }
}

