<?php

namespace App\Http\Controllers;

use App\Http\Resources\FertilizerPlanResource;
use App\Mail\PlanFertilizacionMailable;
use App\Models\FertilizerPlan;
use App\Models\SoilAnalysis;
use App\Services\FertilizationCalculator;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Str;

class FertilizerPlanController extends Controller
{
    public function generate(SoilAnalysis $soilAnalysis, FertilizationCalculator $calculator): JsonResponse
    {
        $soilAnalysis->loadMissing('lot.user');
        $this->authorize('update', $soilAnalysis->lot);

        $result = (array) $calculator->buildPlan($soilAnalysis);
        $targets = $this->normalizeKeys((array) Arr::get($result, 'targets', []));
        $products = $this->normalizeKeys((array) Arr::get($result, 'products', []));
        $split = Arr::get($result, 'split', []);

        $pick = function (array $source, array|string $aliases, mixed $default = 0) {
            $aliases = is_array($aliases) ? $aliases : [$aliases];
            foreach ($aliases as $alias) {
                $key = strtolower((string) $alias);
                if (array_key_exists($key, $source)) {
                    return $source[$key];
                }
            }

            return $default;
        };

        $asNumber = static fn ($value) => is_numeric($value) ? round((float) $value, 2) : 0.0;

        /** @var FertilizerPlan $plan */
        $plan = $soilAnalysis->plan()->updateOrCreate([], [
            'download_token'     => Str::random(40),
            'n'                  => $asNumber($pick($targets, 'n')),
            'p2o5'               => $asNumber($pick($targets, 'p2o5')),
            'k2o'                => $asNumber($pick($targets, 'k2o')),
            's'                  => $asNumber($pick($targets, 's')),
            'use_zn_soil'        => (bool) $pick($targets, ['use_zn_soil', 'usar_zinc_suelo'], false),
            'use_mn_foliar'      => (bool) $pick($targets, ['use_mn_foliar', 'usar_manganeso_foliar'], true),
            'urea_46'            => $asNumber($pick($products, 'urea_46')),
            'asam_21_24s'        => $asNumber($pick($products, ['asam_21_24s', 'sulfato_amonio_21_24s'])),
            'dap_18_46_0'        => $asNumber($pick($products, 'dap_18_46_0')),
            'kcl_0_0_60'         => $asNumber($pick($products, 'kcl_0_0_60')),
            'k2so4_0_0_50_18s'   => $asNumber($pick($products, 'k2so4_0_0_50_18s')),
            'yeso_agricola'      => $asNumber($pick($products, 'yeso_agricola')),
            'cal_agricola'       => $asNumber($pick($products, 'cal_agricola')),
            'kieserita_16mg_13s' => $asNumber($pick($products, 'kieserita_16mg_13s')),
            'dolomita'           => $asNumber($pick($products, 'dolomita')),
            'znso4_suelo'        => $asNumber($pick($products, ['znso4_suelo', 'znso4 suelo'])),
            'znso4_foliar'       => $asNumber($pick($products, 'znso4_foliar')),
            'mnso4_suelo'        => $asNumber($pick($products, 'mnso4_suelo')),
            'mnso4_foliar'       => $asNumber($pick($products, 'mnso4_foliar')),
            'borax_11b'          => $asNumber($pick($products, ['borax_11b', 'borax_11B'])),
            'cuso4_25cu'         => $asNumber($pick($products, ['cuso4_25cu', 'cuso4_25Cu'])),
            'fe_eddha_6fe'       => $asNumber($pick($products, ['fe_eddha_6fe', 'fe_eddha_6Fe'])),
            'split'              => $split,
        ])->fresh();

        $plan->loadMissing('soilAnalysis.lot');

        $resource = (new FertilizerPlanResource($plan))->toArray(request());

        if ($this->hasInvalidNumbers($resource)) {
            Log::channel('agroco')->warning('Plan de fertilización con valores no válidos detectado', [
                'plan_id' => $plan->id,
                'payload' => $resource,
            ]);

            return response()->json([
                'message' => 'El plan generado contiene valores fuera de rango. Revisa el análisis o intenta de nuevo.',
            ], 422);
        }

        $storage = Storage::disk('public');
        $directory = 'plans';
        if (!$storage->exists($directory)) {
            $storage->makeDirectory($directory);
        }

        $filename = sprintf('plan_fertilizacion_%d_%s.pdf', $plan->id, $plan->download_token);
        $relativePath = "{$directory}/{$filename}";

        foreach ($storage->files($directory) as $path) {
            if (str_starts_with($path, "plan_fertilizacion_{$plan->id}_") && $path !== $relativePath) {
                $storage->delete($path);
            }
        }

        $pdf = Pdf::loadView('pdf.plan_fertilizacion', [
            'plan' => $resource,
            'lot'  => $soilAnalysis->lot,
            'soil' => $soilAnalysis,
        ])->output();

        $storage->put($relativePath, $pdf);

        $signedUrl = URL::temporarySignedRoute(
            'fert-plans.download',
            now()->addDay(),
            ['plan' => $plan->id, 'token' => $plan->download_token]
        );

        $mailSent = false;
        $user = $soilAnalysis->lot->user;
        if ($user && $user->email && $user->email_verified_at) {
            Mail::to($user->email)->send(
                new PlanFertilizacionMailable(
                    $soilAnalysis->lot,
                    $soilAnalysis,
                    $resource,
                    storage_path("app/public/{$relativePath}")
                )
            );
            $mailSent = true;
        }

        Log::channel('agroco')->info('Plan de fertilización generado', [
            'plan_id' => $plan->id,
            'soil_analysis_id' => $soilAnalysis->id,
            'lot_id' => $soilAnalysis->lot_id,
            'mail_sent' => $mailSent,
            'user_id' => $soilAnalysis->lot->user_id,
        ]);

        return response()->json([
            'message'         => 'Plan de fertilización generado o actualizado correctamente.',
            'soil_id'         => $soilAnalysis->id,
            'lot_id'          => $soilAnalysis->lot_id,
            'area_ha'         => $soilAnalysis->lot->area_ha ?? 1,
            'pdf_file'        => $filename,
            'pdf_path'        => $relativePath,
            'pdf_download'    => $signedUrl,
            'mail_sent'       => $mailSent,
            'plan'            => $resource,
            'email_pendiente' => $user && !$user->email_verified_at,
        ]);
    }

