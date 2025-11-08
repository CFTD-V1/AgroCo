<?php

namespace Tests\Feature;

use App\Models\Lot;
use App\Models\SoilAnalysis;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ChatbotTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function it_returns_a_personalized_tip_for_authenticated_users(): void
    {
        $user = User::factory()->create([
            'email_verified_at' => now(),
        ]);

        $lot = Lot::factory()->for($user)->create();
        SoilAnalysis::factory()->for($lot)->create();

        Sanctum::actingAs($user);

        $payload = ['message' => 'Hola, necesito ayuda con el plan de fertilización'];

        $response = $this->postJson('/api/v1/assistant/chat', $payload);

        $response->assertOk();
        $response->assertJsonStructure(['message', 'intent', 'context', 'suggestions', 'history']);
        $response->assertJsonPath('context.authenticated', true);
        $this->assertNotEmpty($response->json('suggestions'));
        $this->assertNotEmpty($response->json('history'));
    }

    /** @test */
    public function it_validates_the_message_content(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->postJson('/api/v1/assistant/chat', ['message' => '']);

        $response->assertUnprocessable();
        $response->assertJsonValidationErrors(['message']);
    }

    /** @test */
    public function it_builds_history_with_each_exchange(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $this->postJson('/api/v1/assistant/chat', ['message' => 'Hola, bot']);
        $historyResponse = $this->postJson('/api/v1/assistant/chat', ['message' => 'Necesito ayuda con lotes']);

        $historyResponse->assertOk();
        $history = $historyResponse->json('history', []);

        $this->assertGreaterThanOrEqual(2, count($history));
        $this->assertEquals('user', $history[0]['role']);
    }

    /** @test */
    public function it_uses_fallback_intent_when_no_keyword_matches(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->postJson('/api/v1/assistant/chat', ['message' => 'Mensaje sin contexto específico']);

        $response->assertOk();
        $response->assertJsonPath('intent', 'fallback');
    }
}
