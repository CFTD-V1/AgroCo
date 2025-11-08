<?php

namespace Tests\Feature;

use App\Models\Lot;
use App\Models\SoilAnalysis;
use App\Models\User;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class FertilizerPlanGenerationTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function it_generates_a_plan_with_signed_download_link(): void
    {
        Mail::fake();
        Storage::fake('public');

        $pdfMock = \Mockery::mock(\Barryvdh\DomPDF\PDF::class);
        $pdfMock->shouldReceive('output')->andReturn('pdf-content');
        Pdf::shouldReceive('loadView')->andReturn($pdfMock);

        $user = User::factory()->create([
            'email' => null,
            'email_verified_at' => null,
        ]);

        $lot = Lot::factory()->for($user)->create(['crop' => 'arroz', 'area_ha' => 12]);
        $analysis = SoilAnalysis::factory()->for($lot)->create([
            'yield_target_t_ha' => 8,
        ]);

        Sanctum::actingAs($user);

        $response = $this->postJson("/api/v1/soil-analyses/{$analysis->id}/plan/generate");
        $response->assertOk();

        $analysis->refresh();
        $plan = $analysis->plan;

        $this->assertNotNull($plan->download_token);
        $response->assertJsonStructure(['pdf_download', 'plan' => []]);
    }
}
