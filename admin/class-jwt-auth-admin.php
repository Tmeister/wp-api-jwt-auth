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
        $pro_link_url = add_query_arg($utm_params, $base_pro_url);

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
		
		if ( $is_dev_mode ) {
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
					'apiUrl' => rest_url( 'wp/v2/settings' ),
					'nonce' => wp_create_nonce( 'wp_rest' ),
					'settings' => get_option( 'jwt_auth_options', ['share_data' => false] )
				];
				echo '<script>window.jwtAuthConfig = ' . wp_json_encode( $config ) . ';</script>';
			}, 5 ); // Priority 5 to run before the module script
		} else {
			wp_localize_script(
				$this->plugin_name . '-settings',
				'jwtAuthConfig',
				[
					'apiUrl' => rest_url( 'wp/v2/settings' ),
					'nonce' => wp_create_nonce( 'wp_rest' ),
					'settings' => get_option( 'jwt_auth_options', ['share_data' => false] )
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

            $pro_link_url = add_query_arg($utm_params, $base_pro_url);
            $pro_link_style = 'style="color: #00a32a; font-weight: 700; text-decoration: none;" onmouseover="this.style.color=\'#008a20\';" onmouseout="this.style.color=\'#00a32a\';"';

            $pro_link_text = $selected_variation['text'];
            $links[]       = '<a href="' . esc_url($pro_link_url) . '" target="_blank" ' . $pro_link_style . ' rel="noopener noreferrer">' . $pro_link_text . '</a>';
		}

		return $links;
	}
}
