<?php

/**
 * The admin-specific functionality of the plugin.
 *
 * @link       https://enriquechavez.co
 * @since      1.0.0
 */

/**
 * The admin-specific functionality of the plugin.
 *
 * Defines the plugin name, version, and two examples hooks for how to
 * enqueue the admin-specific stylesheet and JavaScript.
 *
 * @author     Enrique Chavez <noone@tmeister.net>
 */
class Jwt_Auth_Admin
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

    private $setting_api;

    /**
     * Initialize the class and set its properties.
     *
     * @since    1.0.0
     *
     * @param string $plugin_name The name of this plugin.
     * @param string $version     The version of this plugin.
     */
    public function __construct($plugin_name, $version)
    {
        $this->plugin_name = $plugin_name;
        $this->version = $version;
    }

    /**
     * Register the admin menus.
     *
     * @since    1.0.0
     */
    public function admin_menu()
    {
        add_options_page(__('JWT Settings', 'wp-api-jwt-auth'), __('JWT Settings', 'wp-api-jwt-auth'), 'delete_posts', 'settings_api_test', array($this, 'plugin_settings_page'));
    }

    /**
     * Configurate the options page sections and fields.
     *
     * @since 1.0.0
     */
    public function add_plugin_options()
    {
        $sections = array(
            array(
                'id' => 'jwt_main_options',
                'title' => __('General', 'wp-api-jwt-auth'),
            ),
        );

        $fields = array(
            'jwt_main_options' => array(
                array(
                    'name' => 'secret_key',
                    'label' => __('Secret Key', 'wp-api-jwt-auth'),
                    'desc' => __('Secret value to verify the JWT signature.', 'wp-api-jwt-auth'),
                    'type' => 'text'
                ),
                array(
                    'name' => 'enable_cors',
                    'label' => __('Enable CORs support', 'wp-api-jwt-auth'),
                    'desc' => __('Description', 'wp-api-jwt-auth'),
                    'type' => 'checkbox'
                )
            )
        );
        $this->settings_api = new WeDevs_Settings_API();
        $this->settings_api->set_sections($sections);
        $this->settings_api->set_fields($fields);
        $this->settings_api->admin_init();
    }

    /**
     * Generate the Options page.
     *
     * @since   1.0.0
     */
    public function plugin_settings_page()
    {
        echo '<div class="wrap">';
        $this->settings_api->show_navigation();
        $this->settings_api->show_forms();
        echo '</div>';
    }
}
