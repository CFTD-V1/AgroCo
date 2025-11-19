<?php

namespace App\Services;

use App\Models\SoilAnalysis;
use Illuminate\Support\Arr;

/**
 * Calculadora de planes de fertilización para arroz.
 *
 * Objetivos:
 * - Calcular dosis base de N, P2O5, K2O y S según fertilidad y meta de rendimiento.
 * - Ajustar Ca y Mg a partir de las metas de saturación.
 * - Recomendar aplicaciones de micronutrientes cuando estén por debajo del nivel crítico.
 * - Generar una mezcla de productos y un cronograma simple (siembra, macollamiento, espigamiento).
 */
class FertilizationCalculator
{
    private const TARGETS = [
        'N'    => 120.0,
        'P2O5' => 30.0,
        'K2O'  => 100.0,
        'S'    => 20.0,
        'sat'  => [
            'Ca' => 65.0,
            'Mg' => 10.0,
            'K'  => 3.0,
            'Na' => 2.0,
        ],
        'criticals' => [
            'Zn' => 2.0,
            'Mn' => 5.0,
            'B'  => 0.3,
            'Cu' => 0.5,
            'Fe' => 4.0,
        ],
        'micros_dose_kg_ha' => [
            'Zn_soil'   => 10.0,
            'Zn_foliar' => 1.0,
            'Mn_foliar' => 4.5,
            'B_soil'    => 2.0,
            'Cu_soil'   => 5.0,
            'Fe_soil'   => 10.0,
        ],
    ];

    private const CMOL_TO_KG = [
        'Ca' => 400.0,
        'Mg' => 240.0,
        'K'  => 780.0,
        'Na' => 230.0,
    ];

    private const SOURCES = [
        'urea_46'            => ['N' => 0.46],
        'asam_21_24s'        => ['N' => 0.21, 'S' => 0.24],
        'dap_18_46_0'        => ['N' => 0.18, 'P2O5' => 0.46],
        'kcl_0_0_60'         => ['K2O' => 0.60],
        'k2so4_0_0_50_18s'   => ['K2O' => 0.50, 'S' => 0.18],
        'yeso_agricola'      => ['Ca' => 0.233, 'S' => 0.186],
        'cal_agricola'       => ['Ca' => 0.40],
        'kieserita_16mg_13s' => ['Mg' => 0.16, 'S' => 0.13],
        'dolomita'           => ['Ca' => 0.30, 'Mg' => 0.22],
        'znso4_suelo'        => ['Zn' => 0.36],
        'znso4_foliar'       => ['Zn' => 0.36],
        'mnso4_foliar'       => ['Mn' => 0.31],
        'borax_11b'          => ['B'  => 0.11],
        'cuso4_25cu'         => ['Cu' => 0.25],
        'fe_eddha_6fe'       => ['Fe' => 0.06],
    ];

    private const MAX_AMENDMENTS = [
        'yeso_agricola'      => 2000.0,
        'cal_agricola'       => 2000.0,
        'dolomita'           => 2000.0,
        'kieserita_16mg_13s' => 500.0,
    ];

