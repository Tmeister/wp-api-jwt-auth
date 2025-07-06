<?php

require_once __DIR__ . '/TestCase.php';

/**
 * Integration tests for Jwt_Auth main class.
 * These tests work with the actual WordPress environment.
 */
class JwtAuthMainIntegrationTest extends TestCase {

    private $jwt_auth;

    protected function setUp(): void {
        parent::setUp();
        $this->jwt_auth = new Jwt_Auth();
    }

    public function test_constructor_creates_jwt_auth_instance() {
        $this->assertInstanceOf(Jwt_Auth::class, $this->jwt_auth);
    }

    public function test_get_plugin_name_returns_correct_value() {
        $result = $this->jwt_auth->get_plugin_name();
        $this->assertEquals('jwt-auth', $result);
        $this->assertIsString($result);
    }

    public function test_get_version_returns_correct_value() {
        $result = $this->jwt_auth->get_version();
        $this->assertEquals('1.3.7', $result);
        $this->assertIsString($result);
    }

    public function test_get_loader_returns_loader_instance() {
        $loader = $this->jwt_auth->get_loader();
        $this->assertInstanceOf(Jwt_Auth_Loader::class, $loader);
    }

    public function test_remote_api_url_constant() {
        $expected_url = 'https://track.wpjwt.com';
        $this->assertEquals($expected_url, Jwt_Auth::REMOTE_API_URL);
    }

    public function test_version_string_format() {
        $version = $this->jwt_auth->get_version();
        
        // Test that version follows semantic versioning pattern
        $this->assertMatchesRegularExpression('/^\d+\.\d+\.\d+$/', $version);
    }

    public function test_plugin_name_format() {
        $plugin_name = $this->jwt_auth->get_plugin_name();
        
        // Test that plugin name follows expected format
        $this->assertIsString($plugin_name);
        $this->assertNotEmpty($plugin_name);
        $this->assertEquals('jwt-auth', $plugin_name);
    }

    public function test_loader_can_run() {
        // Test that the loader can be run without errors
        $this->jwt_auth->run();
        
        // If we reach here without errors, the run method executed successfully
        $this->assertTrue(true);
    }

    public function test_class_properties_exist() {
        // Use reflection to verify that required properties exist
        $reflection = new ReflectionClass($this->jwt_auth);
        
        $this->assertTrue($reflection->hasProperty('plugin_name'));
        $this->assertTrue($reflection->hasProperty('version'));
        $this->assertTrue($reflection->hasProperty('loader'));
    }

    public function test_class_methods_exist() {
        // Verify that all required public methods exist
        $this->assertTrue(method_exists($this->jwt_auth, 'get_plugin_name'));
        $this->assertTrue(method_exists($this->jwt_auth, 'get_version'));
        $this->assertTrue(method_exists($this->jwt_auth, 'get_loader'));
        $this->assertTrue(method_exists($this->jwt_auth, 'run'));
    }

    public function test_plugin_properties_are_protected() {
        $reflection = new ReflectionClass($this->jwt_auth);
        
        $plugin_name_property = $reflection->getProperty('plugin_name');
        $this->assertTrue($plugin_name_property->isProtected());
        
        $version_property = $reflection->getProperty('version');
        $this->assertTrue($version_property->isProtected());
        
        $loader_property = $reflection->getProperty('loader');
        $this->assertTrue($loader_property->isProtected());
    }

    public function test_class_has_correct_constants() {
        $reflection = new ReflectionClass('Jwt_Auth');
        $constants = $reflection->getConstants();
        
        $this->assertArrayHasKey('REMOTE_API_URL', $constants);
        $this->assertEquals('https://track.wpjwt.com', $constants['REMOTE_API_URL']);
    }

    public function test_multiple_instances_independence() {
        // Test that multiple instances can be created independently
        $jwt_auth_1 = new Jwt_Auth();
        $jwt_auth_2 = new Jwt_Auth();
        
        $this->assertInstanceOf(Jwt_Auth::class, $jwt_auth_1);
        $this->assertInstanceOf(Jwt_Auth::class, $jwt_auth_2);
        $this->assertNotSame($jwt_auth_1, $jwt_auth_2);
        
        // Both should have the same plugin name and version
        $this->assertEquals($jwt_auth_1->get_plugin_name(), $jwt_auth_2->get_plugin_name());
        $this->assertEquals($jwt_auth_1->get_version(), $jwt_auth_2->get_version());
        
        // But different loader instances
        $this->assertNotSame($jwt_auth_1->get_loader(), $jwt_auth_2->get_loader());
    }

    public function test_loader_instance_type() {
        $loader = $this->jwt_auth->get_loader();
        
        // Verify loader has expected methods
        $this->assertTrue(method_exists($loader, 'add_action'));
        $this->assertTrue(method_exists($loader, 'add_filter'));
        $this->assertTrue(method_exists($loader, 'run'));
    }

    public function test_initialization_sequence_integrity() {
        // Test that a fresh instance initializes properly
        $fresh_instance = new Jwt_Auth();
        
        // Verify the instance was created successfully with all required components
        $this->assertInstanceOf(Jwt_Auth::class, $fresh_instance);
        $this->assertEquals('jwt-auth', $fresh_instance->get_plugin_name());
        $this->assertEquals('1.3.7', $fresh_instance->get_version());
        $this->assertInstanceOf(Jwt_Auth_Loader::class, $fresh_instance->get_loader());
    }

    public function test_class_inheritance_structure() {
        // Verify the class structure
        $reflection = new ReflectionClass($this->jwt_auth);
        
        // Should not extend any other class
        $this->assertFalse($reflection->getParentClass());
        
        // Should not implement any interfaces (for this simple case)
        $this->assertEmpty($reflection->getInterfaces());
    }

    public function test_dependency_classes_loaded() {
        // Verify that all required dependency classes are loaded and available
        $this->assertTrue(class_exists('Jwt_Auth_Loader'));
        $this->assertTrue(class_exists('Jwt_Auth_i18n'));
        $this->assertTrue(class_exists('Jwt_Auth_Admin'));
        $this->assertTrue(class_exists('Jwt_Auth_Public'));
    }

    public function test_loader_can_add_hooks() {
        $loader = $this->jwt_auth->get_loader();
        
        // Test that we can add hooks without errors
        $test_callback = function() { return true; };
        
        $loader->add_action('test_action', $this, $test_callback);
        $loader->add_filter('test_filter', $this, $test_callback);
        
        // If we reach here without errors, hook addition worked
        $this->assertTrue(true);
    }
}