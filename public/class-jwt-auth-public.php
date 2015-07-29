<?php

/**
 * Requiere the JWT library.
 */
use \Firebase\JWT\JWT;

/**
 * The public-facing functionality of the plugin.
 *
 * @link       https://enriquechavez.co
 * @since      1.0.0
 */

/**
 * The public-facing functionality of the plugin.
 *
 * Defines the plugin name, version, and two examples hooks for how to
 * enqueue the admin-specific stylesheet and JavaScript.
 *
 * @author     Enrique Chavez <noone@tmeister.net>
 */
class Jwt_Auth_Public
{
    /**
     * The ID of this plugin.
     *
     * @since    1.0.0
     *
     * @var string The ID of this plugin.
     */
    private $plugin_name;

    /**
     * The version of this plugin.
     *
     * @since    1.0.0
     *
     * @var string The current version of this plugin.
     */
    private $version;

    /**
     * The namespace to add to the api calls.
     *
     * @var string The namespace to add to the api call
     */
    private $namespace;

    /**
     * Initialize the class and set its properties.
     *
     * @since    1.0.0
     *
     * @param string $plugin_name The name of the plugin.
     * @param string $version     The version of this plugin.
     */
    public function __construct($plugin_name, $version)
    {
        $this->plugin_name = $plugin_name;
        $this->version = $version;
        $this->namespace = $this->plugin_name.'/v'.intval($this->version);
    }

    /**
     * [add_api_routes description].
     */
    public function add_api_routes()
    {
        register_rest_route($this->namespace, 'login', array(
            'methods' => 'POST',
            'callback' => array($this, 'user_login'),
        ));
    }

    /**
     * [user_login description].
     *
     * @param [type] $request [description]
     *
     * @return [type] [description]
     */
    public function user_login($request)
    {
        $username = $request->get_param('username');
        $password = $request->get_param('password');
        $user = wp_authenticate($username, $password);
        if (is_wp_error($user)) {
            return new WP_Error('auth-failed', __('Wrong credentials', 'wp-api-jwt-auth'));
        }

        return $user;
    }
}
