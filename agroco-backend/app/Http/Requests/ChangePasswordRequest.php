<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class ChangePasswordRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'current_password' => ['required','string','min:6','max:64'],
            'new_password'     => [
                'required','string','min:8','max:64',
                'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/',
                'different:current_password',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'current_password.required' => 'Debes ingresar la contraseña actual.',
            'new_password.required'     => 'Debes ingresar una nueva contraseña.',
            'new_password.min'          => 'La nueva contraseña debe tener mínimo 8 caracteres.',
            'new_password.regex'        => 'La nueva contraseña debe incluir mayúsculas, minúsculas y números.',
            'new_password.different'    => 'La nueva contraseña debe ser distinta a la actual.',
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            $user = $this->user();
            if ($user && $this->filled('new_password') && $this->input('new_password') === $user->documento_identidad) {
                $validator->errors()->add(
                    'new_password',
                    'La nueva contraseña no puede ser idéntica a tu número de documento.'
                );
            }
        });
    }
}

