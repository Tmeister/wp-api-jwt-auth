<?php

/**
 * The admin-facing functionality of the plugin.
 *
 * Defines the plugin name, version
 *
 * @author     Enrique Chavez <noone@tmeister.net>
 * @since      1.3.4
 */
class Jwt_Auth_Admin {
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
	public function __construct( string $plugin_name, string $version ) {
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

        register_rest_route($namespace, 'admin/settings', [
            'methods'             => ['GET', 'POST'],
            'callback'            => [$this, 'handle_settings'],
            'permission_callback' => [$this, 'settings_permission_check'],
        ]);

        register_rest_route($namespace, 'admin/status', [
            'methods'             => 'GET',
            'callback'            => [$this, 'get_configuration_status'],
            'permission_callback' => [$this, 'settings_permission_check'],
        ]);
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
            $settings = get_option('jwt_auth_options', [
                'share_data' => false,
            ]);

            return new WP_REST_Response([
                'jwt_auth_options' => $settings
            ], 200);
        }

        if ($request->get_method() === 'POST') {
            $settings = $request->get_param('jwt_auth_options');

            if (! $settings || ! is_array($settings)) {
                return new WP_Error(
                    'jwt_auth_invalid_settings',
                    'Invalid settings data provided.',
                    ['status' => 400]
                );
            }

            // Sanitize and validate settings
            $sanitized_settings = [];

            if (isset($settings['share_data'])) {
                $sanitized_settings['share_data'] = (bool) $settings['share_data'];
            }


            if (isset($settings['survey_data']) && is_array($settings['survey_data'])) {
                $survey_data = [];
                if (isset($settings['survey_data']['building_what'])) {
                    $survey_data['building_what'] = sanitize_text_field($settings['survey_data']['building_what']);
                }
                if (isset($settings['survey_data']['biggest_challenge'])) {
                    $survey_data['biggest_challenge'] = sanitize_textarea_field($settings['survey_data']['biggest_challenge']);
                }
                if (isset($settings['survey_data']['email'])) {
                    $survey_data['email'] = sanitize_email($settings['survey_data']['email']);
                }
                $sanitized_settings['survey_data'] = $survey_data;
            }

            // Merge with existing settings
            $existing_settings = get_option('jwt_auth_options', []);
            $updated_settings = array_merge($existing_settings, $sanitized_settings);

            $success = update_option('jwt_auth_options', $updated_settings);

            if (! $success) {
                return new WP_Error(
                    'jwt_auth_settings_update_failed',
                    'Failed to update settings.',
                    ['status' => 500]
                );
            }

            return new WP_REST_Response([
                'jwt_auth_options' => $updated_settings
            ], 200);
        }

