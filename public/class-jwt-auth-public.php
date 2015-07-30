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
        $secret_key = $this->get_option('jwt_main_options', 'secret_key', false);
        $username = $request->get_param('username');
        $password = $request->get_param('password');

        if (!$secret_key) {
            return new WP_Error(
                'jwt_bad_config',
                __('Bad Configuration', 'wp-api-jwt-auth'),
                array(
                    'status' => 403,
                    'message' => 'JWT is not configurated properly, please contact the admin',
                )
            );
        }

        $user = wp_authenticate($username, $password);

        if (is_wp_error($user)) {
            return new WP_Error(
                'jwt_auth_failed',
                __('Wrong credentials', 'wp-api-jwt-auth'),
                array(
                    'status' => 403,
                    'message' => __('Your credential are invalid.', 'wp-api-jwt-auth'),
                )
            );
        }

        $issuedAt = time();
        $notBefore = apply_filters('jwt_auth_not_before', $issuedAt, $issuedAt);
        $expire = apply_filters('jwt_auth_expire', $issuedAt + (DAY_IN_SECONDS * 7), $issuedAt);

        $token = array(
            'iss' => get_bloginfo('url'),
            'iat' => $issuedAt,
            'nbf' => $notBefore,
            'exp' => $expire,
            'data' => array(
                'user' => array(
                    'id' => $user->data->ID,
                ),
            ),
        );

        /*
         * Let the user modify the token data before the sign.
         */
        $token = JWT::encode(apply_filters('jwt_auth_token_before_sign', $token), $secret_key);

        $data = array(
            'token' => $token,
            'user_email' => $user->data->user_email,
            'user_nicename' => $user->data->user_nicename,
            'user_display_name' => $user->data->display_name,
        );

        /*
         * Let the user modify the data before send it back
         */

        return apply_filters('jwt_auth_token_before_dispatch', $data, $user);
    }

    public function verify_token($user)
    {
        /*
         * Looking for the HTTP_AUTHORIZATION header, if not present just
         * return the user.
         */
        $auth = isset($_SERVER['HTTP_AUTHORIZATION']) ?  $_SERVER['HTTP_AUTHORIZATION'] : false;
        if (!$auth) {
            return $user;
        }

        /*
         * The HTTP_AUTHORIZATION is present verify the format
         * if the format is wrong return the user.
         */
        list($token) = sscanf($auth, 'Bearer %s');
        if (!$token) {
            return $user;
        }

        /*
         * Get the Secret Key
         */
         $secret_key = $this->get_option('jwt_main_options', 'secret_key', false);
        if (!$secret_key) {
            return $user;
        }

        /*
         * Try to decode the token
         */
         try {
             $token = JWT::decode($token, $secret_key, array('HS256'));

             /**
              * The Token is decoded now validate the iss
              */
              if( $token->iss != get_bloginfo('url') ){
                  /**
                   * The iss do not match, return the user
                   */
                  return $user;
              }
              /**
               * So far so good, validate the user id in the token
               */
               if( !isset( $token->data->user->id ) ){
                   /**
                    * No user id in the token, abort!!
                    */
                    return $user;
               }
               /**
                * Everything looks good, change the user id
                */
                return $token->data->user->id;

         } catch (Exception $e) {
             /*
              * Something is wrong, probably the token expired
              * I need to find the way to hijack the API response to send the
              * error back to the user.
              * For now just return the user and let the API validate te call.
              */
             return $user;
         }
    }

    private function get_option($section, $option, $default = '')
    {
        $options = get_option($section);
        if (isset($options[$option]) && !empty($options[$option]) && $options[$option] != null) {
            return $options[$option];
        }

        return $default;
    }
}
