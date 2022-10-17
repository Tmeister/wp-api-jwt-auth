<?php

/** Require the JWT library. */
use Tmeister\Firebase\JWT\JWT;
use Tmeister\Firebase\JWT\Key;

/**
 * The public-facing functionality of the plugin.
 *
 * Defines the plugin name, version, and two examples hooks for how to
 * enqueue the admin-specific stylesheet and JavaScript.
 *
 * @author     Enrique Chavez <noone@tmeister.net>
 * @since      1.0.0
 */
class Jwt_Auth_Public {
	/**
	 * The ID of this plugin.
	 *
	 * @since    1.0.0
	 *
	 * @var string The ID of this plugin.
	 */
	private string $plugin_name;

	/**
	 * The version of this plugin.
	 *
	 * @since    1.0.0
	 *
	 * @var string The current version of this plugin.
	 */
	private string $version;

	/**
	 * The namespace to add to the api calls.
	 *
	 * @var string The namespace to add to the api call
	 */
	private string $namespace;

	/**
	 * Store errors to display if the JWT is wrong
	 *
	 * @var WP_Error|null
	 */
	private ?WP_Error $jwt_error = null;

	/**
	 * Supported algorithms to sign the token.
	 *
	 * @var array|string[]
	 * @since 1.3.1
	 * @see https://www.rfc-editor.org/rfc/rfc7518#section-3
	 */
	private array $supported_algorithms = [ 'HS256', 'HS384', 'HS512', 'RS256', 'RS384', 'RS512', 'ES256', 'ES384', 'ES512', 'PS256', 'PS384', 'PS512' ];

	/**
	 * Initialize the class and set its properties.
	 *
	 * @param string $plugin_name The name of the plugin.
	 * @param string $version The version of this plugin.
	 *
	 * @since    1.0.0
	 *
	 */
	public function __construct( string $plugin_name, string $version ) {
		$this->plugin_name = $plugin_name;
		$this->version     = $version;
		$this->namespace   = $this->plugin_name . '/v' . intval( $this->version );
	}

	/**
	 * Add the endpoints to the API
	 */
	public function add_api_routes() {
		register_rest_route( $this->namespace, 'token', [
			'methods'             => 'POST',
			'callback'            => [ $this, 'generate_token' ],
			'permission_callback' => '__return_true',
		] );

		register_rest_route( $this->namespace, 'token/validate', [
			'methods'             => 'POST',
			'callback'            => [ $this, 'validate_token' ],
			'permission_callback' => '__return_true',
		] );
	}

	/**
	 * Add CORs support to the request.
	 */
	public function add_cors_support() {
		$enable_cors = defined( 'JWT_AUTH_CORS_ENABLE' ) && JWT_AUTH_CORS_ENABLE;
		if ( $enable_cors ) {
			$headers = apply_filters( 'jwt_auth_cors_allow_headers', 'Access-Control-Allow-Headers, Content-Type, Authorization' );
			header( sprintf( 'Access-Control-Allow-Headers: %s', $headers ) );
		}
	}

