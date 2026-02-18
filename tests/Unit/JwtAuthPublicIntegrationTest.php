<?php

require_once __DIR__ . '/TestCase.php';

/**
 * Integration tests for Jwt_Auth_Public class.
 * These tests work with the actual WordPress environment.
 */
class JwtAuthPublicIntegrationTest extends TestCase {

    private $public;
    private $plugin_name = 'jwt-auth';
    private $version = '1';

    protected function setUp(): void {
        parent::setUp();
        $this->public = new Jwt_Auth_Public($this->plugin_name, $this->version);
    }

    public function test_constructor_creates_public_instance() {
        $this->assertInstanceOf(Jwt_Auth_Public::class, $this->public);
    }

    public function test_generate_token_with_valid_credentials() {
        $user = $this->createTestUser([
            'user_login' => 'testuser',
            'user_pass' => 'testpass123'
        ]);
        
        $request = new WP_REST_Request('POST');
        $request->set_param('username', 'testuser');
        $request->set_param('password', 'testpass123');
        
        $result = $this->public->generate_token($request);
        
        $this->assertIsArray($result);
        $this->assertArrayHasKey('token', $result);
        $this->assertArrayHasKey('user_email', $result);
        $this->assertArrayHasKey('user_nicename', $result);
        $this->assertArrayHasKey('user_display_name', $result);
        
        // Verify token structure
        $this->assertNotEmpty($result['token']);
        $this->assertEquals($user->user_email, $result['user_email']);
        $this->assertEquals($user->user_nicename, $result['user_nicename']);
        $this->assertEquals($user->display_name, $result['user_display_name']);
    }

    public function test_generate_token_increments_tokens_counter() {
        update_option('jwt_auth_tokens_created', 0);

        $this->createTestUser([
            'user_login' => 'counteruser',
            'user_pass' => 'counterpass123'
        ]);

        $request = new WP_REST_Request('POST');
        $request->set_param('username', 'counteruser');
        $request->set_param('password', 'counterpass123');

        $result = $this->public->generate_token($request);

        $this->assertIsArray($result);
        $this->assertArrayHasKey('token', $result);
        $this->assertSame(1, (int) get_option('jwt_auth_tokens_created', 0));
    }

    public function test_generate_token_with_invalid_credentials() {
        $request = new WP_REST_Request('POST');
        $request->set_param('username', 'nonexistent');
        $request->set_param('password', 'wrongpass');
        
        $result = $this->public->generate_token($request);
        
        $this->assertInstanceOf(WP_Error::class, $result);
        $this->assertStringContainsString('[jwt_auth]', $result->get_error_code());
    }

    public function test_generate_token_with_secret_key_available() {
        // Since we can't easily undefine constants in tests,
        // we'll verify that tokens are generated when secret key is available
        
        $this->createTestUser([
            'user_login' => 'testuser2',
            'user_pass' => 'testpass123'
        ]);
        
        $request = new WP_REST_Request('POST');
        $request->set_param('username', 'testuser2');
        $request->set_param('password', 'testpass123');
        
        // Since we have the secret key defined in our test setup,
        // we'll verify that a token IS generated
        $result = $this->public->generate_token($request);
        $this->assertIsArray($result);
        $this->assertArrayHasKey('token', $result);
    }

    public function test_validate_token_with_valid_token() {
        // First, create a user and generate a token
        $user = $this->createTestUser([
            'user_login' => 'tokenuser',
            'user_pass' => 'tokenpass123'
        ]);
        
        $token = $this->createTestToken($user);
        
        $request = new WP_REST_Request('POST');
        $request->set_header('Authorization', 'Bearer ' . $token);
        
        $result = $this->public->validate_token($request);
        
        $this->assertIsArray($result);
        $this->assertEquals('jwt_auth_valid_token', $result['code']);
        $this->assertEquals(200, $result['data']['status']);
    }

    public function test_validate_token_without_authorization_header() {
        $request = new WP_REST_Request('POST');
        
        $result = $this->public->validate_token($request);
        
        $this->assertInstanceOf(WP_Error::class, $result);
        $this->assertEquals('jwt_auth_no_auth_header', $result->get_error_code());
    }

    public function test_validate_token_with_malformed_header() {
        $request = new WP_REST_Request('POST');
        $request->set_header('Authorization', 'InvalidFormat token');
        
        $result = $this->public->validate_token($request);
        
        $this->assertInstanceOf(WP_Error::class, $result);
        $this->assertEquals('jwt_auth_bad_auth_header', $result->get_error_code());
    }

