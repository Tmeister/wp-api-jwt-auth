<?php

require_once __DIR__ . '/TestCase.php';

/**
 * Integration tests for Jwt_Auth_Admin class.
 * These tests work with the actual WordPress environment.
 */
class JwtAuthAdminIntegrationTest extends TestCase {

    private $admin;
    private $plugin_name = 'jwt-auth';
    private $version = '1.3.7';

    protected function setUp(): void {
        parent::setUp();
        $this->admin = new Jwt_Auth_Admin($this->plugin_name, $this->version);
    }

    public function test_constructor_creates_admin_instance() {
        $this->assertInstanceOf(Jwt_Auth_Admin::class, $this->admin);
    }

    public function test_settings_permission_check_for_admin_user() {
        // Create an admin user
        $admin_user = $this->createTestUser([
            'user_login' => 'admin_user',
            'role' => 'administrator'
        ]);

        wp_set_current_user($admin_user->ID);

        $result = $this->admin->settings_permission_check();
        $this->assertTrue($result);
    }

    public function test_settings_permission_check_for_non_admin_user() {
        // Create a subscriber user
        $subscriber_user = $this->createTestUser([
            'user_login' => 'subscriber_user',
            'role' => 'subscriber'
        ]);

        wp_set_current_user($subscriber_user->ID);

        $result = $this->admin->settings_permission_check();
        $this->assertFalse($result);
    }

    public function test_handle_settings_get_request() {
        $request = new WP_REST_Request('GET');

        // Set some test options
        update_option('jwt_auth_options', ['share_data' => true]);

        $response = $this->admin->handle_settings($request);

        $this->assertInstanceOf(WP_REST_Response::class, $response);
        $this->assertEquals(200, $response->get_status());

        $data = $response->get_data();
        $this->assertArrayHasKey('jwt_auth_options', $data);
        $this->assertTrue($data['jwt_auth_options']['share_data']);
    }

    public function test_handle_settings_post_request_with_valid_data() {
        $request = new WP_REST_Request('POST');
        $request->set_param('jwt_auth_options', ['share_data' => false]);

        $response = $this->admin->handle_settings($request);

        $this->assertInstanceOf(WP_REST_Response::class, $response);
        $this->assertEquals(200, $response->get_status());

        $data = $response->get_data();
        $this->assertArrayHasKey('jwt_auth_options', $data);
        $this->assertFalse($data['jwt_auth_options']['share_data']);

        // Verify the option was actually saved
        $saved_options = get_option('jwt_auth_options');
        $this->assertFalse($saved_options['share_data']);
    }

    public function test_handle_settings_post_request_with_unchanged_data()
    {
        // Set initial options
        update_option('jwt_auth_options', ['share_data' => true]);

        $request = new WP_REST_Request('POST');
        $request->set_param('jwt_auth_options', ['share_data' => true]);

        $response = $this->admin->handle_settings($request);

        // Should succeed even when update_option returns false (unchanged value)
        $this->assertInstanceOf(WP_REST_Response::class, $response);
        $this->assertEquals(200, $response->get_status());

        $data = $response->get_data();
        $this->assertArrayHasKey('jwt_auth_options', $data);
        $this->assertTrue($data['jwt_auth_options']['share_data']);
    }

    public function test_handle_settings_post_request_with_invalid_data() {
        $request = new WP_REST_Request('POST');
        $request->set_param('jwt_auth_options', null);

        $response = $this->admin->handle_settings($request);

        $this->assertInstanceOf(WP_Error::class, $response);
        $this->assertEquals('jwt_auth_invalid_settings', $response->get_error_code());
    }

    public function test_get_configuration_status() {
        $response = $this->admin->get_configuration_status();

        $this->assertInstanceOf(WP_REST_Response::class, $response);
        $this->assertEquals(200, $response->get_status());

        $data = $response->get_data();
        $this->assertArrayHasKey('configuration', $data);
        $this->assertArrayHasKey('system', $data);
        $this->assertArrayHasKey('secret_key_configured', $data['configuration']);
        $this->assertArrayHasKey('php_version', $data['system']);

        // Secret key should be configured in test environment
        $this->assertTrue($data['configuration']['secret_key_configured']);
    }