        return new WP_Error(
            'jwt_auth_method_not_allowed',
            'Method not allowed.',
            ['status' => 405]
        );
    }

    /**
     * Get real configuration status for the dashboard.
     *
     * @return WP_REST_Response
     */
    public function get_configuration_status()
    {
        $secret_key = defined('JWT_AUTH_SECRET_KEY') ? JWT_AUTH_SECRET_KEY : false;
        $cors_enabled = defined('JWT_AUTH_CORS_ENABLE') ? JWT_AUTH_CORS_ENABLE : false;
        $dev_mode = defined('JWT_AUTH_DEV_MODE') ? JWT_AUTH_DEV_MODE : false;

        // Check if JWT secret key is configured
        $secret_key_configured = !empty($secret_key);

        // Check if .htaccess is properly configured by testing authorization header
        $htaccess_configured = $this->check_htaccess_config();

        // Get active plugins count
        $active_plugins = get_option('active_plugins', []);
        $plugin_count = count($active_plugins);

        // Check PHP version compatibility
        $php_version = PHP_VERSION;
        $php_compatible = version_compare($php_version, '7.4', '>=');
        $pro_compatible = version_compare($php_version, '7.4', '>=');

        // WordPress version
        $wp_version = get_bloginfo('version');

        // MySQL version
        global $wpdb;
        $mysql_version = $wpdb->get_var("SELECT VERSION()") ?: 'Unknown';

        // PHP Memory Limit
        $memory_limit = ini_get('memory_limit');

        // PHP Post Max Size
        $post_max_size = ini_get('post_max_size');

        // Configuration method detection
        $config_method = $secret_key_configured ? 'wp-config.php' : 'Not configured';

        $status = [
            'configuration' => [
                'method' => $config_method,
                'secret_key_configured' => $secret_key_configured,
                'cors_enabled' => $cors_enabled,
                'dev_mode' => $dev_mode,
                'htaccess_configured' => $htaccess_configured,
            ],
            'system' => [
                'php_version' => $php_version,
                'php_compatible' => $php_compatible,
                'pro_compatible' => $pro_compatible,
                'wordpress_version' => $wp_version,
                'mysql_version' => $mysql_version,
                'php_memory_limit' => $memory_limit,
                'post_max_size' => $post_max_size,
                'plugin_count' => $plugin_count,
            ],
            'jwt' => [],
            'features' => [
                'token_revocation' => false,
                'token_refresh' => false,
                'analytics' => false,
                'admin_ui' => false,
                'multiple_algorithms' => false,
            ]
        ];

        return new WP_REST_Response($status, 200);
    }

    /**
     * Check if .htaccess is properly configured for JWT Authorization header.
     *
     * @return bool
     */
    private function check_htaccess_config()
    {
        // This is a simplified check - in a real scenario, we'd need to test the actual header
        // For now, we'll check if the server software supports .htaccess
        $server_software = $_SERVER['SERVER_SOFTWARE'] ?? '';

        // If it's Apache, assume .htaccess might be working (basic check)
        if (strpos(strtolower($server_software), 'apache') !== false) {
            return true;
        }

        // For other servers, we can't easily determine this without testing
        return false;
    }

    /**
     * Register a new settings page under Settings main menu
     * .
     * @return void
     * @since 1.3.4
     */
	public function register_menu_page() {
		add_submenu_page(
			'options-general.php',
			__( 'JWT Authentication', 'jwt-auth' ),
			__( 'JWT Authentication', 'jwt-auth' ),
			'manage_options',
			'jwt_authentication',
			[ $this, 'render_admin_page' ]
		);

        // Add Upgrade to PRO submenu item
        $base_pro_url = 'https://jwtauth.pro';
        $utm_params   = [
            'utm_source'   => 'wpadmin',
            'utm_medium'   => 'submenu',
            'utm_campaign' => 'pro-submenu-link',
            'utm_content'  => 'upgrade-to-pro',
        ];
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
	public function display_admin_notice() {
        if (! get_option('jwt_auth_pro_notice_01')) {
			?>
            <div class="notice notice-info is-dismissible">
                <p>
					<?php esc_html_e( 'Exciting News! 🚀 Level Up Your API Authentication: JWT Authentication Pro is now available! Experience advanced features and seamless integration for your REST API.',
						'jwt-auth' ); ?>
                    <a href="https://jwtauth.pro?utm_source=wp-admin&utm_medium=notice&utm_campaign=pro-upgrade-notice" target="_blank"
                       class="button button-primary"
                       style="margin-left: 10px;">
						<?php esc_html_e( 'Upgrade to PRO Now', 'jwt-auth' ); ?>
                    </a>
                </p>
            </div>
			<?php
			update_option( 'jwt_auth_pro_notice_01', true );
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
	public function enqueue_plugin_assets( $suffix = '' ) {
		// Check if $suffix is empty or null
		if ( empty( $suffix ) ) {
		    return; // Exit early to prevent further execution
		}

        if ($suffix !== 'settings_page_jwt_authentication') {
			return null;
		}

		$is_dev_mode = defined( 'JWT_AUTH_DEV_MODE' ) && JWT_AUTH_DEV_MODE;

        if ($is_dev_mode) {
			// Development mode - set up React Refresh preamble first
			add_action( 'admin_head', function() {
				echo '<script type="module">
					import RefreshRuntime from "http://localhost:5173/@react-refresh"
					RefreshRuntime.injectIntoGlobalHook(window)
					window.$RefreshReg$ = () => {}
					window.$RefreshSig$ = () => (type) => type
					window.__vite_plugin_react_preamble_installed__ = true
				</script>';
			} );

			// Load Vite client
			wp_enqueue_script(
				'vite-client',
				'http://localhost:5173/@vite/client',
				[],
				null,
				true
			);

			// Load our main app
			wp_enqueue_script(
				$this->plugin_name . '-settings',
				'http://localhost:5173/src/main.tsx',
				['vite-client'],
				null,
				true
			);

			// Add type="module" to the scripts
			add_filter( 'script_loader_tag', function( $tag, $handle ) {
				if ( in_array( $handle, ['vite-client', $this->plugin_name . '-settings'] ) ) {
					return str_replace( '<script', '<script type="module"', $tag );
				}
				return $tag;
			}, 10, 2 );
		} else {
			// Production mode - load single compiled files
			wp_enqueue_script(
				$this->plugin_name . '-settings',
				plugins_url( 'ui/dist/main.js', __FILE__ ),
				[],
				$this->version,
				['in_footer' => true]
			);

            wp_enqueue_style(
				$this->plugin_name . '-settings',
				plugins_url( 'ui/dist/main.css', __FILE__ ),
				[],
				$this->version
			);
		}

		// Provide WordPress API configuration to React app
		if ( $is_dev_mode ) {
			// For dev mode, we need to add the config manually since we're not using wp_enqueue_script
			add_action( 'admin_footer', function() {
				$config = [
                    'apiUrl' => rest_url('jwt-auth/v1/admin/settings'),
					'nonce' => wp_create_nonce( 'wp_rest' ),
                    'settings' => get_option('jwt_auth_options', ['share_data' => false]),
                    'siteProfile' => [
                        'phpVersion' => PHP_VERSION,
                        'wordpressVersion' => get_bloginfo('version'),
                        'isProCompatible' => version_compare(PHP_VERSION, '7.4', '>='),
                        'isWooCommerceDetected' => class_exists('WooCommerce'),
                        'pluginCount' => count(get_option('active_plugins', [])),
                        'signingAlgorithm' => 'HS256'
                    ]
				];
				echo '<script>window.jwtAuthConfig = ' . wp_json_encode( $config ) . ';</script>';
			}, 5 ); // Priority 5 to run before the module script
		} else {
			wp_localize_script(
				$this->plugin_name . '-settings',
				'jwtAuthConfig',
				[
                    'apiUrl' => rest_url('jwt-auth/v1/admin/settings'),
					'nonce' => wp_create_nonce( 'wp_rest' ),
                    'settings' => get_option('jwt_auth_options', ['share_data' => false]),
                    'siteProfile' => [
                        'phpVersion' => PHP_VERSION,
                        'wordpressVersion' => get_bloginfo('version'),
                        'isProCompatible' => version_compare(PHP_VERSION, '7.4', '>='),
                        'isWooCommerceDetected' => class_exists('WooCommerce'),
                        'pluginCount' => count(get_option('active_plugins', [])),
                        'signingAlgorithm' => 'HS256'
                    ]
				]
			);
		}
	}

	/**
	 * Register the plugin settings.
	 *
	 * @return void
	 * @since 1.3.4
	 */
	public function register_plugin_settings() {
		register_setting( 'jwt_auth', 'jwt_auth_options', [
			'type'         => 'object',
			'default'      => [
				'share_data' => false,
			],
			'show_in_rest' => [
				'schema' => [
					'type'       => 'object',
					'properties' => [
						'share_data' => [
							'type'    => 'boolean',
							'default' => false,
						],
                        'survey_data' => [
                            'type' => 'object',
                            'properties' => [
                                'building_what' => [
                                    'type' => 'string',
                                ],
                                'biggest_challenge' => [
                                    'type' => 'string',
                                ],
                                'email' => [
                                    'type' => 'string',
                                ],
                            ],
                        ],
					],
				],
			]
		] );
	}

	/**
	 * Render the plugin settings page.
	 * This is a React application that will be rendered on the admin page.
	 *
	 * @return void
	 * @since 1.3.4
	 */
	public function render_admin_page() {
		?>
        <div id="jwt-auth-holder"></div>
		<?php
	}

	/**
	 * Add a link to the plugin settings page on the plugin list.
	 *
	 * @param array $links
	 * @param string $file
	 *
	 * @return array
	 * @since 1.3.5
	 */
	public function add_action_link( array $links, string $file): array {

        if ($file === 'jwt-authentication-for-wp-rest-api/jwt-auth.php') {
            $cta_variations = [
                0 => [
                    'text'        => '<b>Get JWT Auth Pro</b>',
                    'utm_content' => 'get-jwt-auth-pro-cta',
                ],
                1 => [
                    'text'        => '<b>Unlock Pro Features</b>',
                    'utm_content' => 'unlock-pro-features-cta',
                ],
            ];

            $selected_variation_key = rand(0, 1);
            $selected_variation     = $cta_variations[$selected_variation_key];

            $base_pro_url = 'https://jwtauth.pro';
            $utm_params   = [
                'utm_source'   => 'wpadmin',
                'utm_medium'   => 'plugin-link',
                'utm_campaign' => 'pro-plugin-action-link',
                'utm_content'  => $selected_variation['utm_content'],
            ];

            $pro_link_url = (string) add_query_arg($utm_params, $base_pro_url);
            $pro_link_style = 'style="color: #00a32a; font-weight: 700; text-decoration: none;" onmouseover="this.style.color=\'#008a20\';" onmouseout="this.style.color=\'#00a32a\';"';

            $pro_link_text = $selected_variation['text'];
            $links[]       = '<a href="' . esc_url($pro_link_url) . '" target="_blank" ' . $pro_link_style . ' rel="noopener noreferrer">' . $pro_link_text . '</a>';
		}

		return $links;
	}
}
