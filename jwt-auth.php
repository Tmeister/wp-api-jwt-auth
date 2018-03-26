<?php

/**
 * The plugin bootstrap file.
 *
 * This file is read by WordPress to generate the plugin information in the plugin
 * admin area. This file also includes all of the dependencies used by the plugin,
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
 * Version:           1.2.4
 * Author:            Enrique Chavez
 * Author URI:        https://enriquechavez.co
 * License:           GPL-2.0+
 * License URI:       http://www.gnu.org/licenses/gpl-2.0.txt
 * Text Domain:       jwt-auth
 * Domain Path:       /languages
 */

// If this file is called directly, abort.
if (!defined('WPINC')) {
    die;
}

/**
 * The core plugin class that is used to define internationalization,
 * admin-specific hooks, and public-facing site hooks.
 */
require plugin_dir_path(__FILE__) . 'includes/class-jwt-auth.php';

function jwt_auth_load_first()
{
    $plugin = str_replace(WP_PLUGIN_DIR . '/', '', __FILE__);
    $plugins = get_option('active_plugins');
    if (empty($plugins)) return;

    $offset = array_search($plugin, $plugins);
    if (empty($offset)) return;

    array_splice($plugins, $offset, 1);
    array_unshift($plugins, $plugin);
    update_option('active_plugins', $plugins);
}
add_action('plugins_loaded', 'jwt_auth_load_first');

/**
 * Begins execution of the plugin.
 *
 * Since everything within the plugin is registered via hooks,
 * then kicking off the plugin from this point in the file does
 * not affect the page life cycle.
 *
 * @since    1.0.0
 */
function run_jwt_auth()
{
    $plugin = new Jwt_Auth();
    $plugin->run();
}
run_jwt_auth();
