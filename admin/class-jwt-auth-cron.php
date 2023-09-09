<?php

/**
 * Defines the CRON functionality of the plugin.
 *
 * @author     Enrique Chavez <noone@tmeister.net>
 * @since      1.3.4
 */
class Jwt_Auth_Cron {
	public static string $remote_api_url = 'https://track.wpjwt.com';

	/**
	 * If the user agrees to share data, then we will send some data.
	 *
	 * @return void|null
	 * @since 1.3.4
	 */
	static public function collect() {
		// if the user doesn't agree to share data, then we don't do anything
		if ( ! self::allow_shared_data() ) {
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

		// Wrap the request in a try/catch to avoid fatal errors
		// and set the timeout to 5 seconds to avoid long delays
		try {
			$api_url = self::$remote_api_url . '/api/collect';
			wp_remote_post( $api_url . '/' . $site_url_hash, [
				'body'    => $data,
				'timeout' => 5,
			] );
		} catch ( Exception $e ) {
			error_log( 'Error adding site to remote database' );
			error_log( $e->getMessage() );
		}
	}

	/**
	 * If the user agrees to share data, then we will remove the site from the remote database.
	 *
	 * @return void|null
	 * @since 1.3.4
	 */
	static public function remove() {
		// First we remove the scheduled event
		wp_clear_scheduled_hook( 'jwt_auth_share_data' );
		// Then we remove the site from the remote database
		$site_url_hash = hash( 'sha256', get_site_url() );
		// Wrap the request in a try/catch to avoid fatal errors
		// and set the timeout to 5 seconds to avoid long delays
		try {
			$api_url = self::$remote_api_url . '/api/destroy';
			wp_remote_post( $api_url . '/' . $site_url_hash, [
				'timeout' => 5,
			] );
		} catch ( Exception $e ) {
			error_log( 'Error removing site from remote database' );
			error_log( $e->getMessage() );
		}
	}

	/**
	 * Check if the user agrees to share data.
	 * @return bool
	 * @since 1.3.4
	 */
	static public function allow_shared_data(): bool {
		$jwt_auth_options = get_option( 'jwt_auth_options' );

		return ( isset( $jwt_auth_options['share_data'] ) && $jwt_auth_options['share_data'] );
	}
}
