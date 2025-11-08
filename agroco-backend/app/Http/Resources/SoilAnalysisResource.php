<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Str;

class SoilAnalysisResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'                     => $this->id,
            'lote_id'                => $this->lot_id,
            'fecha_muestreo'         => optional($this->sampled_at)->toDateString(),
            'meta_rendimiento_t_ha'  => $this->yield_target_t_ha !== null ? (float) $this->yield_target_t_ha : null,

            // === Elementos mayores ===
            'fosforo_mgkg'           => $this->p_mgkg       !== null ? (float) $this->p_mgkg : null,
            'potasio_cmol'           => $this->k_cmol       ?? $this->k_cmolkg ?? null,
            'calcio_cmol'            => $this->ca_cmol      !== null ? (float) $this->ca_cmol : null,
            'magnesio_cmol'          => $this->mg_cmol      !== null ? (float) $this->mg_cmol : null,
            'azufre_mgkg'            => $this->s_mgkg       !== null ? (float) $this->s_mgkg : null,

            // === Elementos menores ===
            'boro_mgkg'              => $this->b_mgkg       !== null ? (float) $this->b_mgkg : null,
            'hierro_mgkg'            => $this->fe_mgkg      !== null ? (float) $this->fe_mgkg : null,
            'manganeso_mgkg'         => $this->mn_mgkg      !== null ? (float) $this->mn_mgkg : null,
            'zinc_mgkg'              => $this->zn_mgkg      !== null ? (float) $this->zn_mgkg : null,
            'cobre_mgkg'             => $this->cu_mgkg      !== null ? (float) $this->cu_mgkg : null,

            // Auditoría
            'creado_en'              => $this->created_at,
            'actualizado_en'         => $this->updated_at,

            // === Plan de fertilización + link de descarga firmado ===
            // Requiere que la relación SE HAYA CARGADO: with('soilAnalyses.fertilizerPlan')
            // y la ruta firmada: name('fert-plans.download.signed')
            'fertilizer_plan' => $this->when(
                $this->relationLoaded('plan') || $this->relationLoaded('fertilizerPlan'),
                function () {
                    $plan = $this->relationLoaded('plan') ? $this->plan : $this->fertilizerPlan;

                    if (!$plan) {
                        return null;
                    }

                    $disk = Storage::disk('public');
                    $file = collect($disk->files('plans'))
                        ->first(fn($path) => str_starts_with(basename($path), "plan_fertilizacion_{$plan->id}_"));

                    $token = $plan->download_token;
                    if (!$token) {
                        $token = Str::random(40);
                        $plan->forceFill(['download_token' => $token])->save();
                    }

                    $downloadUrl = URL::temporarySignedRoute(
                        'fert-plans.download',
                        now()->addMinutes(60),
                        ['plan' => $plan->id, 'token' => $token]
                    );

                    return [
                        'id'           => $plan->id,
                        'pdf_file'     => $file ? basename($file) : null,
                        'pdf_exists'   => $file ? $disk->exists($file) : false,
                        'pdf_download' => $downloadUrl,
                        'data'         => new \App\Http\Resources\FertilizerPlanResource($plan),
                    ];
                }
            ),
        ];
    }
}