    public function test_get_survey_status_for_new_user() {
        $user = $this->createTestUser();
        wp_set_current_user($user->ID);

        $response = $this->admin->get_survey_status();

        $this->assertInstanceOf(WP_REST_Response::class, $response);
        $data = $response->get_data();
        $this->assertFalse($data['completed']);
        $this->assertNull($data['completedAt']);
    }

    public function test_mark_survey_completed() {
        $user = $this->createTestUser();
        wp_set_current_user($user->ID);

        $request = new WP_REST_Request('POST');
        $completed_at = '2025-01-01 12:00:00';
        $request->set_param('completedAt', $completed_at);

        $response = $this->admin->mark_survey_completed($request);

        $this->assertInstanceOf(WP_REST_Response::class, $response);
        $data = $response->get_data();
        $this->assertTrue($data['success']);
        $this->assertEquals($completed_at, $data['completedAt']);

        // Verify it was actually saved
        $saved_completion = get_user_meta($user->ID, 'jwt_auth_survey_completed', true);
        $this->assertEquals($completed_at, $saved_completion);
    }

    public function test_handle_survey_dismissal_get_new_user() {
        $user = $this->createTestUser();
        wp_set_current_user($user->ID);

        $request = new WP_REST_Request('GET');

        $response = $this->admin->handle_survey_dismissal($request);

        $this->assertInstanceOf(WP_REST_Response::class, $response);
        $data = $response->get_data();
        $this->assertEquals(0, $data['dismissalCount']);
        $this->assertNull($data['lastDismissedAt']);
        $this->assertTrue($data['shouldShow']);
    }

    public function test_handle_survey_dismissal_post_dismissal() {
        $user = $this->createTestUser();
        wp_set_current_user($user->ID);

        $request = new WP_REST_Request('POST');

        $response = $this->admin->handle_survey_dismissal($request);

        $this->assertInstanceOf(WP_REST_Response::class, $response);
        $data = $response->get_data();
        $this->assertTrue($data['success']);
        $this->assertEquals(1, $data['dismissalCount']);

        // Verify the dismissal was saved
        $dismissal_data = get_user_meta($user->ID, 'jwt_auth_survey_dismissal', true);
        $this->assertEquals(1, $dismissal_data['count']);
        $this->assertNotNull($dismissal_data['lastDismissedAt']);
        $this->assertNotNull($dismissal_data['hideUntil']);
    }

    public function test_handle_survey_dismissal_max_dismissals() {
        $user = $this->createTestUser();
        wp_set_current_user($user->ID);

        // Set up user with 3 dismissals (max)
        update_user_meta($user->ID, 'jwt_auth_survey_dismissal', [
            'count' => 3,
            'lastDismissedAt' => current_time('mysql'),
            'hideUntil' => time() + (14 * DAY_IN_SECONDS)
        ]);

        $request = new WP_REST_Request('GET');

        $response = $this->admin->handle_survey_dismissal($request);

        $this->assertInstanceOf(WP_REST_Response::class, $response);
        $data = $response->get_data();
        $this->assertEquals(3, $data['dismissalCount']);
        $this->assertFalse($data['shouldShow']); // Should not show because count >= 3
    }

    public function test_handle_survey_submission_with_valid_data() {
        $request = new WP_REST_Request('POST');

        // Set up valid survey data
        $survey_data = [
            'useCase' => 'Mobile App',
            'projectTimeline' => '3-6 months',
            'primaryChallenge' => 'Security',
            'email' => 'test@example.com',
            'emailConsent' => true,
            'submittedAt' => '2025-01-01T12:00:00Z'
        ];

        $request->set_body(json_encode($survey_data));
        $request->set_header('Content-Type', 'application/json');

        $response = $this->admin->handle_survey_submission($request);

        $this->assertInstanceOf(WP_REST_Response::class, $response);
        $data = $response->get_data();
        $this->assertTrue($data['success']);
        $this->assertEquals('Survey submitted successfully.', $data['message']);
    }

