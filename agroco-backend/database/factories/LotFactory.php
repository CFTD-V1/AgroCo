<?php

namespace Database\Factories;

use App\Models\Lot;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Lot>
 */
class LotFactory extends Factory
{
    protected $model = Lot::class;

    public function definition(): array
    {
        return [
            'user_id'  => User::factory(),
            'name'     => $this->faker->unique()->words(2, true),
            'area_ha'  => $this->faker->randomFloat(2, 1, 50),
            'crop'     => 'arroz',
            'location' => [
                'departamento' => $this->faker->state(),
                'municipio'    => $this->faker->city(),
            ],
            'sowing_date' => $this->faker->dateTimeBetween('-6 months', 'now')->format('Y-m-d'),
        ];
    }
}

