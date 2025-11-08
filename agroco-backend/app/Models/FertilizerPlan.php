<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FertilizerPlan extends Model
{
    protected $fillable = [
        'soil_analysis_id',
        'download_token',

        // Nutrientes objetivo (kg/ha)
        'n', 'p2o5', 'k2o', 's',

        // Flags
        'use_zn_soil',
        'use_mn_foliar',

        // Productos principales (kg/ha o kg totales por lote según contexto)
        'urea_46',
        'asam_21_24s',
        'dap_18_46_0',
        'kcl_0_0_60',
        'k2so4_0_0_50_18s',
        'yeso_agricola',
        'cal_agricola',
        'kieserita_16mg_13s',
        'dolomita',

        // Micronutrientes
        'znso4_suelo',
        'znso4_foliar',
        'mnso4_suelo',
        'mnso4_foliar',
        'borax_11b',
        'cuso4_25cu',
        'fe_eddha_6fe',

        // Campos JSON flexibles
        'split',         // distribución por fase
        'phases',
        'nutrients',
        'schedule',
        'observations',
        'summary',
    ];

    protected $casts = [
        // Numéricos a float
        'n' => 'float',
        'p2o5' => 'float',
        'k2o' => 'float',
        's' => 'float',

        'urea_46' => 'float',
        'asam_21_24s' => 'float',
        'dap_18_46_0' => 'float',
        'kcl_0_0_60' => 'float',
        'k2so4_0_0_50_18s' => 'float',
        'yeso_agricola' => 'float',
        'cal_agricola' => 'float',
        'kieserita_16mg_13s' => 'float',
        'dolomita' => 'float',

        'znso4_suelo' => 'float',
        'znso4_foliar' => 'float',
        'mnso4_suelo' => 'float',
        'mnso4_foliar' => 'float',
        'borax_11b' => 'float',
        'cuso4_25cu' => 'float',
        'fe_eddha_6fe' => 'float',

        // Flags
        'use_zn_soil' => 'boolean',
        'use_mn_foliar' => 'boolean',

        // JSON
        'split'        => 'array',
        'phases'       => 'array',
        'nutrients'    => 'array',
        'schedule'     => 'array',
        'observations' => 'array',
        'summary'      => 'array',
    ];

    // Cada plan pertenece a un análisis de suelo
    public function soilAnalysis(): BelongsTo
    {
        // FK por convención: soil_analysis_id (no hace falta pasarlo)
        return $this->belongsTo(SoilAnalysis::class);
    }
}
