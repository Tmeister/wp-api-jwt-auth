<?php

/**
 * The file that defines the core plugin class.
 *
 * A class definition that includes attributes and functions used across both the
 * public-facing side of the site and the admin area.
 *
 * @link       https://enriquechavez.co
 * @since      1.0.0
 */

/**
 * The core plugin class.
 *
 * This is used to define internationalization, admin-specific hooks, and
 * public-facing site hooks.
 *
 * Also maintains the unique identifier of this plugin as well as the current
 * version of the plugin.
 *
 * @since      1.0.0
 *
 * @author     Enrique Chavez <noone@tmeister.net>
 */
class Jwt_Auth {
	/**
	 * The loader that's responsible for maintaining and registering all hooks that power
	 * the plugin.
	 *
	 * @since    1.0.0
	 *
	 * @var Jwt_Auth_Loader Maintains and registers all hooks for the plugin.
	 */
	protected Jwt_Auth_Loader $loader;

	/**
	 * The unique identifier of this plugin.
	 *
	 * @since    1.0.0
	 *
	 * @var string The string used to uniquely identify this plugin.
	 */
	protected string $plugin_name;

	/**
	 * The current version of the plugin.
	 *
	 * @since    1.0.0
	 *
	 * @var string The current version of the plugin.
	 */
	protected string $version;

	/**
	 * Define the core functionality of the plugin.
	 *
	 * Set the plugin name and the plugin version that can be used throughout the plugin.
	 * Load the dependencies, define the locale, and set the hooks for the admin area and
	 * the public-facing side of the site.
	 *
	 * @since    1.0.0
	 */
	public function __construct() {
		$this->plugin_name = 'jwt-auth';
		$this->version     = '1.3.3';

		$this->load_dependencies();
		$this->set_locale();
		$this->define_public_hooks();
		$this->define_admin_hooks();
	}

	/**
	 * Load the required dependencies for this plugin.
	 *
	 * Include the following files that make up the plugin:
	 *
	 * - Jwt_Auth_Loader. Orchestrates the hooks of the plugin.
	 * - Jwt_Auth_i18n. Defines internationalization functionality.
	 * - Jwt_Auth_Admin. Defines all hooks for the admin area.
	 * - Jwt_Auth_Public. Defines all hooks for the public side of the site.
	 *
	 * Create an instance of the loader which will be used to register the hooks
	 * with WordPress.
	 *
	 * @since    1.0.0
	 */
	private function load_dependencies() {

		/**
		 * Load dependencies managed by composer.
		 */
		require_once plugin_dir_path( dirname( __FILE__ ) ) . 'includes/vendor/autoload.php';

		/**
		 * The class responsible for orchestrating the actions and filters of the
		 * core plugin.
		 */
		require_once plugin_dir_path( dirname( __FILE__ ) ) . 'includes/class-jwt-auth-loader.php';

		/**
		 * The class responsible for defining internationalization functionality
		 * of the plugin.
		 */
		require_once plugin_dir_path( dirname( __FILE__ ) ) . 'includes/class-jwt-auth-i18n.php';

		/**
		 * Class responsible for creating a `wrapper namespace` to load the Firebase's JWT & Key
		 * classes and prevent conflicts with other plugins using the same library
		 * with different versions.
		 */
		require_once plugin_dir_path(dirname(__FILE__)) . 'includes/class-jwt-namespace-wrapper.php';

		/**
		 * The class responsible for defining all actions that occur in the public-facing
		 * side of the site.
		 */
		require_once plugin_dir_path( dirname( __FILE__ ) ) . 'public/class-jwt-auth-public.php';

		/**
		 * The class responsible for defining all actions that occur in the admin-facing
		 * side of the site.
		 */
		require_once plugin_dir_path( dirname( __FILE__ ) ) . 'admin/class-jwt-auth-admin.php';

		$this->loader = new Jwt_Auth_Loader();
	}

	/**
	 * Define the locale for this plugin for internationalization.
	 *
	 * Uses the Jwt_Auth_i18n class in order to set the domain and to register the hook
	 * with WordPress.
	 *
	 * @since    1.0.0
	 */
	private function set_locale() {
		$plugin_i18n = new Jwt_Auth_i18n();
		$plugin_i18n->set_domain( $this->get_plugin_name() );
		$this->loader->add_action( 'plugins_loaded', $plugin_i18n, 'load_plugin_textdomain' );
	}

	/**
	 * Register all the hooks related to the public-facing functionality
	 * of the plugin.
	 *
	 * @since    1.0.0
	 */
	private function define_public_hooks() {
		$plugin_public = new Jwt_Auth_Public( $this->get_plugin_name(), $this->get_version() );
		$this->loader->add_action( 'rest_api_init', $plugin_public, 'add_api_routes' );
		$this->loader->add_filter( 'rest_api_init', $plugin_public, 'add_cors_support' );
		$this->loader->add_filter( 'rest_pre_dispatch', $plugin_public, 'rest_pre_dispatch', 10, 2 );
		$this->loader->add_filter( 'determine_current_user', $plugin_public, 'determine_current_user' );
	}

	/**
	 * Register all the hooks related to the admin-facing functionality
	 * of the plugin.
	 *
	 * @since    1.3.4
	 */
	private function define_admin_hooks() {
		$plugin_admin = new Jwt_Auth_Admin( $this->get_plugin_name(), $this->get_version() );
		$this->loader->add_action( 'admin_menu', $plugin_admin, 'register_menu_page' );
		$this->loader->add_action( 'admin_enqueue_scripts', $plugin_admin, 'enqueue_plugin_assets' );
		$this->loader->add_action( 'admin_init', $plugin_admin, 'register_plugin_settings' );
		$this->loader->add_action( 'rest_api_init', $plugin_admin, 'register_plugin_settings' );
		$this->loader->add_action( 'admin_notices', $plugin_admin, 'display_admin_notice' );
	}

	/**
	 * Run the loader to execute all the hooks with WordPress.
	 *
	 * @since    1.0.0
	 */
	public function run() {
		$this->loader->run();
	}

	/**
	 * The name of the plugin used to uniquely identify it within the context of
	 * WordPress and to define internationalization functionality.
	 *
	 * @return string The name of the plugin.
	 * @since     1.0.0
	 *
	 */
	public function get_plugin_name(): string {
		return $this->plugin_name;
	}

	/**
	 * The reference to the class that orchestrates the hooks with the plugin.
	 *
	 * @return Jwt_Auth_Loader Orchestrates the hooks of the plugin.
	 * @since     1.0.0
	 *
	 */
	public function get_loader(): Jwt_Auth_Loader {
		return $this->loader;
	}

	/**
	 * Retrieve the version number of the plugin.
	 *
	 * @return string The version number of the plugin.
	 * @since     1.0.0
	 *
	 */
	public function get_version(): string {
		return $this->version;
	}
}
