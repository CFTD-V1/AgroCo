<?php

namespace App\Services\Chatbot;

use App\Models\ChatMessage;
use App\Models\SoilAnalysis;
use App\Models\User;
use Illuminate\Support\Arr;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class ChatbotService
{
    private const HISTORY_LIMIT = 10;

    public function respond(?User $user, string $message): array
    {
        $normalized = $this->normalize($message);
        $intent = $this->matchIntent($normalized);
        $context = $this->contextSummary($user);
        $response = $this->buildResponse($intent, $user, $context);

        $this->storeMessage($user, 'user', $message, [
            'normalized' => $normalized,
        ]);

        $this->storeMessage($user, 'bot', $response, [
            'intent' => $intent['name'] ?? 'fallback',
            'suggestions' => $intent['follow_up'] ?? [],
            'context' => $context,
        ]);

        Log::info('chatbot.interaction', [
            'user_id' => $user?->id,
            'intent' => $intent['name'] ?? 'fallback',
            'score' => $intent['score'] ?? 0,
        ]);

        return [
            'message' => $response,
            'intent' => $intent['name'] ?? 'fallback',
            'context' => $context,
            'suggestions' => $intent['follow_up'] ?? [],
            'history' => $this->recentHistory($user),
        ];
    }

    private function normalize(string $message): string
    {
        $ascii = Str::ascii($message);

        return Str::squish(Str::lower($ascii));
    }

    private function matchIntent(string $normalized): array
    {
        $intents = config('chatbot.intents', []);

        $best = [
            'name' => 'fallback',
            'responses' => config('chatbot.fallback_responses', []),
            'score' => 0,
        ];

        foreach ($intents as $name => $intent) {
            $score = $this->scoreIntent($normalized, $intent['keywords'] ?? []);
            if ($score > $best['score']) {
                $best = [
                    'name' => $name,
                    'responses' => $intent['responses'] ?? [],
                    'follow_up' => $intent['follow_up'] ?? [],
                    'score' => $score,
                ];
            }
        }

        if ($best['score'] > 0) {
            return $best;
        }

        return [
            'name' => 'fallback',
            'responses' => config('chatbot.fallback_responses', []),
            'follow_up' => [],
            'score' => 0,
        ];
    }

    private function scoreIntent(string $message, array $keywords): int
    {
        $score = 0;

        foreach ($keywords as $keyword) {
            $keyword = $this->normalize($keyword);
            if ($keyword === '') {
                continue;
            }

            if (Str::contains($message, $keyword)) {
                $score += 3;
                continue;
            }

            $words = explode(' ', $keyword);
            foreach ($words as $word) {
                if (strlen($word) > 2 && Str::contains($message, $word)) {
                    $score++;
                }
            }

            $distance = levenshtein($message, $keyword);
            if ($distance <= 2) {
                $score += 2;
            }
        }

        return $score;
    }

    private function buildResponse(array $intent, ?User $user, array $context): string
    {
        $responses = $intent['responses'];
        if (empty($responses)) {
            $responses = config('chatbot.fallback_responses', [
                'No tengo una respuesta para eso por ahora, pero estoy listo para ayudarte con los módulos principales.',
            ]);
        }

        $message = Arr::random($responses);

        if ($user) {
            $message .= PHP_EOL . PHP_EOL . $this->personalTip($user, $context);
        }

        return $message;
    }

    private function personalTip(User $user, array $context): string
    {
        $user->loadMissing([
            'lots' => fn ($query) => $query->withCount('soilAnalyses'),
            'soilAnalyses' => fn ($query) => $query->with('plan'),
        ]);

        $tips = new Collection();

        if (!$user->email_verified_at && $user->email) {
            $tips->push('Recuerda verificar tu correo para recibir los planes en PDF automáticamente.');
        }

        if ($user->lots->isEmpty()) {
            $tips->push('Aún no tienes lotes registrados. Entra a "Mis lotes" y agrega el nombre del predio y su área para habilitar los planes.');
        } else {
            $lotsWithoutAnalyses = $user->lots->filter(
                fn ($lot) => $lot->soil_analyses_count === 0
            );

            if ($lotsWithoutAnalyses->isNotEmpty()) {
                $tips->push('Veo que tienes lotes sin análisis de suelo. Ingresa los datos para generar recomendaciones específicas.');
            }
        }

        $analysesWithoutPlan = $user->soilAnalyses->filter(
            fn (SoilAnalysis $analysis) => $analysis->plan === null
        );

        if ($analysesWithoutPlan->isNotEmpty()) {
            $tips->push('Tienes análisis sin plan de fertilización. Abre el análisis y usa "Generar plan" para obtener el PDF y compartirlo.');
        }

        if ($tips->isEmpty()) {
            $tips->push('Gracias por mantener tus datos al día. ¿Quieres que revisemos algún lote o plan en particular? Visita la sección "Análisis" para continuar.');
        }

        return 'Tip para ti: ' . $tips->first();
    }

    private function contextSummary(?User $user): array
    {
        if (!$user) {
            return [
                'authenticated' => false,
            ];
        }

        $latestMessage = ChatMessage::query()
            ->where('user_id', $user->id)
            ->latest('id')
            ->value('created_at');

        return [
            'authenticated' => true,
            'lots' => $user->lots()->count(),
            'soil_analyses' => $user->soilAnalyses()->count(),
            'email_verified' => (bool) $user->email_verified_at,
            'last_message_at' => optional($latestMessage)?->toIso8601String(),
        ];
    }

    private function storeMessage(?User $user, string $role, string $message, array $meta = []): void
    {
        if (!$user) {
            return;
        }

        ChatMessage::create([
            'user_id' => $user->id,
            'role' => $role,
            'intent' => $meta['intent'] ?? null,
            'message' => $message,
            'meta' => $meta,
        ]);
    }

    private function recentHistory(?User $user): array
    {
        if (!$user) {
            return [];
        }

        return ChatMessage::query()
            ->where('user_id', $user->id)
            ->latest('id')
            ->limit(self::HISTORY_LIMIT)
            ->get()
            ->sortBy('id')
            ->map(fn (ChatMessage $msg) => [
                'role' => $msg->role,
                'message' => $msg->message,
                'intent' => $msg->intent,
                'created_at' => $msg->created_at?->toIso8601String(),
            ])
            ->values()
            ->all();
    }
}
