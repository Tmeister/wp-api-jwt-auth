<?php

/**
 * Defines the CRON functionality of the plugin.
 *
 * @author     Enrique Chavez <noone@tmeister.net>
 * @since      1.3.4
 */
class Jwt_Auth_Cron {
	/**
	 * If the user agrees to share data, then we will send some data.
	 *
	 * @since 1.3.4
	 * @return void|null
	 */
	static public function share_data() {
		$jwt_auth_options = get_option( 'jwt_auth_options' );
		// If the user doesn't want to share data, then we don't do anything
		if ( ! isset( $jwt_auth_options ) || ! isset( $jwt_auth_options['share_data'] ) || ! $jwt_auth_options['share_data'] ) {
			return null;
		}

		// get the PHP version
		$php_version = phpversion();
		// get the WP version
		$wp_version = get_bloginfo( 'version' );
		// get the list of activated plugins
		$active_plugins = get_option( 'active_plugins' );
		// get the number of activated plugins
		$plugins_count = count( $active_plugins );
		// is WooCommerce installed and activated?
		$woocommerce_installed = in_array( 'woocommerce/woocommerce.php', $active_plugins );
		// get the WooCommerce version
		$woocommerce_version = $woocommerce_installed ? get_option( 'woocommerce_version' ) : null;
		// get the site URL and hash it (we don't want to store the URL in plain text)
		$site_url_hash = hash( 'sha256', get_site_url() );

		$data = [
			'php_version'         => $php_version,
			'wp_version'          => $wp_version,
			'plugins_count'       => $plugins_count,
			'woocommerce_version' => $woocommerce_version
		];

		$api_url = 'https://track.wpjwt.com/api/collect';
		wp_remote_post( $api_url . '/' . $site_url_hash, [
			'body' => $data,
		] );
	}
}
