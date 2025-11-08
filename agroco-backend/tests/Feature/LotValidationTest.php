<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class LotValidationTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function it_rejects_future_sowing_dates_beyond_six_months(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->postJson('/api/v1/lots', [
            'name'        => 'Campo Norte',
            'area_ha'     => 12.5,
            'crop'        => 'arroz',
            'sowing_date' => now()->addMonths(7)->format('Y-m-d'),
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors('sowing_date');
    }
}