	/**
	 * Get the user and password in the request body and generate a JWT
	 *
	 * @param WP_REST_Request $request
	 *
	 * @return mixed|WP_Error|null
	 */
	public function generate_token( WP_REST_Request $request ) {
		$secret_key = defined( 'JWT_AUTH_SECRET_KEY' ) ? JWT_AUTH_SECRET_KEY : false;
		$username   = $request->get_param( 'username' );
		$password   = $request->get_param( 'password' );

		/** First thing, check the secret key if not exist return an error*/
		if ( ! $secret_key ) {
			return new WP_Error(
				'jwt_auth_bad_config',
				__( 'JWT is not configured properly, please contact the admin', 'wp-api-jwt-auth' ),
				[
					'status' => 403,
				]
			);
		}
		/** Try to authenticate the user with the passed credentials*/
		$user = wp_authenticate( $username, $password );

		/** If the authentication fails return an error*/
		if ( is_wp_error( $user ) ) {
			$error_code = $user->get_error_code();

			return new WP_Error(
				'[jwt_auth] ' . $error_code,
				$user->get_error_message( $error_code ),
				[
					'status' => 403,
				]
			);
		}

		/** Valid credentials, the user exists create the according Token */
		$issuedAt  = time();
		$notBefore = apply_filters( 'jwt_auth_not_before', $issuedAt, $issuedAt );
		$expire    = apply_filters( 'jwt_auth_expire', $issuedAt + ( DAY_IN_SECONDS * 7 ), $issuedAt );

		$token = [
			'iss'  => get_bloginfo( 'url' ),
			'iat'  => $issuedAt,
			'nbf'  => $notBefore,
			'exp'  => $expire,
			'data' => [
				'user' => [
					'id' => $user->data->ID,
				],
			],
		];

		/** Let the user modify the token data before the sign. */
		$algorithm = $this->get_algorithm();

		if ( $algorithm === false ) {
			return new WP_Error(
				'jwt_auth_unsupported_algorithm',
				__( 'Algorithm not supported, see https://www.rfc-editor.org/rfc/rfc7518#section-3', 'wp-api-jwt-auth' ),
				[
					'status' => 403,
				]
			);
		}

		$token = JWT::encode(
			apply_filters( 'jwt_auth_token_before_sign', $token, $user ),
			$secret_key,
			$algorithm
		);

		/** The token is signed, now create the object with no sensible user data to the client*/
		$data = [
			'token'             => $token,
			'user_email'        => $user->data->user_email,
			'user_nicename'     => $user->data->user_nicename,
			'user_display_name' => $user->data->display_name,
		];

		/** Let the user modify the data before send it back */
		return apply_filters( 'jwt_auth_token_before_dispatch', $data, $user );
	}

	/**
	 * This is our Middleware to try to authenticate the user according to the
	 * token send.
	 *
	 * @param (int|bool) $user Logged User ID
	 *
	 * @return (int|bool)
	 */
	public function determine_current_user( $user ) {
		/**
		 * This hook only should run on the REST API requests to determine
		 * if the user in the Token (if any) is valid, for any other
		 * normal call ex. wp-admin/.* return the user.
		 *
		 * @since 1.2.3
		 **/
		$rest_api_slug = rest_get_url_prefix();
		$requested_url = sanitize_url( $_SERVER['REQUEST_URI'] );
		// if we already have a valid user, or we have an invalid url, don't attempt to validate token
		if ( ! defined( 'REST_REQUEST' ) || ! REST_REQUEST || strpos( $requested_url, $rest_api_slug ) === false || $user ) {
			return $user;
		}

		/*
		 * if the request URI is for validate the token don't do anything,
		 * this avoids double calls.
		 */
		$validate_uri = strpos( $requested_url, 'token/validate' );
		if ( $validate_uri > 0 ) {
			return $user;
		}

		/**
		 * We still need to get the Authorization header and check for the token.
		 */
		$auth_header = $_SERVER['HTTP_AUTHORIZATION'] ? sanitize_text_field( $_SERVER['HTTP_AUTHORIZATION'] ) : false;
		/* Double check for different auth header string (server dependent) */
		if ( ! $auth_header ) {
			$auth_header = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ? sanitize_text_field( $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ) : false;
		}

		if ( ! $auth_header ) {
			return $user;
		}

		/*
		 * Check the token from the headers.
		 */
		$token = $this->validate_token( new WP_REST_Request(), $auth_header );

		if ( is_wp_error( $token ) ) {
			if ( $token->get_error_code() != 'jwt_auth_no_auth_header' ) {
				/** If there is an error, store it to show it after see rest_pre_dispatch */
				$this->jwt_error = $token;
			}

			return $user;
		}

		/** Everything is ok, return the user ID stored in the token*/
		return $token->data->user->id;
	}

