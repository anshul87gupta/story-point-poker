<?php

namespace Database\Factories;

use App\Models\Room;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Room>
 */
class RoomFactory extends Factory
{
    protected $model = Room::class;

    public function definition(): array
    {
        return [
            'code' => Room::generateUniqueCode(),
            'moderator_token' => Str::random(48),
            'moderator_name' => $this->faker->firstName(),
            'deck_type' => 'scrum',
            'disabled_cards' => [],
            'sprint_goal' => null,
            'max_players' => 10,
            'started' => false,
        ];
    }
}
