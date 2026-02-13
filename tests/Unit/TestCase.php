<?php

/**
 * Base test case for unit tests.
 */
class TestCase extends WP_UnitTestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        
        // Load the actual plugin classes
        $this->loadPluginClasses();
        
        // Set up any common test configuration here
        
        // Define JWT secret key for tests
        if (!defined('JWT_AUTH_SECRET_KEY')) {
            define('JWT_AUTH_SECRET_KEY', 'test-secret-key-for-phpunit');
        }
    }

    /**
     * Load the actual plugin classes for testing.
     */
    protected function loadPluginClasses(): void
    {
        $plugin_dir = dirname(dirname(__DIR__));

        // Load plugin bootstrap to register global helper functions used by admin/public classes.
        require_once $plugin_dir . '/jwt-auth.php';
        
        // Load dependencies
        require_once $plugin_dir . '/includes/vendor/autoload.php';
        
        // Load core classes
        require_once $plugin_dir . '/includes/class-jwt-auth-loader.php';
        require_once $plugin_dir . '/includes/class-jwt-auth-i18n.php';
        require_once $plugin_dir . '/includes/class-jwt-namespace-wrapper.php';
        require_once $plugin_dir . '/admin/class-jwt-auth-admin.php';
        require_once $plugin_dir . '/public/class-jwt-auth-public.php';
        require_once $plugin_dir . '/includes/class-jwt-auth.php';
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
