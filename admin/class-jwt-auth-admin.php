<?php

/**
 * The admin-facing functionality of the plugin.
 *
 * Defines the plugin name, version
 *
 * @author     Enrique Chavez <noone@tmeister.net>
 * @since      1.3.4
 */
class Jwt_Auth_Admin
{
    /**
     * The ID of this plugin.
     *
     * @since    1.3.4
     *
     * @var string The ID of this plugin.
     */
    private string $plugin_name;

    /**
     * The version of this plugin.
     *
     * @since    1.3.4
     *
     * @var string The current version of this plugin.
     */
    private string $version;

    /**
     * Initialize the class and set its properties.
     *
     * @param string $plugin_name The name of the plugin.
     * @param string $version The version of this plugin.
     *
     * @since    1.3.4
     */
    public function __construct(string $plugin_name, string $version)
    {
        $this->plugin_name = $plugin_name;
        $this->version     = $version;
    }

    /**
     * Register admin REST API endpoints.
     *
     * @return void
     * @since 1.3.4
     */
    public function register_admin_rest_routes()
    {
        $namespace = 'jwt-auth/v1';

        register_rest_route(
            $namespace,
            'admin/settings',
            array(
                'methods'             => array('GET', 'POST'),
                'callback'            => array($this, 'handle_settings'),
                'permission_callback' => array($this, 'settings_permission_check'),
            )
        );

        register_rest_route(
            $namespace,
            'admin/status',
            array(
                'methods'             => 'GET',
                'callback'            => array($this, 'get_configuration_status'),
                'permission_callback' => array($this, 'settings_permission_check'),
            )
        );

        register_rest_route(
            $namespace,
            'admin/survey',
            array(
                'methods'             => 'POST',
                'callback'            => array($this, 'handle_survey_submission'),
                'permission_callback' => array($this, 'settings_permission_check'),
            )
        );

        register_rest_route(
            $namespace,
            'admin/survey/status',
            array(
                'methods'             => 'GET',
                'callback'            => array($this, 'get_survey_status'),
                'permission_callback' => array($this, 'settings_permission_check'),
            )
        );

        register_rest_route(
            $namespace,
            'admin/survey/complete',
            array(
                'methods'             => 'POST',
                'callback'            => array($this, 'mark_survey_completed'),
                'permission_callback' => array($this, 'settings_permission_check'),
            )
        );

        register_rest_route(
            $namespace,
            'admin/survey/dismissal',
            array(
                'methods'             => array('GET', 'POST'),
                'callback'            => array($this, 'handle_survey_dismissal'),
                'permission_callback' => array($this, 'settings_permission_check'),
            )
        );
    }

    /**
     * Check permissions for settings endpoint.
     *
     * @return bool
     */
    public function settings_permission_check()
    {
        return current_user_can('manage_options');
    }

    /**
     * Handle settings GET and POST requests.
     *
     * @param WP_REST_Request $request
     * @return WP_REST_Response|WP_Error
     */
    public function handle_settings(WP_REST_Request $request)
    {
        if ($request->get_method() === 'GET') {
            $settings = get_option(
                'jwt_auth_options',
                array(
                    'share_data' => false,
                )
            );

            return new WP_REST_Response(
                array(
                    'jwt_auth_options' => $settings,
                ),
                200
            );
        }

        if ($request->get_method() === 'POST') {
            $settings = $request->get_param('jwt_auth_options');

            if (! $settings || ! is_array($settings)) {
                return new WP_Error(
                    'jwt_auth_invalid_settings',
                    'Invalid settings data provided.',
                    array('status' => 400)
                );
            }

            // Sanitize and validate settings
            $sanitized_settings = array();

            if (isset($settings['share_data'])) {
                $sanitized_settings['share_data'] = (bool) $settings['share_data'];
            }

            // Merge with existing settings
            $existing_settings = get_option('jwt_auth_options', array());
            $updated_settings  = array_merge($existing_settings, $sanitized_settings);

            $success = update_option('jwt_auth_options', $updated_settings);

            if (! $success) {
                return new WP_Error(
                    'jwt_auth_settings_update_failed',
                    'Failed to update settings.',
                    array('status' => 500)
                );
            }

            return new WP_REST_Response(
                array(
                    'jwt_auth_options' => $updated_settings,
                ),
                200
            );
        }

        return new WP_Error(
            'jwt_auth_method_not_allowed',
            'Method not allowed.',
            array('status' => 405)
        );
    }

