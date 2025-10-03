=== JWT Authentication for WP REST API ===

Contributors: tmeister
Donate link: https://github.com/sponsors/Tmeister
Tags: oauth, jwt, json web authentication, wp-api, rest api
Requires at least: 4.2
Tested up to: 6.8.1
Requires PHP: 7.4.0
Stable tag: 1.4.1
License: GPLv2 or later
License URI: http://www.gnu.org/licenses/gpl-2.0.html

Extends the WP REST API using JSON Web Tokens Authentication as an authentication method.

== Description ==

This plugin seamlessly extends the WP REST API, enabling robust and secure authentication using JSON Web Tokens (JWT). It provides a straightforward way to authenticate users via the REST API, returning a standard JWT upon successful login.

### Key features of this free version include:

*   **Standard JWT Authentication:** Implements the industry-standard [RFC 7519](https://tools.ietf.org/html/rfc7519) for secure claims representation.
*   **Simple Endpoints:** Offers clear `/token` and `/token/validate` endpoints for generating and validating tokens.
*   **Configurable Secret Key:** Define your unique secret key via `wp-config.php` for secure token signing.
*   **Optional CORS Support:** Easily enable Cross-Origin Resource Sharing support via a `wp-config.php` constant.
*   **Developer Hooks:** Provides filters (`jwt_auth_expire`, `jwt_auth_token_before_sign`, etc.) for customizing token behavior.

JSON Web Tokens are an open, industry standard method for representing claims securely between two parties.

For users requiring more advanced capabilities such as multiple signing algorithms (RS256, ES256), token refresh/revocation, UI-based configuration, or priority support, consider checking out **[JWT Authentication PRO](https://jwtauth.pro/?utm_source=wp_plugin_readme&utm_medium=link&utm_campaign=pro_promotion&utm_content=description_link_soft)**.

**Support and Requests:** Please use [GitHub Issues](https://github.com/Tmeister/wp-api-jwt-auth/issues). For priority support, consider upgrading to [PRO](https://jwtauth.pro/?utm_source=wp_plugin_readme&utm_medium=link&utm_campaign=pro_promotion&utm_content=description_support_link).

### REQUIREMENTS

#### WP REST API V2

This plugin was conceived to extend the [WP REST API V2](https://github.com/WP-API/WP-API) plugin features and, of course, was built on top of it.

So, to use the **wp-api-jwt-auth** you need to install and activate [WP REST API](https://github.com/WP-API/WP-API).

### PHP

**Minimum PHP version: 7.4.0**

### PHP HTTP Authorization Header Enable

Most shared hosting providers have disabled the **HTTP Authorization Header** by default.

To enable this option you'll need to edit your **.htaccess** file by adding the following:

`
RewriteEngine on
RewriteCond %{HTTP:Authorization} ^(.*)
RewriteRule ^(.*) - [E=HTTP_AUTHORIZATION:%1]
`

#### WPENGINE

For WPEngine hosting, you'll need to edit your **.htaccess** file by adding the following:

`
SetEnvIf Authorization "(.*)" HTTP_AUTHORIZATION=$1
`

See https://github.com/Tmeister/wp-api-jwt-auth/issues/1 for more details.

### CONFIGURATION

### Configure the Secret Key

The JWT needs a **secret key** to sign the token. This **secret key** must be unique and never revealed.

To add the **secret key**, edit your wp-config.php file and add a new constant called **JWT_AUTH_SECRET_KEY**:

`
define('JWT_AUTH_SECRET_KEY', 'your-top-secret-key');
`

You can generate a secure key from: https://api.wordpress.org/secret-key/1.1/salt/

**Looking for easier configuration?** [JWT Authentication PRO](https://jwtauth.pro/?utm_source=wp_plugin_readme&utm_medium=link&utm_campaign=pro_promotion&utm_content=config_secret_key_link) allows you to manage all settings through a simple admin UI.

### Configure CORS Support

The **wp-api-jwt-auth** plugin has the option to activate [CORS](https://en.wikipedia.org/wiki/Cross-origin_resource_sharing) support.

To enable CORS Support, edit your wp-config.php file and add a new constant called **JWT_AUTH_CORS_ENABLE**:

`
define('JWT_AUTH_CORS_ENABLE', true);
`

Finally, activate the plugin within your wp-admin.

### Namespace and Endpoints

When the plugin is activated, a new namespace is added:

`
/jwt-auth/v1
`

Also, two new endpoints are added to this namespace:

Endpoint | HTTP Verb
*/wp-json/jwt-auth/v1/token* | POST
*/wp-json/jwt-auth/v1/token/validate* | POST

**Need more functionality?** [JWT Authentication PRO](https://jwtauth.pro/?utm_source=wp_plugin_readme&utm_medium=link&utm_campaign=pro_promotion&utm_content=endpoints_pro_note) includes additional endpoints for token refresh and revocation.

### USAGE

#### /wp-json/jwt-auth/v1/token

This is the entry point for JWT Authentication.

It validates the user credentials, *username* and *password*, and returns a token to use in future requests to the API if the authentication is correct, or an error if authentication fails.

##### Sample Request Using AngularJS

`
(function() {
  var app = angular.module('jwtAuth', []);

  app.controller('MainController', function($scope, $http) {
    var apiHost = 'http://yourdomain.com/wp-json';

    $http.post(apiHost + '/jwt-auth/v1/token', {
      username: 'admin',
      password: 'password'
    })
    .then(function(response) {
      console.log(response.data)
    })
    .catch(function(error) {
      console.error('Error', error.data[0]);
    });
  });
})();
`

##### Success Response From The Server

`
{
  "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOlwvXC9qd3QuZGV2IiwiaWF0IjoxNDM4NTcxMDUwLCJuYmYiOjE0Mzg1NzEwNTAsImV4cCI6MTQzOTE3NTg1MCwiZGF0YSI6eyJ1c2VyIjp7ImlkIjoiMSJ9fX0.YNe6AyWW4B7ZwfFE5wJ0O6qQ8QFcYizimDmBy6hCH_8",
  "user_display_name": "admin",
  "user_email": "admin@localhost.dev",
  "user_nicename": "admin"
}
`

##### Error Response From The Server

`
{
  "code": "jwt_auth_failed",
  "data": {
    "status": 403
  },
  "message": "Invalid Credentials."
}
`

Once you get the token, you must store it somewhere in your application, e.g., in a **cookie** or using **localStorage**.

From this point, you should pass this token with every API call.

##### Sample Call Using The Authorization Header With AngularJS

`
app.config(function($httpProvider) {
  $httpProvider.interceptors.push(['$q', '$location', '$cookies', function($q, $location, $cookies) {
    return {
      'request': function(config) {
        config.headers = config.headers || {};
        // Assume that you store the token in a cookie
        var globals = $cookies.getObject('globals') || {};
        // If the cookie has the CurrentUser and the token
        // add the Authorization header in each request
        if (globals.currentUser && globals.currentUser.token) {
          config.headers.Authorization = 'Bearer ' + globals.currentUser.token;
        }
        return config;
      }
    };
  }]);
});
`

The **wp-api-jwt-auth** plugin will intercept every call to the server and will look for the Authorization Header. If the Authorization header is present, it will try to decode the token and will set the user according to the data stored in it.

If the token is valid, the API call flow will continue as normal.

**Sample Headers**

`
POST /resource HTTP/1.1
Host: server.example.com
Authorization: Bearer mF_s9.B5f-4.1JqM
`

### ERRORS

If the token is invalid, an error will be returned. Here are some sample errors:

**Invalid Credentials**

`
[
  {
    "code": "jwt_auth_failed",
    "message": "Invalid Credentials.",
    "data": {
      "status": 403
    }
  }
]
`

**Invalid Signature**

`
[
  {
    "code": "jwt_auth_invalid_token",
    "message": "Signature verification failed",
    "data": {
      "status": 403
    }
  }
]
`

**Expired Token**

`
[
  {
    "code": "jwt_auth_invalid_token",
    "message": "Expired token",
    "data": {
      "status": 403
    }
  }
]
`

**Need advanced error tracking?** [JWT Authentication PRO](https://jwtauth.pro/?utm_source=wp_plugin_readme&utm_medium=link&utm_campaign=pro_promotion&utm_content=errors_pro_note) offers enhanced error tracking and monitoring capabilities.

#### /wp-json/jwt-auth/v1/token/validate

This is a simple helper endpoint to validate a token. You only need to make a POST request with the Authorization header.

**Valid Token Response**

`
{
  "code": "jwt_auth_valid_token",
  "data": {
    "status": 200
  }
}
`

### AVAILABLE HOOKS

The **wp-api-jwt-auth** plugin is developer-friendly and provides five filters to override the default settings.

#### jwt_auth_cors_allow_headers

The **jwt_auth_cors_allow_headers** filter allows you to modify the available headers when CORS support is enabled.

Default Value:

`
'Access-Control-Allow-Headers, Content-Type, Authorization'
`

#### jwt_auth_not_before

The **jwt_auth_not_before** filter allows you to change the [**nbf**](https://tools.ietf.org/html/rfc7519#section-4.1.5) value before the token is created.

Default Value:

`
Creation time - time()
`

#### jwt_auth_expire

The **jwt_auth_expire** filter allows you to change the [**exp**](https://tools.ietf.org/html/rfc7519#section-4.1.4) value before the token is created.

Default Value:

`
time() + (DAY_IN_SECONDS * 7)
`

#### jwt_auth_token_before_sign

The **jwt_auth_token_before_sign** filter allows you to modify all token data before it is encoded and signed.

Default Value:

`
$token = array(
    'iss' => get_bloginfo('url'),
    'iat' => $issuedAt,
    'nbf' => $notBefore,
    'exp' => $expire,
    'data' => array(
        'user' => array(
            'id' => $user->data->ID,
        )
    )
);
`

**Want easier customization?** [JWT Authentication PRO](https://jwtauth.pro/?utm_source=wp_plugin_readme&utm_medium=link&utm_campaign=pro_promotion&utm_content=hook_payload_pro_note) allows you to add custom claims directly through the admin UI.

#### jwt_auth_token_before_dispatch

The **jwt_auth_token_before_dispatch** filter allows you to modify the response array before it is sent to the client.

Default Value:

`
$data = array(
    'token' => $token,
    'user_email' => $user->data->user_email,
    'user_nicename' => $user->data->user_nicename,
    'user_display_name' => $user->data->display_name,
);
`

#### jwt_auth_algorithm

The **jwt_auth_algorithm** filter allows you to modify the signing algorithm.

Default value:

`
$token = JWT::encode(
    apply_filters('jwt_auth_token_before_sign', $token, $user),
    $secret_key,
    apply_filters('jwt_auth_algorithm', 'HS256')
);

// ...

$token = JWT::decode(
    $token,
    new Key($secret_key, apply_filters('jwt_auth_algorithm', 'HS256'))
);
`

== JWT Authentication PRO ==

Elevate your WordPress security and integration capabilities with **JWT Authentication PRO**. Building upon the solid foundation of the free version, the PRO version offers advanced features, enhanced security options, and a streamlined user experience:

*   **Easy Configuration UI:** Manage all settings directly from the WordPress admin area.
*   **Token Refresh Endpoint:** Allow users to refresh expired tokens seamlessly without requiring re-login.
*   **Token Revocation Endpoint:** Immediately invalidate specific tokens for enhanced security control.
*   **Customizable Token Payload:** Add custom claims to your JWT payload to suit your specific application needs.
*   **Granular CORS Control:** Define allowed origins and headers with more precision directly in the settings.
*   **Rate Limiting:** Protect your endpoints from abuse with configurable rate limits.
*   **Audit Logs:** Keep track of token generation, validation, and errors.
*   **Priority Support:** Get faster, dedicated support directly from the developer.

**[Upgrade to JWT Authentication PRO Today!](https://jwtauth.pro/?utm_source=wp_plugin_readme&utm_medium=link&utm_campaign=pro_promotion&utm_content=pro_section_cta)**

### Free vs. PRO Comparison

Here's a quick look at the key differences:

*   **Basic JWT Authentication:** Included (Free), Included (PRO)
*   **Token Generation:** Included (Free), Included (PRO)
*   **Token Validation:** Included (Free), Included (PRO)
*   **Token Refresh Mechanism:** Not Included (Free), Included (PRO)
*   **Token Revocation:** Not Included (Free), Included (PRO)
*   **Token Management Dashboard:** Not Included (Free), Included (PRO)
*   **Analytics & Monitoring:** Not Included (Free), Included (PRO)
*   **Geo-IP Identification:** Not Included (Free), Included (PRO)
*   **Rate Limiting:** Not Included (Free), Included (PRO)
*   **Detailed Documentation:** Basic (Free), Comprehensive (PRO)
*   **Developer Tools:** Not Included (Free), Included (PRO)
*   **Premium Support:** Community via GitHub (Free), Priority Direct Support (PRO)

## Installation

### Using The WordPress Dashboard

1. Navigate to the 'Add New' in the plugins dashboard
2. Search for 'jwt-authentication-for-wp-rest-api'
3. Click 'Install Now'
4. Activate the plugin on the Plugin dashboard

### Uploading in WordPress Dashboard

1. Navigate to the 'Add New' in the plugins dashboard
2. Navigate to the 'Upload' area
3. Select `jwt-authentication-for-wp-rest-api.zip` from your computer
4. Click 'Install Now'
5. Activate the plugin in the Plugin dashboard

Please read our [configuration guide](https://wordpress.org/plugins/jwt-authentication-for-wp-rest-api/) to set up the plugin properly.

== Frequently Asked Questions ==

= Does this plugin support algorithms other than HS256? =
The free version only supports HS256. For support for RS256, ES256, and other algorithms, please consider [JWT Authentication PRO](https://jwtauth.pro/?utm_source=wp_plugin_readme&utm_medium=link&utm_campaign=pro_promotion&utm_content=faq_algorithms_link).

= Can I manage settings without editing wp-config.php? =
The free version requires editing `wp-config.php`. [JWT Authentication PRO](https://jwtauth.pro/?utm_source=wp_plugin_readme&utm_medium=link&utm_campaign=pro_promotion&utm_content=faq_config_link) provides a full settings UI within the WordPress admin.

= Is there a way to refresh or revoke tokens? =
Token refresh and revocation features are available in [JWT Authentication PRO](https://jwtauth.pro/?utm_source=wp_plugin_readme&utm_medium=link&utm_campaign=pro_promotion&utm_content=faq_refresh_revoke_link).

= Where can I get faster support? =
Priority support is included with [JWT Authentication PRO](https://jwtauth.pro/?utm_source=wp_plugin_readme&utm_medium=link&utm_campaign=pro_promotion&utm_content=faq_support_link). For free support, please use the [GitHub issues tracker](https://github.com/Tmeister/wp-api-jwt-auth/issues).

= How secure is JWT authentication? =
JWT authentication is very secure when implemented correctly. Make sure to use a strong secret key and keep it confidential. [JWT Auth PRO](https://jwtauth.pro/?utm_source=wp_plugin_readme&utm_medium=link&utm_campaign=pro_promotion&utm_content=faq_security_link) offers additional security features like rate limiting and token revocation.

== Changelog ==
= 1.4.1 =
* Enhancement: Updated lucide-react from 0.294.0 to 0.541.0 - Latest icon library improvements with new icons and performance optimizations
* Enhancement: Updated tailwind-merge from 2.6.0 to 3.3.1 - Enhanced CSS utility merging capabilities for better styling performance
* Enhancement: Updated react-syntax-highlighter from 15.6.1 to 15.6.3 - Bug fixes for code display components
* Development: Updated ESLint to version 9.34.0 - Latest JavaScript linting capabilities
* Development: Updated TypeScript ESLint to version 8.40.0 - Improved TypeScript code quality checks
* Development: Updated Vite to version 7.1.3 - Faster build times and improved development experience
* Development: Updated Vitest to version 3.2.4 - Enhanced testing framework with better coverage reporting
* Development: Added @usebruno/cli version 2.9.1 - API testing capabilities for development

= 1.4.0 =
* Feature: Live API Explorer - Interactive tool to test JWT endpoints directly from admin dashboard with real API calls
* Feature: Enhanced Configuration Dashboard - Real-time monitoring of system health and setup requirements
* Feature: Modern Admin Interface - Complete redesign with React-based components for improved usability
* Performance: Optimized dashboard loading by consolidating API calls into single endpoint
* Performance: Faster configuration checks with streamlined status validation
* Enhancement: Improved visual design with better text clarity and professional styling
* Enhancement: Modular interface with organized dashboard sections for easier navigation

= 1.3.8 =
* Fix upsell notice bug, now it is show only one time

= 1.3.7 =
* Added PRO announcement

= 1.3.6 =
* Added Safeguard in enqueue_plugin_assets to Handle Null or Empty $suffix

= 1.3.5 =
* Notice: Add JWT Authentication Pro beta announcement notice.

= 1.3.4 =
* Fix: Skip any type of validation when the authorization header is not Bearer.
* Feature: Added a setting page to share data and add information about the plugin.

= 1.3.3 =
* Update php-jwt to 6.4.0
* Fix php warnings (https://github.com/Tmeister/wp-api-jwt-auth/pull/259)
* Fix the condition where it checks if the request is a REST Request (https://github.com/Tmeister/wp-api-jwt-auth/pull/256)

= 1.3.2 =
* Fix conflicts with other plugins using the same JWT library adding a wrapper namespace to the JWT class.

= 1.3.1 =
* Updating the minimum version of PHP to 7.4
* Validate the signing algorithm against the supported algorithms @see https://www.rfc-editor.org/rfc/rfc7518#section-3
* Sanitize the REQUEST_URI and HTTP_AUTHORIZATION values before to use them
* Use get_header() instead of $_SERVER to get the Authorization header when possible
* Added typed properties to the JWT_Auth class where possible
* Along with this release, I release a new simple JWT Client App for testing purposes @see https://github.com/Tmeister/jwt-client

= 1.3.0 =
* Update firebase/php-jwt to 6.3
* Fix warning, register_rest_route was called incorrectly
* Allow for Basic Auth, by not attempting to validate Authentication Headers if a valid user has already been determined (see: https://github.com/Tmeister/wp-api-jwt-auth/issues/241)
* Added a new filter (jwt_auth_algorithm) to allow for customizing the algorithm used for signing the token
* Props: https://github.com/bradmkjr

= 1.2.6 =
* Cookies && Token compatibility
* Fix the root problem with gutenberg infinite loops and allow the token validation/generation if the WP cookie exists.
* More info (https://github.com/Tmeister/wp-api-jwt-auth/pull/138)
* Props: https://github.com/andrzejpiotrowski


= 1.2.5 =
* Add Gutenberg Compatibility
* More info (https://github.com/Tmeister/wp-api-jwt-auth/issues/126)

= 1.2.4 =
* Update firebase/php-jwt to v5.0.0 ( https://github.com/firebase/php-jwt )
* Add Requires PHP Tag

= 1.2.3 =
* Fix Max recursion error in WordPress 4.7 #44

= 1.2.2 =
* Add an extra validation to get the Authorization header
* Increase determine_current_user priority Fix #13
* Add the user object as parameter in the jwt_auth_token_before_sign hook
* Improve error message when auth fails #34
* Tested with 4.6.1

= 1.2.0 =
* Tested with 4.4.2

= 1.0.0 =
* Initial Release.

== Upgrade Notice ==