    public function buildPlan(SoilAnalysis $analysis): array
    {
        $targets     = config('nutrients.targets.rice', self::TARGETS);
        $cmolToKg    = config('nutrients.cmol_to_kg_per_ha', self::CMOL_TO_KG);
        $sources     = config('nutrients.sources', self::SOURCES);
        $maxAmend    = config('nutrients.max_amendment_kg_ha', self::MAX_AMENDMENTS);
        $critical    = Arr::get($targets, 'criticals', self::TARGETS['criticals']);
        $microDoses  = Arr::get($targets, 'micros_dose_kg_ha', self::TARGETS['micros_dose_kg_ha']);
        $satTargets  = Arr::get($targets, 'sat', self::TARGETS['sat']);
        $znCritical  = max((float) ($critical['Zn'] ?? self::TARGETS['criticals']['Zn']), 2.0);
        $mnCritical  = (float) ($critical['Mn'] ?? self::TARGETS['criticals']['Mn']);

        // Clasificaciones base
        $pClass  = $this->classifyPhosphorus($analysis->p_mgkg);
        $kClass  = $this->classifyPotassium($analysis->k_cmol);
        $sClass  = $this->classifySulfur($analysis->s_mgkg);
        $znClass = $this->classifyZinc($analysis->zn_mgkg);
        $mnClass = $this->classifyManganese($analysis->mn_mgkg);

        // Metas principales
        $yield = max(0.0, (float) $analysis->yield_target_t_ha);
        $nitrogen = $this->nitrogenTarget($yield);
        $p2o5 = $this->phosphorusTarget($pClass);
        $k2o = $this->potassiumTarget($kClass);
        $sulfur = $this->sulfurTarget($sClass);
        $useZnSoil = $analysis->zn_mgkg !== null && (float) $analysis->zn_mgkg < $znCritical;
        $useMnFoliar = $analysis->mn_mgkg !== null && (float) $analysis->mn_mgkg < $mnCritical;

        $organicRecommendation = null;
        if (isset($analysis->mo_pct)) {
            $mo = (float) $analysis->mo_pct;
            if ($mo < 3.0) {
                $organicRecommendation = 'Se recomienda aplicar entre 2 y 4 t/ha de compost o abono orgánico bien descompuesto para mejorar la materia orgánica y la estructura del suelo.';
            } else {
                $organicRecommendation = 'La materia orgánica del suelo es adecuada (≥ 3 %). Mantén las prácticas actuales de manejo.';
            }
        }

        // Ajustes de Ca y Mg por saturación
        $calciumNeed = $this->baseDeficit(
            value: (float) $analysis->ca_cmol,
            targetPercent: $satTargets['Ca'] ?? self::TARGETS['sat']['Ca'],
            cec: (float) $analysis->cec_cmol,
            factor: $cmolToKg['Ca']
        );

        $magnesiumNeed = $this->baseDeficit(
            value: (float) $analysis->mg_cmol,
            targetPercent: $satTargets['Mg'] ?? self::TARGETS['sat']['Mg'],
            cec: (float) $analysis->cec_cmol,
            factor: $cmolToKg['Mg']
        );

        // Distribución de productos
        $products = array_fill_keys(array_keys($sources), 0.0);

        // Enmiendas de Ca y Mg
        $gypsum = $calciumNeed > 0
            ? min($calciumNeed / $sources['yeso_agricola']['Ca'], $maxAmend['yeso_agricola'])
            : 0.0;
        $products['yeso_agricola'] = round($gypsum, 1);
        $calciumNeed = max(0.0, $calciumNeed - $gypsum * $sources['yeso_agricola']['Ca']);
        $sulfur = max(0.0, $sulfur - $gypsum * $sources['yeso_agricola']['S']);

        $kieserite = $magnesiumNeed > 0
            ? min($magnesiumNeed / $sources['kieserita_16mg_13s']['Mg'], $maxAmend['kieserita_16mg_13s'])
            : 0.0;
        $products['kieserita_16mg_13s'] = round($kieserite, 1);
        $magnesiumNeed = max(0.0, $magnesiumNeed - $kieserite * $sources['kieserita_16mg_13s']['Mg']);
        $sulfur = max(0.0, $sulfur - $kieserite * $sources['kieserita_16mg_13s']['S']);

        if ($calciumNeed > 0) {
            $lime = min($calciumNeed / $sources['cal_agricola']['Ca'], $maxAmend['cal_agricola']);
            $products['cal_agricola'] = round($lime, 1);
            $calciumNeed = max(0.0, $calciumNeed - $lime * $sources['cal_agricola']['Ca']);
        }

        if ($magnesiumNeed > 0) {
            $dolomite = min($magnesiumNeed / $sources['dolomita']['Mg'], $maxAmend['dolomita']);
            $products['dolomita'] = round($dolomite, 1);
            $calciumNeed = max(0.0, $calciumNeed - $dolomite * $sources['dolomita']['Ca']);
            $magnesiumNeed = max(0.0, $magnesiumNeed - $dolomite * $sources['dolomita']['Mg']);
        }

        // Nitrogen and Sulfur with ammonium sulfate
        $asam = $sulfur > 0 ? $sulfur / $sources['asam_21_24s']['S'] : 0.0;
        $products['asam_21_24s'] = round($asam, 1);
        $nitrogenFromAsam = $asam * $sources['asam_21_24s']['N'];

        // Phosphorus with DAP
        $dap = $p2o5 > 0 ? $p2o5 / $sources['dap_18_46_0']['P2O5'] : 0.0;
        $products['dap_18_46_0'] = round($dap, 1);
        $nitrogenFromDap = $dap * $sources['dap_18_46_0']['N'];

        // Potassium with KCl (optionally could switch to K2SO4)
        $kcl = $k2o > 0 ? $k2o / $sources['kcl_0_0_60']['K2O'] : 0.0;
        $products['kcl_0_0_60'] = round($kcl, 1);

        // Complement nitrogen with urea
        $nitrogenRemaining = max(0.0, $nitrogen - ($nitrogenFromAsam + $nitrogenFromDap));
        $urea = $nitrogenRemaining > 0 ? $nitrogenRemaining / $sources['urea_46']['N'] : 0.0;
        $products['urea_46'] = round($urea, 1);

        // Micronutrients (suelo)
        if ($useZnSoil) {
            $products['znso4_suelo'] = round(
                $microDoses['Zn_soil'] / $sources['znso4_suelo']['Zn'],
                1
            );
        }

        if ($this->needsMicronutrient($analysis->b_mgkg, $critical['B'] ?? 0.3)) {
            $products['borax_11b'] = round(
                $microDoses['B_soil'] / $sources['borax_11b']['B'],
                1
            );
        }

        if ($this->needsMicronutrient($analysis->cu_mgkg, $critical['Cu'] ?? 0.5)) {
            $products['cuso4_25cu'] = round(
                $microDoses['Cu_soil'] / $sources['cuso4_25cu']['Cu'],
                1
            );
        }

        if ($this->needsMicronutrient($analysis->fe_mgkg, $critical['Fe'] ?? 4.0)) {
            $products['fe_eddha_6fe'] = round(
                $microDoses['Fe_soil'] / $sources['fe_eddha_6fe']['Fe'],
                1
            );
        }

        // Manganeso foliar (solo cuando Mn < nivel crítico)
        $products['mnso4_foliar'] = $useMnFoliar
            ? round($microDoses['Mn_foliar'], 1)
            : 0.0;

        // Plan de aplicación por fases
        $schedule = $this->buildSchedule($products);

        return [
            'targets' => [
                'N'            => round($nitrogen, 1),
                'P2O5'         => round($p2o5, 1),
                'K2O'          => round($k2o, 1),
                'S'            => round(max(0.0, $sulfur), 1),
                'sat_targets'  => $satTargets,
                'use_zn_soil'  => $useZnSoil,
                'use_mn_foliar'=> $useMnFoliar,
                'organic_matter_recommendation' => $organicRecommendation,
            ],
            'products' => array_map(fn ($value) => round((float) $value, 1), $products),
            'split'    => $schedule,
        ];
    }

