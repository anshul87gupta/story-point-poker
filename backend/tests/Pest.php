<?php

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/*
|--------------------------------------------------------------------------
| Test Case
|--------------------------------------------------------------------------
|
| The closure you provide to your test functions is always bound to a specific PHPUnit test
| case class. By default, that class is "PHPUnit\Framework\TestCase". Of course, you may
| need to change it using the "pest()" function to bind different classes or traits.
|
*/

pest()->extend(TestCase::class)
 // ->use(RefreshDatabase::class)
    ->in('Feature');

/*
|--------------------------------------------------------------------------
| Expectations
|--------------------------------------------------------------------------
|
| When you're writing tests, you often need to check that values meet certain conditions. The
| "expect()" function gives you access to a set of "expectations" methods that you can use
| to assert different things. Of course, you may extend the Expectation API at any time.
|
*/

expect()->extend('toBeOne', function () {
    return $this->toBe(1);
});

/*
|--------------------------------------------------------------------------
| Functions
|--------------------------------------------------------------------------
|
| While Pest is very powerful out-of-the-box, you may have some testing code specific to your
| project that you don't want to repeat in every file. Here you can also expose helpers as
| global functions to help you to reduce the number of lines of code in your test files.
|
*/

function something()
{
    // ..
}

function csrfToken(): string
{
    $response = test()->get('/sanctum/csrf-cookie');
    $setCookieHeader = $response->headers->get('set-cookie');

    if (is_string($setCookieHeader)) {
        $cookieHeader = $setCookieHeader;
    } elseif (is_array($setCookieHeader) && count($setCookieHeader) > 0) {
        $cookieHeader = $setCookieHeader[0];
    } else {
        throw new RuntimeException('CSRF cookie was not set in the response.');
    }

    preg_match('/XSRF-TOKEN=([^;]+)/', $cookieHeader, $matches);

    if (! isset($matches[1])) {
        throw new RuntimeException('XSRF-TOKEN cookie was not present in the response.');
    }

    return urldecode($matches[1]);
}
