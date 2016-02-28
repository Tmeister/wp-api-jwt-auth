<?php

class GeneralTest extends PHPUnit_Framework_TestCase
{
    protected $baseUrl = 'http://jwt.dev/';
    protected $client;

    protected function setUp()
    {
        $this->client = new GuzzleHttp\Client([
            'base_uri' => $this->baseUrl
        ]);
    }

    /**
     * Load the site and look for a Status Code Equal to 200
     */
    public function test_is_site_up()
    {
        $response = $this->client->get('/');
        $this->assertEquals(200, $response->getStatusCode());
    }

    /**
     * Look for the wp-json endpoint and look for basic data.
     */
    public function test_is_wp_api_installed()
    {
        $response = $this->client->get('wp-json/');
        $this->assertEquals(200, $response->getStatusCode());
        $data = json_decode($response->getBody(), true);
        $this->assertArrayHasKey('namespaces', $data);
        $this->assertArrayHasKey('authentication', $data);
        $this->assertArrayHasKey('routes', $data);
    }

    /**
     * Check for the jwt-auth/v1 endpoint and
     */
    public function test_is_jwt_installed()
    {
        $response = $this->client->get('wp-json/jwt-auth/v1/');
        $this->assertEquals(200, $response->getStatusCode());
        $data = json_decode($response->getBody(), true);
        $this->assertEquals('jwt-auth/v1', $data['namespace']);
    }

    /**
     * Get the user token
     */
    public function test_get_jwt_token()
    {
        $response = $this->client->post('wp-json/jwt-auth/v1/token', [
            'json' => [
                'username' => 'admin',
                'password' => 'poipoipoi'
            ]
        ]);
        $this->assertEquals(200, $response->getStatusCode());
        $data = json_decode($response->getBody(), true);
        $this->assertArrayHasKey('token', $data);
        $this->assertArrayHasKey('token', $data);
        $this->assertArrayHasKey('user_email', $data);
        $this->assertNotEmpty($data['token']);
        $this->assertNotEmpty($data['user_email']);
    }

    /**
     * Get the Token and then validate...
     */
    public function test_validate_jwt_token()
    {
        $token = '';
        #first get a valid token.
        $response = $this->client->post('wp-json/jwt-auth/v1/token', [
            'json' => [
                'username' => 'admin',
                'password' => 'poipoipoi'
            ]
        ]);
        $this->assertEquals(200, $response->getStatusCode());
        $data  = json_decode($response->getBody(), true);
        $token = $data['token'];

        #With the token now validate it.
        $response = $this->client->post('wp-json/jwt-auth/v1/token/validate', [
            'headers' => [
                'Authorization' => 'Bearer ' . $token
            ]
        ]);
        $this->assertEquals(200, $response->getStatusCode());
        $data = json_decode($response->getBody(), true);
        $this->assertArrayHasKey('code', $data);
        $this->assertArrayHasKey('data', $data);
        $this->assertEquals(200, $data['data']['status']);

        #Finally get the me | Reading
        $response = $this->client->get('wp-json/wp/v2/users/me', [
            'headers' => [
                'Authorization' => 'Bearer ' . $token
            ]
        ]);

        $this->assertEquals(200, $response->getStatusCode());
        $data = json_decode($response->getBody(), true);
        $this->assertArrayHasKey('id', $data);
        $this->assertArrayHasKey('name', $data);
    }

    /**
     * Try to Write a Post | Write Permissions
     */
    public function test_jwt_write_access()
    {
        #first get a valid token.
        $response = $this->client->post('wp-json/jwt-auth/v1/token', [
            'json' => [
                'username' => 'admin',
                'password' => 'poipoipoi'
            ]
        ]);
        $this->assertEquals(200, $response->getStatusCode());
        $data  = json_decode($response->getBody(), true);
        $token = $data['token'];

        #Create the post | Writing
        $response = $this->client->post('wp-json/wp/v2/posts', [
            'headers' => [
                'Authorization' => 'Bearer ' . $token
            ],
            'json'    => [
                'title' => 'Created from Tests'
            ]
        ]);

        $this->assertEquals(201, $response->getStatusCode());
        $data = json_decode($response->getBody(), true);
        #201 is created and now look and get the new post ID
        $this->assertArrayHasKey('id', $data);
        $post_id = $data['id'];

        #Delete the test post
        #Finally get the me | Reading
        $response = $this->client->delete('wp-json/wp/v2/posts/' . $post_id, [
            'headers' => [
                'Authorization' => 'Bearer ' . $token
            ]
        ]);
        $this->assertEquals(200, $response->getStatusCode());
        $data = json_decode($response->getBody(), true);
        $this->assertArrayHasKey('id', $data);
        //The post ID must to be the same as the created one.
        $this->assertEquals($post_id, $data['id']);
    }
}