    /**
     * Get real configuration status for the dashboard.
     *
     * @return WP_REST_Response
     */
    public function get_configuration_status()
    {
        $secret_key   = defined('JWT_AUTH_SECRET_KEY') ? JWT_AUTH_SECRET_KEY : false;
        $cors_enabled = defined('JWT_AUTH_CORS_ENABLE') ? JWT_AUTH_CORS_ENABLE : false;
        $dev_mode     = defined('JWT_AUTH_DEV_MODE') ? JWT_AUTH_DEV_MODE : false;

        // Check if JWT secret key is configured
        $secret_key_configured = ! empty($secret_key);

        // Check PHP version compatibility
        $php_version    = PHP_VERSION;
        $php_compatible = version_compare($php_version, '7.4', '>=');
        $pro_compatible = version_compare($php_version, '7.4', '>=');

        // WordPress version
        $wp_version = get_bloginfo('version');

        // MySQL version
        global $wpdb;
        $mysql_version = $wpdb->get_var('SELECT VERSION()') ?: 'Unknown';

        // PHP Memory Limit
        $memory_limit = ini_get('memory_limit');

        // PHP Post Max Size
        $post_max_size = ini_get('post_max_size');

        // Configuration method detection
        $config_method = $secret_key_configured ? 'wp-config.php' : 'Not configured';

        $status = array(
            'configuration' => array(
                'method'                => $config_method,
                'secret_key_configured' => $secret_key_configured,
                'cors_enabled'          => $cors_enabled,
                'dev_mode'              => $dev_mode,
            ),
            'system'        => array(
                'php_version'       => $php_version,
                'php_compatible'    => $php_compatible,
                'pro_compatible'    => $pro_compatible,
                'wordpress_version' => $wp_version,
                'mysql_version'     => $mysql_version,
                'php_memory_limit'  => $memory_limit,
                'post_max_size'     => $post_max_size,
            ),
        );

        return new WP_REST_Response($status, 200);
    }


    /**
     * Register a new settings page under Settings main menu
     * .
     *
     * @return void
     * @since 1.3.4
     */
    public function register_menu_page()
    {
        add_submenu_page(
            'options-general.php',
            __('JWT Authentication', 'jwt-auth'),
            __('JWT Authentication', 'jwt-auth'),
            'manage_options',
            'jwt_authentication',
            array($this, 'render_admin_page')
        );

        // Add Upgrade to PRO submenu item
        $base_pro_url = 'https://jwtauth.pro';
        $utm_params   = array(
            'utm_source'   => 'wpadmin',
            'utm_medium'   => 'submenu',
            'utm_campaign' => 'pro-submenu-link',
            'utm_content'  => 'upgrade-to-pro',
        );
        $pro_link_url = (string) add_query_arg($utm_params, $base_pro_url);

        add_submenu_page(
            'options-general.php',
            __('Upgrade to PRO', 'jwt-auth'),
            '<span style="color: #00a32a; font-weight: 700;">' . __('&nbsp;&nbsp;&nbsp;↳ Upgrade to PRO', 'jwt-auth') . '</span>',
            'manage_options',
            esc_url($pro_link_url),
            null // No callback function needed for external link
        );
    }

    /**
     * Shows an admin notice on the admin dashboard to notify the new settings page.
     * This is only shown once and the message is dismissed.
     *
     * @return void
     * @since 1.3.4
     */
    public function display_admin_notice()
    {
        if (! get_option('jwt_auth_pro_notice_01')) {
?>
            <div class="notice notice-info is-dismissible">
                <p>
                    <?php
                    esc_html_e(
                        'Exciting News! 🚀 Level Up Your API Authentication: JWT Authentication Pro is now available! Experience advanced features and seamless integration for your REST API.',
                        'jwt-auth'
                    );
                    ?>
                    <a href="https://jwtauth.pro?utm_source=wp-admin&utm_medium=notice&utm_campaign=pro-upgrade-notice" target="_blank"
                        class="button button-primary"
                        style="margin-left: 10px;">
                        <?php esc_html_e('Upgrade to PRO Now', 'jwt-auth'); ?>
                    </a>
                </p>
            </div>
        <?php
            update_option('jwt_auth_pro_notice_01', true);
        }
    }

