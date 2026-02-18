<?php

/**
 * The plugin bootstrap file.
 *
 * This file is read by WordPress to generate the plugin information in the plugin
 * admin area. This file also includes all the dependencies used by the plugin,
 * registers the activation and deactivation functions, and defines a function
 * that starts the plugin.
 *
 * @link              https://enriquechavez.co
 * @since             1.0.0
 *
 * @wordpress-plugin
 * Plugin Name:       JWT Authentication for WP-API
 * Plugin URI:        https://enriquechavez.co
 * Description:       Extends the WP REST API using JSON Web Tokens Authentication as an authentication method.
 * Version:           1.5.0
 * Author:            Enrique Chavez
 * Author URI:        https://enriquechavez.co
 * License:           GPL-2.0+
 * License URI:       http://www.gnu.org/licenses/gpl-2.0.txt
 * Text Domain:       jwt-auth
 * Domain Path:       /languages
 */

// If this file is called directly, abort.
if ( ! defined( 'WPINC' ) ) {
	die;
}

/**
 * The core plugin class that is used to define internationalization,
 * admin-specific hooks, and public-facing site hooks.
 */
require plugin_dir_path( __FILE__ ) . 'includes/class-jwt-auth.php';

/**
 * The CRON functionality of the plugin.
 *
 * If the user agrees to share data, then we will send some data to the author of the plugin
 * to keep track opf the number of installations, the WP version and the PHP version used.
 */
require plugin_dir_path( __FILE__ ) . 'admin/class-jwt-auth-cron.php';

/**
 * Schedule an action if it's not already scheduled
 */
if ( ! wp_next_scheduled( 'jwt_auth_share_data' ) ) {
	wp_schedule_event( time(), 'weekly', 'jwt_auth_share_data' );
}

/**
 * Run the action that'll fire every week
 *
 * @return void
 */
function jwt_auth_share_data() {
	Jwt_Auth_Cron::collect();
}

/**
 * Hook into the action that'll fire every week
 */
add_action( 'jwt_auth_share_data', 'jwt_auth_share_data' );

/**
 * Track plugin install date and initialize usage counters.
 *
 * This runs on activation for new installs.
 *
 * @return void
 */
function activate_jwt_auth() {
	if ( ! get_option( 'jwt_auth_install_date', false ) ) {
		update_option( 'jwt_auth_install_date', time() );
	}

	if ( get_option( 'jwt_auth_tokens_created', null ) === null ) {
		update_option( 'jwt_auth_tokens_created', 0 );
	}
}

/**
 * Ensure install date is tracked for existing installs.
 *
 * Existing users that upgrade to this version get a backfilled install date
 * to avoid hiding upsells for another week.
 *
 * @since 1.5.0
 * @return void
 */
function jwt_auth_track_install_date() {
	if ( get_option( 'jwt_auth_install_date', false ) ) {
		return;
	}

	update_option( 'jwt_auth_install_date', time() - ( 8 * DAY_IN_SECONDS ) );

	if ( get_option( 'jwt_auth_tokens_created', null ) === null ) {
		update_option( 'jwt_auth_tokens_created', 0 );
	}
}

/**
 * Increment total created JWT tokens counter.
 *
 * @since 1.5.0
 * @return void
 */
function jwt_auth_increment_tokens_created() {
	$count = (int) get_option( 'jwt_auth_tokens_created', 0 );
	update_option( 'jwt_auth_tokens_created', $count + 1 );
}

/**
 * Determine if upsell CTAs should be shown based on usage.
 *
 * @since 1.5.0
 * @return bool
 */
function jwt_auth_should_show_upsell() {
	$install_date = (int) get_option( 'jwt_auth_install_date', time() );
	$days_active = ( time() - $install_date ) / DAY_IN_SECONDS;
	$tokens_created = (int) get_option( 'jwt_auth_tokens_created', 0 );

	return $days_active >= 7 || $tokens_created >= 20;
}

/**
 * Get upsell metrics for UI/API usage.
 *
 * @since 1.5.0
 * @return array<string, int|bool>
 */
function jwt_auth_get_upsell_metrics() {
	$install_date = (int) get_option( 'jwt_auth_install_date', time() );
	$days_active = (int) floor( ( time() - $install_date ) / DAY_IN_SECONDS );
	$tokens_created = (int) get_option( 'jwt_auth_tokens_created', 0 );

	return [
		'shouldShowUpsell' => jwt_auth_should_show_upsell(),
		'daysActive'       => max( 0, $days_active ),
		'tokensCreated'    => $tokens_created,
	];
}

/**
 * This runs during plugin deactivation.
 */
function deactivate_jwt_auth() {
	Jwt_Auth_Cron::remove();
}

/**
 * Hook into the action that'll fire during plugin deactivation
 */
register_deactivation_hook( __FILE__, 'deactivate_jwt_auth' );
register_activation_hook( __FILE__, 'activate_jwt_auth' );

/**
 * Begins execution of the plugin.
 *
 * Since everything within the plugin is registered via hooks,
 * then kicking off the plugin from this point in the file does
 * not affect the page life cycle.
 *
 * @since    1.0.0
 */
function run_jwt_auth() {
	$plugin = new Jwt_Auth();
	$plugin->run();
}

run_jwt_auth();
