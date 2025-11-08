<?php

namespace App\Http\Controllers;

use App\Http\Requests\ChatbotRequest;
use App\Services\Chatbot\ChatbotService;
use Illuminate\Http\JsonResponse;

class ChatbotController extends Controller
{
    public function __construct(private readonly ChatbotService $chatbot) {}

    public function respond(ChatbotRequest $request): JsonResponse
    {
        $user = $request->user();
        $payload = $this->chatbot->respond($user, $request->validated()['message']);

        return response()->json($payload);
    }
}

