<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class LotResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id'              => $this->id,
            'usuario_id'      => $this->user_id,
            'nombre'          => $this->name,
            'cultivo'         => $this->crop,                                // p.ej. "arroz"
            'area_ha'         => (float) $this->area_ha,
            'ubicacion'       => $this->location,                            // json -> array (dept, muni, lat, lng)
            'fecha_siembra'   => optional($this->sowing_date)->toDateString(),

            'creado_en'       => $this->created_at,
            'actualizado_en'  => $this->updated_at,

            // contador (solo aparece si hiciste ->withCount('soilAnalyses'))
            'analisis_suelo_total' => $this->when(
                isset($this->soil_analyses_count),
                (int) $this->soil_analyses_count
            ),

            // Análisis de suelo (solo si se cargaron con ->with('soilAnalyses'))
            // Dentro de cada análisis, SoilAnalysisResource puede incluir 'fertilizer_plan'
            // si también se cargó la relación 'soilAnalyses.fertilizerPlan' (include=plan)
            'analisis_suelo' => SoilAnalysisResource::collection(
                $this->whenLoaded('soilAnalyses')
            ),
        ];
    }
}