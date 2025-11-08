<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Arr;

class RecommendationController extends Controller
{
    /**
     * Devuelve las metas configuradas para el cultivo de arroz y las fuentes disponibles.
     */
    public function riceRequirements(): JsonResponse
    {
        $targets = (array) config('nutrients.targets.rice', []);
        $sources = (array) config('nutrients.sources', []);

        if (empty($targets)) {
            return response()->json([
                'message' => 'No se encontraron requerimientos configurados para arroz.',
            ], 404);
        }

        $riceTargets = [
            'N' => Arr::get($targets, 'N'),
            'P2O5' => Arr::get($targets, 'P2O5'),
            'K2O' => Arr::get($targets, 'K2O'),
            'S' => Arr::get($targets, 'S'),
            'sat' => Arr::get($targets, 'sat', []),
            'criticals' => Arr::get($targets, 'criticals', []),
            'micros_dose_kg_ha' => Arr::get($targets, 'micros_dose_kg_ha', []),
        ];

        return response()->json([
            'targets' => [
                'rice' => $riceTargets,
            ],
            // Mantiene compatibilidad para consumidores que aún usan las claves planas
            'saturation' => Arr::get($targets, 'sat', []),
            'criticals' => Arr::get($targets, 'criticals', []),
            'micros_dose_kg_ha' => Arr::get($targets, 'micros_dose_kg_ha', []),
            'sources' => $sources,
        ]);
    }
}