    public function test_handle_survey_submission_with_invalid_data() {
        $request = new WP_REST_Request('POST');
        $request->set_body('');
        $request->set_header('Content-Type', 'application/json');

        $response = $this->admin->handle_survey_submission($request);

        $this->assertInstanceOf(WP_Error::class, $response);
        $this->assertEquals('jwt_auth_invalid_survey_data', $response->get_error_code());
    }

    public function test_get_dashboard_data_consolidates_all_endpoints()
    {
        // Set up test data
        $user = $this->createTestUser(['role' => 'administrator']);
        wp_set_current_user($user->ID);

        // Set up test options and user meta
        update_option('jwt_auth_options', ['share_data' => true]);
        update_user_meta($user->ID, 'jwt_auth_survey_completed', '');
        update_user_meta($user->ID, 'jwt_auth_survey_dismissal', [
            'count' => 1,
            'lastDismissedAt' => current_time('mysql'),
            'hideUntil' => time() + (14 * DAY_IN_SECONDS)
        ]);

        $request = new WP_REST_Request('GET');

        $response = $this->admin->get_dashboard_data($request);

        $this->assertInstanceOf(WP_REST_Response::class, $response);
        $this->assertEquals(200, $response->get_status());

        $data = $response->get_data();

        // Verify all expected data is present
        $this->assertArrayHasKey('settings', $data);
        $this->assertArrayHasKey('jwtStatus', $data);
        $this->assertArrayHasKey('surveyStatus', $data);
        $this->assertArrayHasKey('surveyDismissal', $data);

        // Verify settings data structure (should be unwrapped from jwt_auth_options)
        $this->assertArrayHasKey('share_data', $data['settings']);
        $this->assertTrue($data['settings']['share_data']);

        // Verify jwtStatus structure
        $this->assertArrayHasKey('configuration', $data['jwtStatus']);
        $this->assertArrayHasKey('system', $data['jwtStatus']);
        $this->assertArrayHasKey('secret_key_configured', $data['jwtStatus']['configuration']);

        // Verify surveyStatus structure
        $this->assertArrayHasKey('completed', $data['surveyStatus']);
        $this->assertFalse($data['surveyStatus']['completed']);

        // Verify surveyDismissal structure
        $this->assertArrayHasKey('dismissalCount', $data['surveyDismissal']);
        $this->assertArrayHasKey('shouldShow', $data['surveyDismissal']);
        $this->assertEquals(1, $data['surveyDismissal']['dismissalCount']);
    }

    public function test_get_dashboard_data_with_completed_survey()
    {
        $user = $this->createTestUser(['role' => 'administrator']);
        wp_set_current_user($user->ID);

        // Mark survey as completed
        update_user_meta($user->ID, 'jwt_auth_survey_completed', '2025-01-01 12:00:00');

        $request = new WP_REST_Request('GET');
        $response = $this->admin->get_dashboard_data($request);

        $this->assertInstanceOf(WP_REST_Response::class, $response);
        $data = $response->get_data();

        $this->assertTrue($data['surveyStatus']['completed']);
        $this->assertEquals('2025-01-01 12:00:00', $data['surveyStatus']['completedAt']);
    }

    public function test_unsupported_http_methods() {
        $request = new WP_REST_Request('DELETE');

        $response = $this->admin->handle_settings($request);
        $this->assertInstanceOf(WP_Error::class, $response);
        $this->assertEquals('jwt_auth_method_not_allowed', $response->get_error_code());

        $response = $this->admin->handle_survey_dismissal($request);
        $this->assertInstanceOf(WP_Error::class, $response);
        $this->assertEquals('jwt_auth_method_not_allowed', $response->get_error_code());
    }
}
