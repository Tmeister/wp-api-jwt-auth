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

	public function register_menu_page(){
		// Register a new submenu under the Settings top-level menu:
		add_submenu_page(
			'options-general.php',
			__('JWT Authentication', 'jwt-auth'),
			__('JWT Authentication', 'jwt-auth'),
			'manage_options',
			'jwt-authentication',
			[$this, 'render_admin_page']
		);
	}

	public function render_admin_page(){
		?>
			<div id="jwt-auth-holder">Here my boi</div>
		<?php
	}
}
