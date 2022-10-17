<?php
/**
 * Define a `wrapper namespace` to load the Firebase's JWT & Key classes
 * and prevent conflicts with other plugins using the same library
 * with different versions.
 *
 * @link       https://enriquechavez.co
 * @since      1.3.2
 * @author     marioshtika https://github.com/marioshtika
 */

namespace Tmeister\Firebase\JWT;

class JWT extends \Firebase\JWT\JWT {
}

class Key extends \Firebase\JWT\Key {
}
