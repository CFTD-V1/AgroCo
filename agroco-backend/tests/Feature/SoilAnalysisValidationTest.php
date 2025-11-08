<?php

namespace Tests\Feature;

use App\Models\Lot;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class SoilAnalysisValidationTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function it_rejects_soil_analysis_with_values_out_of_range(): void
    {
        $user = User::factory()->create();
        $lot = Lot::factory()->for($user)->create(['area_ha' => 10, 'crop' => 'arroz']);

        Sanctum::actingAs($user);

        $response = $this->postJson("/api/v1/lots/{$lot->id}/soil-analyses", [
            'yield_target_t_ha' => 8,
            'p_mgkg'            => 500,
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors('p_mgkg');
    }

    /** @test */
    public function it_limits_the_number_of_analyses_per_lot(): void
    {
        $user = User::factory()->create();
        $lot = Lot::factory()->for($user)->create(['area_ha' => 10, 'crop' => 'arroz']);

        Sanctum::actingAs($user);

        for ($i = 0; $i < 5; $i++) {
            $this->postJson("/api/v1/lots/{$lot->id}/soil-analyses", [
                'yield_target_t_ha' => 8,
            ]);
        }

        $response = $this->postJson("/api/v1/lots/{$lot->id}/soil-analyses", [
            'yield_target_t_ha' => 8,
        ]);

        $response->assertStatus(422);
    }
}