    public function test_validate_token_with_invalid_token() {
        $request = new WP_REST_Request('POST');
        $request->set_header('Authorization', 'Bearer invalid.jwt.token');
        
        $result = $this->public->validate_token($request);
        
        $this->assertInstanceOf(WP_Error::class, $result);
        $this->assertEquals('jwt_auth_invalid_token', $result->get_error_code());
    }

    public function test_determine_current_user_with_valid_token() {
        // Create a user and token
        $user = $this->createTestUser([
            'user_login' => 'apiuser',
            'user_pass' => 'apipass123'
        ]);
        
        $token = $this->createTestToken($user);
        
        // Set up the request environment
        $_SERVER['REQUEST_URI'] = '/wp-json/wp/v2/posts';
        $_SERVER['HTTP_AUTHORIZATION'] = 'Bearer ' . $token;
        
        $result = $this->public->determine_current_user(false);
        
        $this->assertEquals($user->ID, $result);
    }

    public function test_determine_current_user_with_existing_user() {
        // If a user is already authenticated, it should return that user
        $_SERVER['REQUEST_URI'] = '/wp-json/wp/v2/posts';
        
        $result = $this->public->determine_current_user(123);
        
        $this->assertEquals(123, $result);
    }

    public function test_determine_current_user_non_api_request() {
        // Non-API requests should pass through unchanged
        $_SERVER['REQUEST_URI'] = '/wp-admin/post.php';
        
        $result = $this->public->determine_current_user(false);
        
        $this->assertFalse($result);
    }

    public function test_determine_current_user_validate_endpoint() {
        // Validation endpoint should skip token validation to avoid double calls
        $_SERVER['REQUEST_URI'] = '/wp-json/jwt-auth/v1/token/validate';
        
        $result = $this->public->determine_current_user(false);
        
        $this->assertFalse($result);
    }

    public function test_rest_pre_dispatch_with_no_error() {
        $request = new WP_REST_Request();
        
        $result = $this->public->rest_pre_dispatch($request);
        
        $this->assertSame($request, $result);
    }

    public function test_rest_pre_dispatch_with_jwt_error() {
        // Create an error and set it in the public class
        $error = new WP_Error('jwt_auth_invalid_token', 'Invalid token');
        
        // Use reflection to set the private jwt_error property
        $reflection = new ReflectionClass($this->public);
        $jwt_error_property = $reflection->getProperty('jwt_error');
        $jwt_error_property->setAccessible(true);
        $jwt_error_property->setValue($this->public, $error);
        
        $request = new WP_REST_Request();
        
        $result = $this->public->rest_pre_dispatch($request);
        
        $this->assertSame($error, $result);
    }

    public function test_cors_support_functionality() {
        // Test CORS support - skip actual header testing in unit tests since headers are already sent
        // This test verifies the method exists and is callable
        $this->assertTrue(method_exists($this->public, 'add_cors_support'));
        $this->assertTrue(is_callable([$this->public, 'add_cors_support']));
    }

    public function test_api_routes_registration() {
        // Test that the route registration method exists and is callable
        // We can't test actual route registration outside of rest_api_init action
        $this->assertTrue(method_exists($this->public, 'add_api_routes'));
        $this->assertTrue(is_callable([$this->public, 'add_api_routes']));
    }

    /**
     * Test the complete token flow: generate -> validate
     */
    public function test_complete_token_flow() {
        // Create user for authentication
        $this->createTestUser([
            'user_login' => 'flowuser',
            'user_pass' => 'flowpass123'
        ]);
        
        // Generate token
        $generate_request = new WP_REST_Request('POST');
        $generate_request->set_param('username', 'flowuser');
        $generate_request->set_param('password', 'flowpass123');
        
        $generate_result = $this->public->generate_token($generate_request);
        
        $this->assertIsArray($generate_result);
        $this->assertArrayHasKey('token', $generate_result);
        
        // Validate token
        $validate_request = new WP_REST_Request('POST');
        $validate_request->set_header('Authorization', 'Bearer ' . $generate_result['token']);
        
        $validate_result = $this->public->validate_token($validate_request);
        
        $this->assertIsArray($validate_result);
        $this->assertEquals('jwt_auth_valid_token', $validate_result['code']);
        $this->assertEquals(200, $validate_result['data']['status']);
    }

    protected function tearDown(): void {
        // Clean up $_SERVER variables
        unset($_SERVER['REQUEST_URI']);
        unset($_SERVER['HTTP_AUTHORIZATION']);
        
        parent::tearDown();
    }
}
