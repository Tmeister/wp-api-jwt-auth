<?php

namespace Laracasts\Integrated\Extensions\Traits;

use Laracasts\Integrated\Str;

trait ApiRequests
{

    /**
     * User-specified headers.
     *
     * @var array headers
     */
    protected $headers = [];

    /**
     * Make a GET request to an API endpoint.
     *
     * @param  string $uri
     * @return static
     */
    protected function get($uri)
    {
        $this->call('GET', $uri, [], [], [], $this->headers);

        return $this;
    }

    /**
     * Alias for "get" method.
     *
     * @param  string $uri
     * @return static
     */
    protected function hit($uri)
    {
        return $this->get($uri);
    }

    /**
     * Make a POST request to an API endpoint.
     *
     * @param  string $uri
     * @param  array  $data
     * @return static
     */
    protected function post($uri, array $data)
    {
        $this->call('POST', $uri, $data, [], [], $this->headers);

        return $this;
    }

    /**
     * Make a PUT request to an API endpoint.
     *
     * @param  string $uri
     * @param  array  $data
     * @return static
     */
    protected function put($uri, array $data)
    {
        $this->call('PUT', $uri, $data, [], [], $this->headers);

        return $this;
    }

    /**
     * Make a PATCH request to an API endpoint.
     *
     * @param  string $uri
     * @param  array  $data
     * @return static
     */
    protected function patch($uri, array $data)
    {
        $this->call('PATCH', $uri, $data, [], [], $this->headers);

        return $this;
    }

    /**
     * Make a DELETE request to an API endpoint.
     *
     * @param  string $uri
     * @return static
     */
    protected function delete($uri)
    {
        $this->call('DELETE', $uri, [], [], [], $this->headers);

        return $this;
    }

    /**
     * Assert that the last response is JSON.
     *
     * @return static
     */
    protected function seeJson()
    {
        $response = $this->response();

        $this->assertJson($response, "Failed asserting that the following response was JSON: {$response}");

        return $this;
    }

    /**
     * Alias for "seeJson" method.
     *
     * @return static
     */
    protected function seeIsJson()
    {
        return $this->seeJson();
    }

    /**
     * Assert that the status code equals the given code.
     *
     * @param  integer $code
     * @return static
     */
    protected function seeStatusCode($code)
    {
        $this->assertEquals($code, $this->statusCode());

        return $this;
    }

    /**
     * Alias for "seeStatusCode" method.
     *
     * @param  integer $code
     * @return static
     */
    protected function seeStatusCodeIs($code)
    {
        return $this->seeStatusCode($code);
    }

    /**
     * Assert that an API response equals the provided array
     * or json-encoded array.
     *
     * @param  array|string $expected
     * @return static
     */
    protected function seeJsonEquals($expected)
    {
        if (is_array($expected)) {
            $expected = json_encode($expected);
        }

        $this->assertJsonStringEqualsJsonString($expected, $this->response());

        return $this;
    }

    /**
     * Assert that an API response matches the provided array.
     *
     * @param  array $expected
     * @return static
     */
    protected function seeJsonContains($expected)
    {
        $response = json_decode($this->response(), true);

        $this->sortJson($expected);
        $this->sortJson($response);

        foreach ($expected as $key => $value) {
            if ( ! str_contains(json_encode($response), trim(json_encode([$key => $value]), '{}'))) {
                $this->fail(sprintf(
                    "Dang! Expected %s to exist in %s, but nope. Ideas?",
                    json_encode($expected), json_encode($response)
                ));
            }
        }
        
        return $this;
    }

    /**
     * Sort a JSON response, for easy assertions and comparisons.
     *
     * @param  array &$array
     * @return array
     */
    protected function sortJson(&$array)
    {
        foreach ($array as &$value) {
            if (is_array($value) && isset($value[0])) {
                sort($value);
            } elseif (is_array($value)) {
                $this->sortJson($value);
            }
        }

        return ksort($array);
    }

    /**
     * An array of headers to pass along with the request
     *
     * @param array $headers
     * @return $this
     */
    protected function withHeaders(array $headers)
    {
        $clean = [];

        foreach ($headers as $key => $value) {
            if (! Str::startsWith($key, ['HTTP_', 'CONTENT_'])) {
                $key = 'HTTP_' . $key;
            }

            $clean[$key] = $value;
        }

        $this->headers = array_merge($this->headers, $clean);

        return $this;
    }
}
