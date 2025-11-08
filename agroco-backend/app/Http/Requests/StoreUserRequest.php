<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class StoreUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $fullName = Str::squish((string) $this->input('nombre_completo'));
        $document = preg_replace('/\D+/', '', (string) $this->input('documento_identidad'));
        $occupation = Str::squish((string) $this->input('ocupacion'));
        $email = $this->input('email');

        $this->merge([
            'nombre_completo'     => $fullName,
            'documento_identidad' => $document,
            'ocupacion'           => $occupation,
            'email'               => $email ? Str::lower(trim($email)) : null,
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
                Rule::unique('users', 'documento_identidad'),
            ],
            'ocupacion' => [
                'required',
                'string',
                'min:3',
                'max:120',
                'regex:/^[\pL\pM0-9\s\.\,&\-]+$/u',
            ],
            'email' => [
                'nullable',
                'string',
                'email',
                'max:255',
                Rule::unique('users', 'email'),
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
                    'Indica al menos un nombre y dos apellidos.'
                );
            } else {
                $primerApellido = $parts[count($parts) - 2] ?? null;
                $segundoApellido = $parts[count($parts) - 1] ?? null;

                if ($primerApellido === null || $segundoApellido === null) {
                    $validator->errors()->add(
                        'nombre_completo',
                        'No se pudieron identificar dos apellidos válidos.'
                    );
                }

                if ($primerApellido !== null && $segundoApellido !== null) {
                    if (Str::length($primerApellido) < 2 || Str::length($segundoApellido) < 2) {
                        $validator->errors()->add(
                            'nombre_completo',
                            'Cada apellido debe tener al menos dos caracteres.'
                        );
                    }

                    if (Str::lower($primerApellido) === Str::lower($segundoApellido)) {
                        $validator->errors()->add(
                            'nombre_completo',
                            'Los apellidos no pueden ser idénticos.'
                        );
                    }
                }
            }

            $document = (string) $this->input('documento_identidad');
            if ($document !== '') {
                $blacklist = [
                    '000000', '0000000', '00000000', '000000000', '0000000000', '00000000000', '000000000000',
                    '111111', '1111111', '11111111', '111111111', '1111111111', '11111111111', '111111111111',
                    '123456', '012345', '1234567', '12345678', '123456789', '1234567890', '0123456789',
                    '987654', '9876543', '98765432', '987654321', '9876543210',
                ];

                if (in_array($document, $blacklist, true)) {
                    $validator->errors()->add(
                        'documento_identidad',
                        'El número de identificación ingresado no es válido.'
                    );
                }

                if (preg_match('/^(\d)\1{5,11}$/', $document)) {
                    $validator->errors()->add(
                        'documento_identidad',
                        'El número de identificación no puede repetir exactamente el mismo dígito.'
                    );
                }

                $asc = '0123456789012345';
                $desc = '9876543210987654';

                if (preg_match('/\d{6,}/', $document)) {
                    if (str_contains($asc, $document) || str_contains($desc, $document)) {
                        $validator->errors()->add(
                            'documento_identidad',
                            'El número de identificación no puede ser una secuencia consecutiva.'
                        );
                    }
                }
            }
        });
    }

    public function messages(): array
    {
        return [
            'nombre_completo.required' => 'El nombre completo es obligatorio.',
            'nombre_completo.min'      => 'El nombre completo debe tener al menos 5 caracteres.',
            'nombre_completo.max'      => 'El nombre completo no puede superar los 150 caracteres.',
            'nombre_completo.regex'    => 'El nombre completo solo puede contener letras, espacios, apóstrofes y puntos.',

            'documento_identidad.required' => 'El número de identificación es obligatorio.',
            'documento_identidad.regex'    => 'El número de identificación debe tener entre 6 y 12 dígitos.',
            'documento_identidad.unique'   => 'El número de identificación ya está registrado.',

            'ocupacion.required' => 'La ocupación es obligatoria.',
            'ocupacion.min'      => 'La ocupación debe tener al menos 3 caracteres.',
            'ocupacion.max'      => 'La ocupación no puede superar los 120 caracteres.',
            'ocupacion.regex'    => 'La ocupación contiene caracteres no permitidos.',

            'email.email'  => 'El correo electrónico no es válido.',
            'email.max'    => 'El correo electrónico no puede superar los 255 caracteres.',
            'email.unique' => 'El correo electrónico ya está en uso.',
        ];
    }
}