    public function download(FertilizerPlan $plan)
    {
        if (!request()->hasValidSignature()) {
            abort(401, 'Link inválido o expirado.');
        }

        $token = request()->route('token') ?? request('token');
        if (!$token || $token !== $plan->download_token) {
            abort(401, 'Token de descarga inválido.');
        }

        $storage = Storage::disk('public');
        $file = collect($storage->files('plans'))
            ->first(fn ($path) => str_starts_with(basename($path), "plan_fertilizacion_{$plan->id}_"));

        if (!$file || !$storage->exists($file)) {
            abort(404, 'Archivo no encontrado.');
        }

        $filename = basename($file);
        $absolute = storage_path("app/public/{$file}");

        return response()->download($absolute, $filename, [
            'Content-Type'        => 'application/pdf',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ]);
    }

    private function normalizeKeys(array $data): array
    {
        $output = [];
        foreach ($data as $key => $value) {
            $output[strtolower((string) $key)] = $value;
        }

        return $output;
    }

    private function hasInvalidNumbers(array $data): bool
    {
        $invalid = false;

        $walker = function ($value) use (&$invalid, &$walker) {
            if ($invalid) {
                return;
            }

            if (is_array($value)) {
                array_walk($value, $walker);
                return;
            }

            if (is_numeric($value)) {
                $number = (float) $value;
                if (!is_finite($number) || abs($number) > 100000) {
                    $invalid = true;
                }
            }
        };

        array_walk($data, $walker);

        return $invalid;
    }
}
