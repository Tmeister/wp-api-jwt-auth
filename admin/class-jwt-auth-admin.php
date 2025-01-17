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
	}

	/**
	 * Shows an admin notice on the admin dashboard to notify the new settings page.
	 * This is only shown once and the message is dismissed.
	 *
	 * @return void
	 * @since 1.3.4
	 */
	public function display_admin_notice() {
		if ( ! get_option( 'jwt_auth_beta_notice_01' ) ) {
			?>
            <div class="notice notice-info is-dismissible">
                <p>
					<?php esc_html_e( 'Exciting News! 🚀 Sign up now for the Early Beta of JWT Authentication Pro! Be among the first to experience advanced security and seamless API integration for your WordPress REST API.',
						'jwt-auth' ); ?>
                    <a href="https://jwtauth.pro?utm_source=wp-admin&utm_medium=notice&utm_campaign=early-beta" target="_blank"
                       class="button button-primary"
                       style="margin-left: 10px;">
						<?php esc_html_e( 'Join the Beta Now', 'jwt-auth' ); ?>
                    </a>
                </p>
            </div>
			<?php
			update_option( 'jwt_auth_beta_notice_01', true );
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
		
		if ( $suffix !== 'settings_page_jwt_authentication' ) {
			return null;
		}
		// get full path to admin/ui/build/index.asset.php
		$asset_file = plugin_dir_path( __FILE__ ) . 'ui/build/index.asset.php';

		// If the asset file do not exist then just return false
		if ( ! file_exists( $asset_file ) ) {
			return null;
		}

		// Get the asset file
		$asset = require_once $asset_file;
		// Enqueue the script files based on the asset file
		wp_enqueue_script(
			$this->plugin_name . '-settings',
			plugins_url( 'ui/build/index.js', __FILE__ ),
			$asset['dependencies'],
			$asset['version'],
			[
				'in_footer' => true,
			]
		);

		// Enqueue the style file for the Gutenberg components
		foreach ( $asset['dependencies'] as $style ) {
			wp_enqueue_style( $style );
		}

		// Enqueue the style file
		wp_enqueue_style(
			$this->plugin_name . '-settings',
			plugins_url( 'ui/build/index.css', __FILE__ ),
			[],
			$asset['version']
		);
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

		// Check if this is the target plugin
		if ( $file === 'jwt-authentication-for-wp-rest-api/jwt-auth.php' ) {
			$new_link = '<a href="https://jwtauth.pro?utm_source=wpadmin&utm_medium=plugin-link&utm_campaign=early-beta" target="_blank"><b>Get Early Beta Access</b></a>';
            $links[]  = $new_link;
		}

		return $links;
	}
}
