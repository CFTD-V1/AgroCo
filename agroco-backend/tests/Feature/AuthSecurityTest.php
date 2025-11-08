<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AuthSecurityTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function it_registers_users_with_strict_full_name_validation(): void
    {
        $response = $this->postJson('/api/v1/register', [
            'nombre_completo'     => 'Maria Fernanda Lopez Ramirez',
            'documento_identidad' => '654321987',
            'ocupacion'           => 'Ingeniera agronoma',
            'email'               => 'maria@example.com',
        ]);

        $response->assertCreated();
        $this->assertNotEmpty($response->json('api_token'));
        $this->assertNotNull($response->json('email_verified_at'));

        $this->assertDatabaseHas('users', [
            'documento_identidad'   => '654321987',
            'normalized_full_name'  => 'maria fernanda lopez ramirez',
            'api_token'             => $response->json('api_token'),
        ]);

        $user = User::where('documento_identidad', '654321987')->first();
        $this->assertNotNull($user?->email_verified_at);
        $this->assertTrue(Hash::check('654321987', $user?->password));
    }

    /** @test */
    public function it_rejects_registration_without_two_last_names(): void
    {
        $response = $this->postJson('/api/v1/register', [
            'nombre_completo'     => 'Juan Perez',
            'documento_identidad' => '123123',
            'ocupacion'           => 'Productor',
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors('nombre_completo');
    }

    /** @test */
    public function it_locks_the_account_after_consecutive_failed_logins(): void
    {
        $user = User::factory()->create([
            'primer_nombre'        => 'Carlos',
            'segundo_nombre'       => 'Andres',
            'primer_apellido'      => 'Gomez',
            'segundo_apellido'     => 'Lopez',
            'documento_identidad'  => '998877',
            'password'             => Hash::make('Secret123!'),
            'normalized_full_name' => 'carlos andres gomez lopez',
        ]);

        for ($i = 0; $i < 5; $i++) {
            $this->postJson('/api/v1/login', [
                'nombre_completo'     => 'Carlos Andres Gomez Ramirez',
                'documento_identidad' => '998877',
            ])->assertStatus(422);
        }

        $user->refresh();
        $this->assertTrue($user->isLocked());

        RateLimiter::clear('login:doc:998877');
        RateLimiter::clear('login:ip:127.0.0.1');

        $response = $this->postJson('/api/v1/login', [
            'nombre_completo'     => 'Carlos Andres Gomez Lopez',
            'documento_identidad' => '998877',
        ], [
            'REMOTE_ADDR' => '127.0.0.2',
        ]);

        $response->assertStatus(423);
    }

    /** @test */
    public function it_allows_authenticated_users_to_change_their_password(): void
    {
        $user = User::factory()->create([
            'documento_identidad'  => '445566',
            'password'             => Hash::make('Temporal123!'),
            'must_change_password' => true,
        ]);

        Sanctum::actingAs($user);

        $response = $this->postJson('/api/v1/password/change', [
            'current_password' => 'Temporal123!',
            'new_password'     => 'NuevoPass123',
        ]);

        $response->assertOk();

        $user->refresh();
        $this->assertTrue(Hash::check('NuevoPass123', $user->password));
        $this->assertFalse($user->must_change_password);
    }
}
