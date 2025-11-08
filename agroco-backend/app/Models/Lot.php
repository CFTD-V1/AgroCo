<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Lot extends Model
{
    use HasFactory;
    protected $fillable = [
        'user_id',
        'name',
        'farm_name',     // ✅ nombre de la finca
        'owner_name',    // ✅ propietario del lote
        'area_ha',
        'crop',
        'location',
        'sowing_date',   // ✅ agregado para la fecha de siembra
    ];

    protected $casts = [
        'location'    => 'array',
        'sowing_date' => 'date',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function soilAnalyses(): HasMany
    {
        return $this->hasMany(SoilAnalysis::class);
    }

    public function fertilizerPlans(): HasMany
    {
        return $this->hasMany(FertilizerPlan::class);
    }
}