	/**
	 * Main validation function
	 *
	 * This function is used by the /token/validate endpoint and
	 * by our middleware.
	 *
	 * The function take the token and try to decode it and validated it.
	 *
	 * @param WP_REST_Request $request
	 * @param bool|string $custom_token
	 *
	 * @return WP_Error | Object | Array
	 */
	public function validate_token( WP_REST_Request $request, $custom_token = false ) {
		/*
		 * Looking for the Authorization header
		 *
		 * There is two ways to get the authorization token
		 *  1. via WP_REST_Request
		 *  2. via custom_token, we get this for all the other API requests
		 *
		 * The get_header( 'Authorization' ) checks for the header in the following order:
		 * 1. HTTP_AUTHORIZATION
		 * 2. REDIRECT_HTTP_AUTHORIZATION
		 *
		 * @see https://core.trac.wordpress.org/ticket/47077
		 */

		$auth_header = $custom_token ?: $request->get_header( 'Authorization' );

		if ( ! $auth_header ) {
			return new WP_Error(
				'jwt_auth_no_auth_header',
				'Authorization header not found.',
				[
					'status' => 403,
				]
			);
		}

		/*
		 * Extract the authorization header
		 */
		[ $token ] = sscanf( $auth_header, 'Bearer %s' );

		/**
		 * if the format is not valid return an error.
		 */
		if ( ! $token ) {
			return new WP_Error(
				'jwt_auth_bad_auth_header',
				'Authorization header malformed.',
				[
					'status' => 403,
				]
			);
		}

		/** Get the Secret Key */
		$secret_key = defined( 'JWT_AUTH_SECRET_KEY' ) ? JWT_AUTH_SECRET_KEY : false;
		if ( ! $secret_key ) {
			return new WP_Error(
				'jwt_auth_bad_config',
				'JWT is not configured properly, please contact the admin',
				[
					'status' => 403,
				]
			);
		}

		/** Try to decode the token */
		try {
			$algorithm = $this->get_algorithm();
			if ( $algorithm === false ) {
				return new WP_Error(
					'jwt_auth_unsupported_algorithm',
					__( 'Algorithm not supported, see https://www.rfc-editor.org/rfc/rfc7518#section-3', 'wp-api-jwt-auth' ),
					[
						'status' => 403,
					]
				);
			}

			$token = JWT::decode( $token, new Key( $secret_key, $algorithm ) );

			/** The Token is decoded now validate the iss */
			if ( $token->iss !== get_bloginfo( 'url' ) ) {
				/** The iss do not match, return error */
				return new WP_Error(
					'jwt_auth_bad_iss',
					'The iss do not match with this server',
					[
						'status' => 403,
					]
				);
			}

			/** So far so good, validate the user id in the token */
			if ( ! isset( $token->data->user->id ) ) {
				/** No user id in the token, abort!! */
				return new WP_Error(
					'jwt_auth_bad_request',
					'User ID not found in the token',
					[
						'status' => 403,
					]
				);
			}

			/** Everything looks good return the decoded token if we are using the custom_token */
			if ( $custom_token ) {
				return $token;
			}

			/** This is for the /toke/validate endpoint*/
			return [
				'code' => 'jwt_auth_valid_token',
				'data' => [
					'status' => 200,
				],
			];
		} catch ( Exception $e ) {
			/** Something were wrong trying to decode the token, send back the error */
			return new WP_Error(
				'jwt_auth_invalid_token',
				$e->getMessage(),
				[
					'status' => 403,
				]
			);
		}
	}

	/**
	 * Filter to hook the rest_pre_dispatch, if the is an error in the request
	 * send it, if there is no error just continue with the current request.
	 *
	 * @param $request
	 *
	 * @return mixed|WP_Error|null
	 */
	public function rest_pre_dispatch( $request ) {
		if ( is_wp_error( $this->jwt_error ) ) {
			return $this->jwt_error;
		}

		return $request;
	}

	/**
	 * Get the algorithm used to sign the token via the filter jwt_auth_algorithm.
	 * and validate that the algorithm is in the supported list.
	 *
	 * @return false|mixed|null
	 */
	private function get_algorithm() {
		$algorithm = apply_filters( 'jwt_auth_algorithm', 'HS256' );
		if ( ! in_array( $algorithm, $this->supported_algorithms ) ) {
			return false;
		}

		return $algorithm;
	}
}
