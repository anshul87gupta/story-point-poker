<?php

it('returns a healthy response from /api/health', function () {
    $response = $this->getJson('/api/health');

    $response
        ->assertOk()
        ->assertJson(['status' => 'ok'])
        ->assertJsonStructure(['status', 'service', 'timestamp']);
});