    private function nitrogenTarget(float $yield): float
    {
        $base = 80.0 + 5.0 * $yield;
        return max(60.0, round($base / 5.0) * 5.0);
    }

    private function phosphorusTarget(string $class): float
    {
        return match ($class) {
            'low'    => 60.0,
            'medium' => 45.0,
            'high'   => 30.0,
            default  => 0.0,
        };
    }

    private function potassiumTarget(string $class): float
    {
        return match ($class) {
            'low'    => 130.0,
            'medium' => 100.0,
            'high'   => 80.0,
            default  => 0.0,
        };
    }

    private function sulfurTarget(string $class): float
    {
        return match ($class) {
            'low'    => 20.0,
            'medium' => 20.0,
            default  => 0.0,
        };
    }

    private function baseDeficit(float $value, float $targetPercent, float $cec, float $factor): float
    {
        $cec = max(0.1, $cec);
        $current = max(0.0, $value);
        $target = ($targetPercent / 100.0) * $cec;
        $deficit = max(0.0, $target - $current);

        return $deficit * $factor;
    }

    private function needsMicronutrient(mixed $value, float $critical): bool
    {
        if ($value === null) {
            return true;
        }

        return (float) $value < $critical;
    }

    private function classifyPhosphorus(?float $value): string
    {
        if ($value === null) {
            return 'medium';
        }

        if ($value < 6.0) {
            return 'low';
        }

        if ($value <= 10.0) {
            return 'medium';
        }

        return 'high';
    }

    private function classifyPotassium(?float $value): string
    {
        if ($value === null) {
            return 'medium';
        }

        if ($value < 0.20) {
            return 'low';
        }

        if ($value <= 0.30) {
            return 'medium';
        }

        return 'high';
    }

    private function classifySulfur(?float $value): string
    {
        if ($value === null) {
            return 'medium';
        }

        return $value < 10.0 ? 'low' : ($value <= 20.0 ? 'medium' : 'high');
    }

    private function classifyZinc(?float $value): string
    {
        if ($value === null) {
            return 'medium';
        }

        return $value < 1.0 ? 'low' : ($value <= 2.0 ? 'medium' : 'high');
    }

    private function classifyManganese(?float $value): string
    {
        if ($value === null) {
            return 'medium';
        }

        return $value < 5.0 ? 'low' : ($value <= 20.0 ? 'medium' : 'high');
    }

    /**
     * Genera el cronograma simplificado de aplicaciones.
     *
     * @param array<string,float> $products
     */
    private function buildSchedule(array $products): array
    {
        $urea = $products['urea_46'] ?? 0.0;
        $kcl  = $products['kcl_0_0_60'] ?? 0.0;

        return [
            'sowing' => [
                'yeso_agricola'      => $products['yeso_agricola'] ?? 0.0,
                'cal_agricola'       => $products['cal_agricola'] ?? 0.0,
                'kieserita_16mg_13s' => $products['kieserita_16mg_13s'] ?? 0.0,
                'dolomita'           => $products['dolomita'] ?? 0.0,
                'asam_21_24s'        => $products['asam_21_24s'] ?? 0.0,
                'dap_18_46_0'        => $products['dap_18_46_0'] ?? 0.0,
                'znso4_suelo'        => $products['znso4_suelo'] ?? 0.0,
                'borax_11b'          => $products['borax_11b'] ?? 0.0,
                'cuso4_25cu'         => $products['cuso4_25cu'] ?? 0.0,
                'fe_eddha_6fe'       => $products['fe_eddha_6fe'] ?? 0.0,
                'urea_46'            => round($urea * 0.20, 1),
                'kcl_0_0_60'         => round($kcl * 0.40, 1),
                'mnso4_foliar'       => 0.0,
            ],
            'tillering' => [
                'urea_46'      => round($urea * 0.45, 1),
                'kcl_0_0_60'   => round($kcl * 0.35, 1),
                'mnso4_foliar' => $products['mnso4_foliar'] ?? 0.0,
            ],
            'panicle' => [
                'urea_46'    => round($urea * 0.35, 1),
                'kcl_0_0_60' => round($kcl * 0.25, 1),
            ],
        ];
    }
}
