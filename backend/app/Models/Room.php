<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Room extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'moderator_token',
        'moderator_name',
        'deck_type',
        'disabled_cards',
        'sprint_goal',
        'max_players',
        'started',
    ];

    protected $casts = [
        'disabled_cards' => 'array',
        'started' => 'boolean',
    ];

    // Never serialize this — it's the sole credential proving moderator identity.
    protected $hidden = ['moderator_token'];

    /**
     * Generate a short, URL-safe, unique room code — same character pool the frontend
     * used to generate client-side before the backend existed (see the now-unused
     * generateRoomCode() in src/utils/helpers.js).
     */
    public static function generateUniqueCode(): string
    {
        do {
            $code = Str::random(8);
        } while (static::where('code', $code)->exists());

        return $code;
    }
}
