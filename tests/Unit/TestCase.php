<?php

/**
 * Base test case for unit tests.
 */
class TestCase extends WP_UnitTestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        
        // Set up any common test configuration here
        
        // Define JWT secret key for tests
        if (!defined('JWT_AUTH_SECRET_KEY')) {
            define('JWT_AUTH_SECRET_KEY', 'test-secret-key-for-phpunit');
        }
    }

    protected function tearDown(): void
    {
        parent::tearDown();
        
        // Clean up after each test
    }

    /**
     * Helper method to create a test user.
     */
    protected function createTestUser(array $args = []): WP_User
    {
        $defaults = [
            'user_login' => 'testuser',
            'user_email' => 'test@example.com',
            'user_pass' => 'password123',
            'display_name' => 'Test User',
        ];

        $user_data = array_merge($defaults, $args);
        $user_id = wp_insert_user($user_data);

        if (is_wp_error($user_id)) {
            $this->fail('Failed to create test user: ' . $user_id->get_error_message());
        }

        return get_user_by('id', $user_id);
    }

    /**
     * Helper method to create a JWT token for testing.
     */
    protected function createTestToken(WP_User $user): string
    {
        $issuedAt = time();
        $notBefore = $issuedAt;
        $expire = $issuedAt + (DAY_IN_SECONDS * 7);

        $token = [
            'iss' => get_bloginfo('url'),
            'aud' => get_bloginfo('url'),
            'iat' => $issuedAt,
            'nbf' => $notBefore,
            'exp' => $expire,
            'data' => [
                'user' => [
                    'id' => $user->ID,
                ],
            ],
        ];

        return \Firebase\JWT\JWT::encode($token, JWT_AUTH_SECRET_KEY, 'HS256');
    }
}