    /**
     * Enqueue the plugin assets only on the plugin settings page.
     *
     * @param string $suffix
     *
     * @return void|null
     * @since 1.3.4
     */
    public function enqueue_plugin_assets($suffix = '')
    {
        // Check if $suffix is empty or null
        if (empty($suffix)) {
            return; // Exit early to prevent further execution
        }

        if ($suffix !== 'settings_page_jwt_authentication') {
            return null;
        }

        $is_dev_mode = defined('JWT_AUTH_DEV_MODE') && JWT_AUTH_DEV_MODE;

        if ($is_dev_mode) {
            // Development mode - set up React Refresh preamble first
            add_action(
                'admin_head',
                function () {
                    echo '<script type="module">
					import RefreshRuntime from "http://localhost:5173/@react-refresh"
					RefreshRuntime.injectIntoGlobalHook(window)
					window.$RefreshReg$ = () => {}
					window.$RefreshSig$ = () => (type) => type
					window.__vite_plugin_react_preamble_installed__ = true
				</script>';
                }
            );

            // Load Vite client
            wp_enqueue_script(
                'vite-client',
                'http://localhost:5173/@vite/client',
                array(),
                null,
                true
            );

            // Load our main app
            wp_enqueue_script(
                $this->plugin_name . '-settings',
                'http://localhost:5173/admin/ui/src/main.tsx',
                array('vite-client'),
                null,
                true
            );

            // Add type="module" to the scripts
            add_filter(
                'script_loader_tag',
                function ($tag, $handle) {
                    if (in_array($handle, array('vite-client', $this->plugin_name . '-settings'))) {
                        return str_replace('<script', '<script type="module"', $tag);
                    }
                    return $tag;
                },
                10,
                2
            );
        } else {
            // Production mode - load single compiled files
            wp_enqueue_script(
                $this->plugin_name . '-settings',
                plugins_url('ui/dist/main.js', __FILE__),
                array(),
                $this->version,
                array('in_footer' => true)
            );

            wp_enqueue_style(
                $this->plugin_name . '-settings',
                plugins_url('ui/dist/main.css', __FILE__),
                array(),
                $this->version
            );
        }

        // Provide WordPress API configuration to React app
        if ($is_dev_mode) {
            // For dev mode, we need to add the config manually since we're not using wp_enqueue_script
            add_action(
                'admin_footer',
                function () {
                    $config = array(
                        'apiUrl'      => rest_url('jwt-auth/v1/admin/settings'),
                        'nonce'       => wp_create_nonce('wp_rest'),
                        'siteUrl'     => get_bloginfo('url'),
                        'settings'    => get_option('jwt_auth_options', array('share_data' => false)),
                        'siteProfile' => array(
                            'phpVersion'            => PHP_VERSION,
                            'wordpressVersion'      => get_bloginfo('version'),
                            'isProCompatible'       => version_compare(PHP_VERSION, '7.4', '>='),
                            'isWooCommerceDetected' => class_exists('WooCommerce'),
                            'pluginCount'           => count(get_option('active_plugins', array())),
                            'signingAlgorithm'      => 'HS256',
                        ),
                    );
                    echo '<script>window.jwtAuthConfig = ' . wp_json_encode($config) . ';</script>';
                },
                5
            ); // Priority 5 to run before the module script
        } else {
            wp_localize_script(
                $this->plugin_name . '-settings',
                'jwtAuthConfig',
                array(
                    'apiUrl'      => rest_url('jwt-auth/v1/admin/settings'),
                    'nonce'       => wp_create_nonce('wp_rest'),
                    'siteUrl'     => get_bloginfo('url'),
                    'settings'    => get_option('jwt_auth_options', array('share_data' => false)),
                    'siteProfile' => array(
                        'phpVersion'            => PHP_VERSION,
                        'wordpressVersion'      => get_bloginfo('version'),
                        'isProCompatible'       => version_compare(PHP_VERSION, '7.4', '>='),
                        'isWooCommerceDetected' => class_exists('WooCommerce'),
                        'pluginCount'           => count(get_option('active_plugins', array())),
                        'signingAlgorithm'      => 'HS256',
                    ),
                )
            );
        }
    }

