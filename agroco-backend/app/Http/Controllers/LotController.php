<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreLotRequest;
use App\Http\Resources\LotResource;
use App\Models\Lot;
use Illuminate\Http\Request;

class LotController extends Controller
{
    /**
     * GET /api/v1/lots?include=analyses,plan
     * Lista los lotes del usuario autenticado.
     * include:
     *   - analyses : incluye los análisis de suelo de cada lote
     *   - plan     : incluye el plan dentro de cada análisis (eager load 'plan')
     */
    public function index(Request $request)
    {
        $user = $request->user();

        // Normalizamos include
        $include = collect(explode(',', (string) $request->query('include')))
            ->map(fn ($v) => trim($v))
            ->filter()
            ->values();

        $with = [];
        $withCounts = ['soilAnalyses']; // siempre contamos análisis

        // ¿Quieren los análisis?
        if ($include->contains('analyses')) {
            // Si además piden plan, cargamos el plan dentro del análisis
            if ($include->contains('plan')) {
                $with['soilAnalyses'] = function ($q) {
                    $q->latest()->with('plan'); // relación 1:1 en SoilAnalysis: plan()
                };
            } else {
                $with['soilAnalyses'] = function ($q) {
                    $q->latest();
                };
            }
        }

        $lots = $user->lots()
            ->with($with)
            ->withCount($withCounts)
            ->latest()
            ->get();

        return LotResource::collection($lots);
    }

    /**
     * POST /api/v1/lots
     */
    public function store(StoreLotRequest $request)
    {
        $lot = $request->user()
            ->lots()
            ->create($request->validated());

        $lot->loadCount('soilAnalyses');

        return (new LotResource($lot))
            ->response()
            ->setStatusCode(201);
    }

    /**
     * GET /api/v1/lots/{lot}?include=analyses,plan
     */
    public function show(Request $request, Lot $lot)
    {
        $this->authorize('view', $lot);

        $include = collect(explode(',', (string) $request->query('include')))
            ->map(fn ($v) => trim($v))
            ->filter()
            ->values();

        $with = [];
        if ($include->contains('analyses')) {
            if ($include->contains('plan')) {
                $with['soilAnalyses'] = function ($q) {
                    $q->latest()->with('plan');
                };
            } else {
                $with['soilAnalyses'] = function ($q) {
                    $q->latest();
                };
            }
        }

        if (!empty($with)) {
            $lot->load($with);
        }
        $lot->loadCount('soilAnalyses');

        return new LotResource($lot);
    }

    /**
     * PUT /api/v1/lots/{lot}
     */
    public function update(StoreLotRequest $request, Lot $lot)
    {
        $this->authorize('update', $lot);

        $lot->update($request->validated());
        $lot->loadCount('soilAnalyses');

        return new LotResource($lot);
    }

    /**
     * DELETE /api/v1/lots/{lot}
     */
    public function destroy(Lot $lot)
    {
        $this->authorize('delete', $lot);

        $lot->delete();

        return response()->noContent(); // 204
    }
}