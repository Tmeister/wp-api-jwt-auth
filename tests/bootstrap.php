<?php

/**
 * PHPUnit bootstrap file for wp-env.
 */

// Define test constants
define('DOING_TESTS', true);

// Check if we're running in wp-env container (WordPress test suite is already available)
if (getenv('WP_CLI_PACKAGES_DIR')) {
    // We're in wp-env container, use the built-in test bootstrap
    require_once '/var/www/html/wp-tests-config.php';
    require_once '/var/www/html/wp-includes/functions.php';
    require_once '/var/www/html/wp-admin/includes/plugin.php';
} else {
    // Fallback for local development
    $_tests_dir = getenv('WP_TESTS_DIR');
    if (!$_tests_dir) {
        $_tests_dir = rtrim(sys_get_temp_dir(), '/\\') . '/wordpress-tests-lib';
    }

    if (!file_exists($_tests_dir . '/includes/functions.php')) {
        echo "Could not find $_tests_dir/includes/functions.php, have you run bin/install-wp-tests.sh ?" . PHP_EOL;
        exit(1);
    }

    require_once $_tests_dir . '/includes/functions.php';
    require $_tests_dir . '/includes/bootstrap.php';
    require_once ABSPATH . 'wp-admin/includes/plugin.php';
}

/**
 * Manually load and activate the plugin being tested.
 */
function _manually_load_and_activate_plugin(): void
{
    // In wp-env, the plugin is already available at the correct path
    $plugin_file = 'jwt-auth.php';
    
    if (file_exists(WP_PLUGIN_DIR . '/wp-api-jwt-auth/' . $plugin_file)) {
        require_once WP_PLUGIN_DIR . '/wp-api-jwt-auth/' . $plugin_file;
    } elseif (file_exists(dirname(__DIR__) . '/' . $plugin_file)) {
        require_once dirname(__DIR__) . '/' . $plugin_file;
    }

    // Define plugin version constant if not defined
    if (!defined('JWT_AUTH_VERSION')) {
        define('JWT_AUTH_VERSION', '1.0.0');
    }

    // Set plugin version
    update_option('jwt_auth_version', JWT_AUTH_VERSION);

    // Set the permalink structure to /%postname%/
    update_option('permalink_structure', '/%postname%/');
    flush_rewrite_rules();
}

// Hook into WordPress test setup
add_action('muplugins_loaded', '_manually_load_and_activate_plugin');

// Disable rate limit headers globally for all tests
add_filter('jwt_auth_rate_limit_headers_enabled', '__return_false');