    /**
     * Register the plugin settings.
     *
     * @return void
     * @since 1.3.4
     */
    public function register_plugin_settings()
    {
        register_setting(
            'jwt_auth',
            'jwt_auth_options',
            array(
                'type'         => 'object',
                'default'      => array(
                    'share_data' => false,
                ),
                'show_in_rest' => array(
                    'schema' => array(
                        'type'       => 'object',
                        'properties' => array(
                            'share_data' => array(
                                'type'    => 'boolean',
                                'default' => false,
                            ),
                        ),
                    ),
                ),
            )
        );
    }

    /**
     * Render the plugin settings page.
     * This is a React application that will be rendered on the admin page.
     *
     * @return void
     * @since 1.3.4
     */
    public function render_admin_page()
    {
        ?>
        <div id="jwt-auth-holder"></div>
<?php
    }

    /**
     * Add a link to the plugin settings page on the plugin list.
     *
     * @param array  $links
     * @param string $file
     *
     * @return array
     * @since 1.3.5
     */
    public function add_action_link(array $links, string $file): array
    {

        if ($file === 'jwt-authentication-for-wp-rest-api/jwt-auth.php') {
            $cta_variations = array(
                0 => array(
                    'text'        => '<b>Get JWT Auth Pro</b>',
                    'utm_content' => 'get-jwt-auth-pro-cta',
                ),
                1 => array(
                    'text'        => '<b>Unlock Pro Features</b>',
                    'utm_content' => 'unlock-pro-features-cta',
                ),
            );

            $selected_variation_key = rand(0, 1);
            $selected_variation     = $cta_variations[$selected_variation_key];

            $base_pro_url = 'https://jwtauth.pro';
            $utm_params   = array(
                'utm_source'   => 'wpadmin',
                'utm_medium'   => 'plugin-link',
                'utm_campaign' => 'pro-plugin-action-link',
                'utm_content'  => $selected_variation['utm_content'],
            );

            $pro_link_url   = (string) add_query_arg($utm_params, $base_pro_url);
            $pro_link_style = 'style="color: #00a32a; font-weight: 700; text-decoration: none;" onmouseover="this.style.color=\'#008a20\';" onmouseout="this.style.color=\'#00a32a\';"';

            $pro_link_text = $selected_variation['text'];
            $links[]       = '<a href="' . esc_url($pro_link_url) . '" target="_blank" ' . $pro_link_style . ' rel="noopener noreferrer">' . $pro_link_text . '</a>';
        }

        return $links;
    }

    /**
     * Handle survey submission.
     *
     * @param WP_REST_Request $request
     * @return WP_REST_Response|WP_Error
     */
    public function handle_survey_submission(WP_REST_Request $request)
    {
        $survey_data = $request->get_json_params();

        if (! $survey_data) {
            return new WP_Error(
                'jwt_auth_invalid_survey_data',
                'Invalid survey data provided.',
                array('status' => 400)
            );
        }

        // Sanitize survey data
        $sanitized_data = array(
            'useCase'               => sanitize_text_field($survey_data['useCase'] ?? ''),
            'useCaseOther'          => sanitize_textarea_field($survey_data['useCaseOther'] ?? ''),
            'projectTimeline'       => sanitize_text_field($survey_data['projectTimeline'] ?? ''),
            'primaryChallenge'      => sanitize_text_field($survey_data['primaryChallenge'] ?? ''),
            'primaryChallengeOther' => sanitize_textarea_field($survey_data['primaryChallengeOther'] ?? ''),
            'purchaseInterest'      => sanitize_text_field($survey_data['purchaseInterest'] ?? ''),
            'email'                 => sanitize_email($survey_data['email'] ?? ''),
            'emailConsent'          => (bool) ($survey_data['emailConsent'] ?? false),
            'submittedAt'           => sanitize_text_field($survey_data['submittedAt'] ?? ''),
        );

        // Send to webhook (non-blocking)
        $webhook_url = apply_filters('jwt_auth_survey_webhook_url', Jwt_Auth::REMOTE_API_URL . '/api/survey');
        $this->send_survey_to_webhook($sanitized_data, $webhook_url);

        return new WP_REST_Response(
            array(
                'success' => true,
                'message' => 'Survey submitted successfully.',
            ),
            200
        );
    }

