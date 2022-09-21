<?php

/**
 * Define the internationalization functionality.
 *
 * Loads and defines the internationalization files for this plugin
 * so that it is ready for translation.
 *
 * @link       https://enriquechavez.co
 * @since      1.0.0
 */

/**
 * Define the internationalization functionality.
 *
 * Loads and defines the internationalization files for this plugin
 * so that it is ready for translation.
 *
 * @since      1.0.0
 *
 * @author     Enrique Chavez <noone@tmeister.net>
 */
class Jwt_Auth_i18n {
	/**
	 * The domain specified for this plugin.
	 *
	 * @since    1.0.0
	 *
	 * @var string The domain identifier for this plugin.
	 */
	private string $domain;

	/**
	 * Load the plugin text domain for translation.
	 *
	 * @since    1.0.0
	 */
	public function load_plugin_textdomain() {
		load_plugin_textdomain(
			$this->domain,
			false,
			dirname( plugin_basename( __FILE__ ), 2 ) . '/languages/'
		);
	}

	/**
	 * Set the domain equal to that of the specified domain.
	 *
	 * @param string $domain The domain that represents the locale of this plugin.
	 *
	 * @since    1.0.0
	 *
	 */
	public function set_domain( string $domain ) {
		$this->domain = $domain;
	}
}
