<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class SoilAnalysis extends Model
{
    use HasFactory;
    protected $fillable = [
        'lot_id',
        'sampled_at',
        'yield_target_t_ha',

        // Mayores
        'p_mgkg',
        'k_cmol',
        'ca_cmol',
        'mg_cmol',
        's_mgkg',

        // Menores
        'b_mgkg',
        'fe_mgkg',
        'mn_mgkg',
        'zn_mgkg',
        'cu_mgkg',
    ];

    protected $casts = [
        'sampled_at' => 'date',
    ];

    // Relación con Lote
    public function lot(): BelongsTo 
    {
        return $this->belongsTo(Lot::class);
    }

    // Relación 1:1 con FertilizerPlan
    public function plan(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(FertilizerPlan::class, 'soil_analysis_id');
    }

}