    /**
     * Get survey completion status for current user.
     *
     * @return WP_REST_Response
     */
    public function get_survey_status()
    {
        $user_id      = get_current_user_id();
        $completed_at = get_user_meta($user_id, 'jwt_auth_survey_completed', true);

        return new WP_REST_Response(
            array(
                'completed'   => ! empty($completed_at),
                'completedAt' => $completed_at ?: null,
            ),
            200
        );
    }

    /**
     * Mark survey as completed for current user.
     *
     * @param WP_REST_Request $request
     * @return WP_REST_Response
     */
    public function mark_survey_completed(WP_REST_Request $request)
    {
        $user_id      = get_current_user_id();
        $completed_at = $request->get_param('completedAt') ?: current_time('mysql');

        $success = update_user_meta($user_id, 'jwt_auth_survey_completed', $completed_at);

        if (! $success) {
            return new WP_Error(
                'jwt_auth_survey_completion_failed',
                'Failed to mark survey as completed.',
                array('status' => 500)
            );
        }

        return new WP_REST_Response(
            array(
                'success'     => true,
                'completedAt' => $completed_at,
            ),
            200
        );
    }

    /**
     * Handle survey floating card dismissal tracking.
     *
     * @param WP_REST_Request $request
     * @return WP_REST_Response|WP_Error
     */
    public function handle_survey_dismissal(WP_REST_Request $request)
    {
        $user_id = get_current_user_id();

        if ($request->get_method() === 'GET') {
            // Get dismissal data
            $dismissal_data = get_user_meta($user_id, 'jwt_auth_survey_dismissal', true);
            
            if (!$dismissal_data) {
                $dismissal_data = array(
                    'count' => 0,
                    'lastDismissedAt' => null,
                    'hideUntil' => null
                );
            }

            // Check if we should show the card
            $now = time();
            $shouldShow = true;
            
            if ($dismissal_data['count'] >= 3) {
                $shouldShow = false;
            } elseif ($dismissal_data['hideUntil'] && $now < $dismissal_data['hideUntil']) {
                $shouldShow = false;
            }

            return new WP_REST_Response(
                array(
                    'dismissalCount' => $dismissal_data['count'],
                    'lastDismissedAt' => $dismissal_data['lastDismissedAt'],
                    'shouldShow' => $shouldShow,
                ),
                200
            );
        }

        if ($request->get_method() === 'POST') {
            // Update dismissal data
            $dismissal_data = get_user_meta($user_id, 'jwt_auth_survey_dismissal', true) ?: array(
                'count' => 0,
                'lastDismissedAt' => null,
                'hideUntil' => null
            );

            $dismissal_data['count']++;
            $dismissal_data['lastDismissedAt'] = current_time('mysql');
            
            // Hide for 14 days if not already at max dismissals
            if ($dismissal_data['count'] < 3) {
                $dismissal_data['hideUntil'] = time() + (14 * DAY_IN_SECONDS);
            }

            $success = update_user_meta($user_id, 'jwt_auth_survey_dismissal', $dismissal_data);

            if (!$success) {
                return new WP_Error(
                    'jwt_auth_dismissal_update_failed',
                    'Failed to update dismissal data.',
                    array('status' => 500)
                );
            }

            return new WP_REST_Response(
                array(
                    'success' => true,
                    'dismissalCount' => $dismissal_data['count'],
                    'shouldShow' => $dismissal_data['count'] < 4,
                ),
                200
            );
        }

        return new WP_Error(
            'jwt_auth_method_not_allowed',
            'Method not allowed.',
            array('status' => 405)
        );
    }

    /**
     * Send survey data to webhook (non-blocking).
     *
     * @param array  $survey_data
     * @param string $webhook_url
     * @return void
     */
    private function send_survey_to_webhook($survey_data, $webhook_url)
    {
        wp_remote_post(
            $webhook_url,
            array(
                'timeout'   => 5,
                'blocking'  => false,
                // TODO: remove this once we have a valid SSL certificate
                'sslverify' => false,
                'headers'   => array(
                    'Content-Type' => 'application/json',
                    'User-Agent'   => 'JWT-Auth-Plugin/' . $this->version,
                ),
                'body'     => wp_json_encode($survey_data),
            )
        );
    }
}
