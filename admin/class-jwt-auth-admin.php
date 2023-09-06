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

	public function register_menu_page() {
		// Register a new submenu under the Settings top-level menu:
		add_submenu_page(
			'options-general.php',
			__( 'JWT Authentication', 'jwt-auth' ),
			__( 'JWT Authentication', 'jwt-auth' ),
			'manage_options',
			'jwt_authentication',
			[ $this, 'render_admin_page' ]
		);
	}

	public function enqueue_plugin_assets( $suffix ) {
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

	public function render_admin_page() {
		?>
        <div id="jwt-auth-holder"></div>
		<?php
	}
}
