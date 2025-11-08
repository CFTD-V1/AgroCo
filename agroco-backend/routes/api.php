<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use App\Http\Controllers\{
    AuthController,
    LotController,
    SoilAnalysisController,
    RecommendationController,
    FertilizerPlanController,
    ChatbotController
};

Route::prefix('v1')->group(function () {

    // ========= RUTAS PÚBLICAS =========
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login',    [AuthController::class, 'login'])->middleware('throttle:5,1');
    // Avatar público (para <img src=...>)
    Route::get('/avatar/{user}', [AuthController::class, 'avatar']);

    // Tabla de requerimientos de arroz (para el frontend)
    Route::get('/rice/requirements', [RecommendationController::class, 'riceRequirements']);

    // ========= LINK FIRMADO (descarga directa con token rotatorio) =========
    Route::get('/fert-plans/{plan}/download/{token}', [FertilizerPlanController::class, 'download'])
        ->middleware('signed')
        ->name('fert-plans.download');

    // ========= RUTAS PROTEGIDAS =========
    Route::middleware(['auth:sanctum'])->group(function () {

        // --- Sesión / Perfil ---
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me',      [AuthController::class, 'me']);
        Route::post('/password/change', [AuthController::class, 'changePassword']);
        Route::put('/profile', [AuthController::class, 'updateProfile']);
        Route::post('/profile/photo', [AuthController::class, 'updatePhoto']);

        // --- Lotes ---
        Route::get(   '/lots',          [LotController::class, 'index']);
        Route::post(  '/lots',          [LotController::class, 'store']);
        Route::get(   '/lots/{lot}',    [LotController::class, 'show']);
        Route::put(   '/lots/{lot}',    [LotController::class, 'update']);
        Route::delete('/lots/{lot}',    [LotController::class, 'destroy']);

        // --- Análisis de suelo (manual) ---
        Route::get(   '/soil-analyses',                [SoilAnalysisController::class, 'index']);
        Route::post(  '/lots/{lot}/soil-analyses',     [SoilAnalysisController::class, 'store']);
        Route::get(   '/soil-analyses/{soilAnalysis}', [SoilAnalysisController::class, 'show'])->name('soil-analyses.show');
        Route::put(   '/soil-analyses/{soilAnalysis}', [SoilAnalysisController::class, 'update']);
        Route::delete('/soil-analyses/{soilAnalysis}', [SoilAnalysisController::class, 'destroy']);

        // --- Plan de fertilización ---
        // Genera el plan, guarda el PDF y retorna un link de descarga directa (firmado)
        Route::post('/soil-analyses/{soilAnalysis}/plan/generate', [FertilizerPlanController::class, 'generate']);
        Route::post('/assistant/chat', [ChatbotController::class, 'respond'])->middleware('throttle:assistant');

        // --- Mercado: Precio del arroz (COP/tonelada)
        Route::get('/market/rice', function (\Illuminate\Http\Request $request) {
            $period = $request->query('period', 'hour'); // 'hour' | 'day'
            $ttl = $period === 'day' ? 60 * 60 * 24 : 60 * 60; // 1 día u 1 hora

            return Cache::remember("market.rice.$period", $ttl, function () use ($request) {
                $url = config('services.rice_price.url') ?: env('RICE_PRICE_URL');
                $price = null;
                $extract = function (string $html): ?int {
                    // Extrae números (1.234.567 / 1,234,567) y revisa contexto para unidad
                    $pattern = '/(\d{1,3}(?:[.,]\d{3}){1,3})(?![\d.,])/';
                    if (!preg_match_all($pattern, $html, $m, PREG_OFFSET_CAPTURE)) return null;
                    $best = null; $bestScore = -INF;
                    foreach ($m[1] as $match) {
                        [$valStr, $pos] = $match; $val = (int) str_replace([',','.'], '', $valStr);
                        // Contexto alrededor del número
                        $start = max(0, $pos - 64); $ctx = strtolower(substr($html, $start, 128));
                        $unit = 'unknown'; $score = 0; $converted = $val;
                        if (strpos($ctx,'tonelad') !== false || strpos($ctx,'t/ha') !== false) { $unit = 'ton'; $score += 3; }
                        if (strpos($ctx,'kg') !== false) { $unit = 'kg'; }
                        if (strpos($ctx,'carga') !== false) { $unit = 'carga'; }
                        if (strpos($ctx,'arroz') !== false) { $score += 1; }
                        // Conversión a COP/ton
                        switch ($unit) {
                            case 'kg':    $converted = $val * 1000; break;      // COP/kg -> COP/ton
                            case 'carga': $converted = $val * 8; break;         // 1 carga = 125 kg
                            default:      $converted = $val; break;              // asumimos ya es COP/ton
                        }
                        // Filtro por rango razonable de COP/ton
                        if ($converted < 200000 || $converted > 10000000) continue;
                        // Prefiere valores con unidad explícita de tonelada
                        if ($score > $bestScore || ($score === $bestScore && $converted > (int)($best ?? 0))) {
                            $best = $converted; $bestScore = $score;
                        }
                    }
                    return $best ? (int)$best : null;
                };

                if ($url) {
                    try {
                        $resp = Http::timeout(15)->get($url);
                        if ($resp->ok()) {
                            $html = $resp->body();
                            $price = $extract($html);
                        }
                    } catch (\Throwable $e) {
                        // Silencioso: volverá a cache o fallback
                    }
                }

                if (!$price) {
                    $prev = Cache::get('market.rice.last');
                    if ($prev) $price = (int) $prev;
                }
                if (!$price) $price = 1600000; // fallback

                Cache::put('market.rice.last', $price, 60 * 60 * 24 * 7);

                // Actualiza historial diario (mantiene últimos 120 días)
                try {
                    $histKey = 'market.rice.history';
                    $history = Cache::get($histKey, []);
                    $today = now()->toDateString();
                    $last = end($history);
                    if (!$last || ($last['date'] ?? null) !== $today) {
                        $history[] = [ 'date' => $today, 'price' => (int)$price ];
                        if (count($history) > 120) { $history = array_slice($history, -120); }
                        Cache::put($histKey, $history, 60 * 60 * 24 * 365);
                    }
                } catch (\Throwable $e) {}

                return response()->json([
                    'price' => (int) $price,
                    'source' => $url ?: 'not-configured',
                    'updated_at' => now()->toIso8601String(),
                    'period' => $period,
                ]);
            });
        });

        // Historial de precios (últimos N días)
        Route::get('/market/rice/history', function (\Illuminate\Http\Request $request) {
            $days = max(1, min(365, (int) $request->query('days', 60)));
            $hist = Cache::get('market.rice.history', []);
            // Si no hay historial aún, generamos uno sintético alrededor del último precio
            if (empty($hist)) {
                $base = Cache::get('market.rice.last');
                if (!$base) {
                    // Como último recurso, intenta leer ahora el endpoint de precio (mismo proceso que /market/rice)
                    $url = config('services.rice_price.url') ?: env('RICE_PRICE_URL');
                    try {
                        if ($url) {
                            $resp = Http::timeout(10)->get($url);
                            if ($resp->ok()) {
                                $html = $resp->body();
                                // Reutiliza un extractor simple
                                if (preg_match_all('/(\d{1,3}(?:[.,]\d{3}){1,3})(?![\d.,])/', $html, $m)) {
                                    $cands = array_map(fn($s) => (int) str_replace([',','.'], '', $s), $m[1]);
                                    rsort($cands);
                                    foreach ($cands as $n) { if ($n >= 200000 && $n <= 10000000) { $base = $n; break; } }
                                }
                            }
                        }
                    } catch (\Throwable $e) {}
                }
                if (!$base) $base = 1600000;
                // Genera N días hacia atrás con una caminata aleatoria pequeña (±0.3%)
                $series = [];
                $val = (int) $base;
                for ($i = $days - 1; $i >= 0; $i--) {
                    $date = now()->copy()->subDays($i)->toDateString();
                    // pequeño drift salvo para el último (hoy)
                    if ($i > 0) {
                        $drift = (mt_rand(-3, 3)) / 1000.0; // ±0.3%
                        $val = max(1200000, min(5000000, (int) round($val * (1 + $drift))));
                    }
                    $series[] = [ 'date' => $date, 'price' => $val ];
                }
                $hist = $series;
                Cache::put('market.rice.history', $hist, 60 * 60 * 24 * 365);
            }
            if ($days && count($hist) > $days) {
                $hist = array_slice($hist, -$days);
            }
            return response()->json([
                'history' => array_values($hist),
                'days' => $days,
                'updated_at' => now()->toIso8601String(),
            ]);
        });
    });

    // Respuesta a preflight CORS (OPTIONS) para cualquier ruta de v1
    Route::options('/{any}', function () {
        return response()->noContent();
    })->where('any', '.*');
});


