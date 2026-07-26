<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Illuminate\Testing\TestResponse;

abstract class TestCase extends BaseTestCase
{
    protected function withCsrfHeaders(array $headers = []): array
    {
        return array_merge($headers, ['X-XSRF-TOKEN' => csrfToken()]);
    }

    protected function postJsonWithCsrf(string $uri, array $data = [], array $headers = []): TestResponse
    {
        return $this->withHeaders($this->withCsrfHeaders($headers))->postJson($uri, $data);
    }

    protected function getJsonWithCsrf(string $uri, array $headers = []): TestResponse
    {
        return $this->withHeaders($this->withCsrfHeaders($headers))->getJson($uri);
    }
}
