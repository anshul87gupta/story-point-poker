<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateRoomRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            // Matches the 4 deck keys in the frontend's src/config/decks.js
            'deck_type' => ['sometimes', 'string', Rule::in(['scrum', 'fibonacci', 'tshirt', 'powers2'])],
            'disabled_cards' => ['sometimes', 'array'],
            'disabled_cards.*' => ['string'],
            'sprint_goal' => ['sometimes', 'nullable', 'string', 'max:'.config('limits.sprint_goal_max')],
            'started' => ['sometimes', 'boolean'],
        ];
    }
}
