<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends Factory<User>
 */
class UserFactory extends Factory
{
    protected static ?string $password = null;

    public function definition(): array
    {
        $firstName = $this->faker->firstName();
        $secondName = $this->faker->firstName();
        $firstSurname = $this->faker->lastName();
        $secondSurname = $this->faker->lastName();

        $fullName = "{$firstName} {$secondName} {$firstSurname} {$secondSurname}";

        $document = (string) $this->faker->numberBetween(100000, 999999999);

        return [
            'primer_nombre'        => $firstName,
            'segundo_nombre'       => $secondName,
            'primer_apellido'      => $firstSurname,
            'segundo_apellido'     => $secondSurname,
            'ocupacion'            => $this->faker->jobTitle(),
            'telefono'             => $this->faker->numerify('3#########'),
            'tipo_documento'       => 'CC',
            'documento_identidad'  => $document,
            'username'             => Str::slug($firstName.$firstSurname.$this->faker->unique()->randomDigit()),
            'password'             => static::$password ??= Hash::make('password'),
            'must_change_password' => false,
            'email'                => $this->faker->unique()->safeEmail(),
            'email_verified_at'    => now(),
            'normalized_full_name' => User::normalizeNameStatic($fullName),
            'failed_login_attempts'=> 0,
            'locked_until'         => null,
            'api_token'            => Str::random(60),
            'remember_token'       => Str::random(10),
        ];
    }

    public function unverified(): static
    {
        return $this->state(fn () => [
            'email_verified_at' => null,
        ]);
    }
}
