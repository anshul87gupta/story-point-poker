<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rooms', function (Blueprint $table) {
            $table->id();
            $table->string('code', 12)->unique();

            // The creator never needs an account (frictionless "no signup to create a room"
            // model, preserved from the original prototype). This token is the sole proof of
            // moderator identity — returned once at creation, sent back as a header on every
            // moderator-only request (deck settings, sprint goal, starting estimation).
            $table->string('moderator_token', 64);
            $table->string('moderator_name');

            $table->string('deck_type')->default('scrum');
            $table->json('disabled_cards')->nullable();
            $table->string('sprint_goal', 250)->nullable();
            $table->unsignedTinyInteger('max_players')->default(10);

            // Whether the moderator has clicked "Start Estimating" yet — lets a refresh land
            // back on the invite screen vs. the voting screen correctly.
            $table->boolean('started')->default(false);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rooms');
    }
};
