<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ChatbotRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'message' => ['required', 'string', 'min:2', 'max:500'],
        ];
    }

    public function messages(): array
    {
        return [
            'message.required' => 'Cuéntame qué deseas saber del sistema.',
            'message.min' => 'El mensaje es muy corto. Puedes darme un poco más de contexto.',
            'message.max' => 'El mensaje es muy largo. Intenta resumirlo en menos de 500 caracteres.',
        ];
    }
}
