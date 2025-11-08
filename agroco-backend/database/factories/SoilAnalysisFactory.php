<?php

namespace Database\Factories;

use App\Models\Lot;
use App\Models\SoilAnalysis;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<SoilAnalysis>
 */
class SoilAnalysisFactory extends Factory
{
    protected $model = SoilAnalysis::class;

    public function definition(): array
    {
        return [
            'lot_id'             => Lot::factory(),
            'sampled_at'         => $this->faker->dateTimeBetween('-1 month', 'now'),
            'yield_target_t_ha'  => $this->faker->randomFloat(1, 6, 10),
            'p_mgkg'             => $this->faker->randomFloat(1, 5, 30),
            'k_cmol'             => $this->faker->randomFloat(2, 0.2, 0.6),
            'ca_cmol'            => $this->faker->randomFloat(2, 4, 10),
            'mg_cmol'            => $this->faker->randomFloat(2, 1, 4),
            's_mgkg'             => $this->faker->randomFloat(1, 5, 20),
            'b_mgkg'             => $this->faker->randomFloat(2, 0.2, 0.6),
            'fe_mgkg'            => $this->faker->randomFloat(1, 20, 80),
            'mn_mgkg'            => $this->faker->randomFloat(1, 3, 10),
            'zn_mgkg'            => $this->faker->randomFloat(1, 1, 3),
            'cu_mgkg'            => $this->faker->randomFloat(1, 0.5, 2),
        ];
    }
}

