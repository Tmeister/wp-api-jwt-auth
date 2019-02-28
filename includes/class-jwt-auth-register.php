<?php

if ( ! defined( 'WPINC' ) ) {
	die;
}

/**
 * Class Jwt_Auth_Register
 *
 * adds htaccess rules to plugin activation
 *
 * @author          Nicolas GEHIN - studio RVOLA
 * @author_uri      https://www.rvola.com
 * @version         1.0.0
 * Created          2017-10-06
 */
final class Jwt_Auth_Register {

	/**
	 * Const file htaccess
	 */
	const HTACCESS = ABSPATH . '/.htaccess';
	/**
	 *Const marker for htaccess
	 */
	const NAME = 'JWT Authentication for WP-API';
	/**
	 * Const start marker
	 */
	const START_MARKER = "# BEGIN " . self::NAME;
	/**
	 * Const end marker
	 */
	const END_MARKER = "# END " . self::NAME;

	/**
	 * Method for activation, to implement htaccess rules for HTTP Authentification
	 */
	public static function activation() {

		$jwt_rules   = array();
		$jwt_rules[] = "<IfModule mod_rewrite.c>";
		$jwt_rules[] = "RewriteEngine on";
		$jwt_rules[] = "RewriteCond %{HTTP:Authorization} ^(.*)";
		$jwt_rules[] = "RewriteRule ^(.*) - [E=HTTP_AUTHORIZATION:%1]";
		$jwt_rules[] = "</IfModule>";

		self::insertMarker( $jwt_rules );
	}

	/**
	 * Method for desactivation for delete rules
	 */
	public static function desactivation() {

		self::removeMarker();
	}

	/**
	 * A method derived from WordPress `insert_with_markers`.
	 * /wp-admin/includes/misc.php
	 * Unfortunately, the rule is added after the rules of WordPress which does not activate our rules of authentication by header
	 *
	 * @param $insertion
	 *
	 * @return bool
	 */
	private static function insertMarker( $insertion ) {

		if ( ! file_exists( self::HTACCESS ) ) {
			if ( ! is_writable( dirname( self::HTACCESS ) ) ) {
				return false;
			}
			if ( ! touch( self::HTACCESS ) ) {
				return false;
			}
		} elseif ( ! is_writeable( self::HTACCESS ) ) {
			return false;
		}

		if ( ! is_array( $insertion ) ) {
			$insertion = explode( "\n", $insertion );
		}

		$fp = fopen( self::HTACCESS, 'r+' );
		if ( ! $fp ) {
			return false;
		}

		flock( $fp, LOCK_EX );

		$lines = array();
		while ( ! feof( $fp ) ) {
			$lines[] = rtrim( fgets( $fp ), "\r\n" );
		}

		$new_file_data = implode( "\n", array_merge(
			array( self::START_MARKER ),
			$insertion,
			array( self::END_MARKER ),
			$lines
		) );

		fseek( $fp, 0 );
		$bytes = fwrite( $fp, $new_file_data );
		if ( $bytes ) {
			ftruncate( $fp, ftell( $fp ) );
		}
		fflush( $fp );
		flock( $fp, LOCK_UN );
		fclose( $fp );

		return (bool) $bytes;
	}

	/**
	 * Like the insertion of rules and 'exotic' way, we must run a 'house' method to remove our rules
	 *
	 * @return bool
	 */
	private static function removeMarker() {

		if ( ! file_exists( self::HTACCESS ) ) {
			if ( ! is_writable( dirname( self::HTACCESS ) ) ) {
				return false;
			}
			if ( ! touch( self::HTACCESS ) ) {
				return false;
			}
		} elseif ( ! is_writeable( self::HTACCESS ) ) {
			return false;
		}

		$fp = fopen( self::HTACCESS, 'r+' );
		if ( ! $fp ) {
			return false;
		}

		flock( $fp, LOCK_EX );

		$lines = array();
		while ( ! feof( $fp ) ) {
			$lines[] = rtrim( fgets( $fp ), "\r\n" );
		}

		$state = true;
		foreach ( $lines as $d => $line ) {
			if ( strpos( $line, self::START_MARKER ) !== false ) {
				$state = true;
			}
			if ( $state ) {
				unset( $lines[ $d ] );
			}
			if ( strpos( $line, self::END_MARKER ) !== false ) {
				$state = false;
			}
		}
		$newdata = implode( "\n", $lines );

		fseek( $fp, 0 );
		$bytes = fwrite( $fp, $newdata );
		if ( $bytes ) {
			ftruncate( $fp, ftell( $fp ) );
		}
		fflush( $fp );
		flock( $fp, LOCK_UN );
		fclose( $fp );

		return (bool) $bytes;
	}

}
