<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreSoilAnalysisRequest;
use App\Http\Resources\SoilAnalysisResource;
use App\Models\Lot;
use App\Models\SoilAnalysis;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SoilAnalysisController extends Controller
{
    /**
     * Lista los análisis del usuario autenticado.
     * Permite ?include=plan para adjuntar el plan (si existe).
     */
    public function index(Request $request)
    {
        $user = $request->user();

        $include = collect(explode(',', (string) $request->query('include')))
            ->map(fn ($v) => trim($v))
            ->filter()
            ->values();

        $query = SoilAnalysis::query()
            ->whereHas('lot', fn ($q) => $q->where('user_id', $user->id))
            ->with(['lot']);

        if ($include->contains('plan')) {
            $query->with('plan');
        }

        $analyses = $query->latest()->get();

        return SoilAnalysisResource::collection($analyses);
    }

    /**
     * Crea un análisis de suelo para un lote.
     * Ruta esperada: POST /api/v1/lots/{lot}/soil-analyses
     *
     * Body validado por StoreSoilAnalysisRequest.
     */
    public function store(StoreSoilAnalysisRequest $request, Lot $lot): JsonResponse
    {
        $this->authorize('update', $lot);

        $maxPerLot = 5;
        $analysisCount = $lot->soilAnalyses()->count();
        if ($analysisCount >= $maxPerLot) {
            return response()->json([
                'message' => 'Se alcanzó el número máximo de análisis permitidos para este lote.',
            ], 422);
        }

        /** @var SoilAnalysis $analysis */
        $analysis = $lot->soilAnalyses()->create($request->validated());

        // Opcional: precargar relaciones mínimas
        $analysis->loadMissing('plan');

        // Devolver 201 + Location del recurso creado
        return (new SoilAnalysisResource($analysis))
            ->response()
            ->header('Location', route('soil-analyses.show', ['soilAnalysis' => $analysis->id]))
            ->setStatusCode(201);
    }

    /**
     * Muestra un análisis de suelo (incluye su plan si existe).
     * Ruta esperada: GET /api/v1/soil-analyses/{soilAnalysis}
     */
    public function show(SoilAnalysis $soilAnalysis): SoilAnalysisResource
    {
        $this->authorize('view', $soilAnalysis->lot);

        $soilAnalysis->loadMissing('plan');

        return new SoilAnalysisResource($soilAnalysis);
    }

    /**
     * Actualiza un análisis de suelo existente.
     * Ruta: PUT /api/v1/soil-analyses/{soilAnalysis}
     */
    public function update(StoreSoilAnalysisRequest $request, SoilAnalysis $soilAnalysis): SoilAnalysisResource
    {
        $this->authorize('update', $soilAnalysis->lot);

        $soilAnalysis->update($request->validated());
        $soilAnalysis->loadMissing('plan');

        return new SoilAnalysisResource($soilAnalysis);
    }

    /**
     * Elimina un análisis de suelo y su plan asociado.
     * Ruta: DELETE /api/v1/soil-analyses/{soilAnalysis}
     */
    public function destroy(SoilAnalysis $soilAnalysis): JsonResponse
    {
        $this->authorize('delete', $soilAnalysis->lot);

        $soilAnalysis->delete();

        return response()->noContent();
    }
}
