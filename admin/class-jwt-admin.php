<?php

/**
 * The admin-specific functionality of the plugin.
 *
 * @link       somw
 * @since      1.0.0
 *
 * @package    Jwt
 * @subpackage Jwt/admin
 */

/**
 * The admin-specific functionality of the plugin.
 *
 * Defines the plugin name, version, and two examples hooks for how to
 * enqueue the admin-specific stylesheet and JavaScript.
 *
 * @package    Jwt
 * @subpackage Jwt/admin
 * @author     Enrique Chavez <noone@tmeister.net>
 */
class Jwt_Auth_Admin
{

    /**
     * The ID of this plugin.
     *
     * @since    1.0.0
     * @access   private
     * @var      string $plugin_name The ID of this plugin.
     */
    private $plugin_name;

    /**
     * The version of this plugin.
     *
     * @since    1.0.0
     * @access   private
     * @var      string $version The current version of this plugin.
     */
    private $version;

    /**
     * Initialize the class and set its properties.
     *
     * @since    1.0.0
     *
     * @param      string $plugin_name The name of this plugin.
     * @param      string $version The version of this plugin.
     */
    public function __construct($plugin_name, $version)
    {
        $this->plugin_name = $plugin_name;
        $this->version = $version;
    }

    /**
     * Add teh custom post to store the tokens
     *
     * @since 2.0
     */
    public function add_token_custom_post()
    {
        $labels = array(
            'name' => _x('Tokens', 'post type general name', 'jwt'),
            'singular_name' => _x('Token', 'post type singular name', 'jwt'),
            'menu_name' => _x('Tokens', 'admin menu', 'jwt'),
            'name_admin_bar' => _x('Tokens', 'add new on admin bar', 'jwt'),
            'add_new' => _x('Add New', 'token', 'jwt'),
            'add_new_item' => __('Add New Token', 'jwt'),
            'new_item' => __('New Token', 'jwt'),
            'edit_item' => __('Edit Token', 'jwt'),
            'view_item' => __('View Token', 'jwt'),
            'all_items' => __('Tokens', 'jwt'),
            'search_items' => __('Search Tokens', 'jwt'),
            'parent_item_colon' => __('Parent Tokens:', 'jwt'),
            'not_found' => __('No tokens found.', 'jwt'),
            'not_found_in_trash' => __('No tokens found in Trash.', 'jwt')
        );

        $args = array(
            'labels' => apply_filters('jwt_auth_token_custom_post_labels', $labels),
            'description' => __('Description.', 'jwt'),
            'public' => true,
            'publicly_queryable' => true,
            'show_ui' => true,
            'show_in_menu' => 'users.php',
            'query_var' => true,
            'capability_type' => 'post',
            'has_archive' => false,
            'hierarchical' => false,
            'menu_position' => null,
            'supports' => array('title')
        );

        $custom_post_name = apply_filters('jwt_auth_token_custom_post_name', 'jwt_token');
        $args = apply_filters('jwt_auth_token_custom_post_arguments', $args);

        register_post_type($custom_post_name, $args);
    }

    /**
     * Add the tokens assigned to the current user
     *
     * @param $user WP_User
     *
     * @return string The HTML for the User page
     * @since 2.0
     */
    public function add_data_on_user_page($user)
    {
        if ( ! current_user_can('remove_users')) {
            return;
        }

        /* Query the user tokens by user->ID */
        $args = array(
            'post_type' => 'jwt_token',
            'meta_query' => array(
                array(
                    'key' => 'jwt_user_id',
                    'value' => $user->ID
                )
            )
        );
        /* Get the  user tokens */
        $user_tokens = get_posts($args);

        /* If there is no tokens, skip the extra content */
        if ( ! count($user_tokens)) {
            return;
        }

        /* We have tokens show the UI */
        ob_start();
        require dirname(__FILE__) . '/partials/user-page-token-list.php';
        echo ob_get_clean();
    }
}
