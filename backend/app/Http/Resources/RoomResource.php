<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RoomResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'code' => $this->code,
            'moderatorName' => $this->moderator_name,
            'deckType' => $this->deck_type,
            'disabledCards' => $this->disabled_cards ?? [],
            'sprintGoal' => $this->sprint_goal,
            'maxPlayers' => $this->max_players,
            'started' => $this->started,
        ];
    }
}
