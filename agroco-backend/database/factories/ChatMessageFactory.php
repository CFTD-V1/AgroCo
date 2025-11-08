<?php

namespace Database\Factories;

use App\Models\ChatMessage;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ChatMessage>
 */
class ChatMessageFactory extends Factory
{
    protected $model = ChatMessage::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'role' => $this->faker->randomElement(['user', 'bot']),
            'intent' => $this->faker->randomElement(['greeting', 'fallback', null]),
            'message' => $this->faker->sentence(),
            'meta' => ['sample' => true],
        ];
    }
}
