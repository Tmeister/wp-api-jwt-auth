=== JWT Authentication for WP REST API ===

Contributors: tmeister
Donate link: https://enriquechavez.co
Tags: wp-json, jwt, json web authentication, wp-api
Requires at least: 4.2
Tested up to: 4.4.2
Stable tag: 1.2.0
License: GPLv2 or later
License URI: http://www.gnu.org/licenses/gpl-2.0.html

Extends the WP REST API using JSON Web Tokens Authentication as an authentication method.

== Description ==

Extends the WP REST API using JSON Web Tokens Authentication as an authentication method.

JSON Web Tokens are an open, industry standard [RFC 7519](https://tools.ietf.org/html/rfc7519) method for representing claims securely between two parties.

**Support and Requests please in Github:** https://github.com/Tmeister/wp-api-jwt-auth

### REQUIREMENTS

#### WP REST API V2

This plugin was conceived to extend the [WP REST API V2](https://github.com/WP-API/WP-API) plugin features and, of course, was built on top of it.

So, to use the **wp-api-jwt-auth** you need to install and activate [WP REST API](https://github.com/WP-API/WP-API).

### PHP

**Minimum PHP version: 5.3.0**

### PHP HTTP Authorization Header enable

Most of the shared hosting has disabled the **HTTP Authorization Header** by default.

To enable this option you'll need to edit your **.htaccess** file adding the follow

`
RewriteEngine on
RewriteCond %{HTTP:Authorization} ^(.*)
RewriteRule ^(.*) - [E=HTTP_AUTHORIZATION:%1]
`

#### WPENGINE

To enable this option you'll need to edit your **.htaccess** file adding the follow

See https://github.com/Tmeister/wp-api-jwt-auth/issues/1

`
SetEnvIf Authorization "(.*)" HTTP_AUTHORIZATION=$1
`

### CONFIGURATION
### Configurate the Secret Key

The JWT needs a **secret key** to sign the token this **secret key** must be unique and never revealed.

To add the **secret key** edit your wp-config.php file and add a new constant called **JWT_AUTH_SECRET_KEY**

`
define('JWT_AUTH_SECRET_KEY', 'your-top-secrect-key');
`

You can use a string from here https://api.wordpress.org/secret-key/1.1/salt/

### Configurate CORs Support

The **wp-api-jwt-auth** plugin has the option to activate [CORs](https://en.wikipedia.org/wiki/Cross-origin_resource_sharing) support.

To enable the CORs Support edit your wp-config.php file and add a new constant called **JWT_AUTH_CORS_ENABLE**

`
define('JWT_AUTH_CORS_ENABLE', true);
`

Finally activate the plugin within your wp-admin.

### Namespace and Endpoints

When the plugin is activated, a new namespace is added

`
/jwt-auth/v1
`

Also, two new endpoints are added to this namespace

Endpoint | HTTP Verb
*/wp-json/jwt-auth/v1/token* | POST
*/wp-json/jwt-auth/v1/token/validate* | POST

###USAGE
### /wp-json/jwt-auth/v1/token

This is the entry point for the JWT Authentication.

Validates the user credentials, *username* and *password*, and returns a token to use in a future request to the API if the authentication is correct or error if the authentication fails.

####Sample request using AngularJS

    ( function() {

      var app = angular.module( 'jwtAuth', [] );

      app.controller( 'MainController', function( $scope, $http ) {

        var apiHost = 'http://yourdomain.com/wp-json';

        $http.post( apiHost + '/jwt-auth/v1/token', {
            username: 'admin',
            password: 'password'
          } )

          .then( function( response ) {
            console.log( response.data )
          } )

          .catch( function( error ) {
            console.error( 'Error', error.data[0] );
          } );

      } );

    } )();



Success response from the server

`
{
    "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOlwvXC9qd3QuZGV2IiwiaWF0IjoxNDM4NTcxMDUwLCJuYmYiOjE0Mzg1NzEwNTAsImV4cCI6MTQzOTE3NTg1MCwiZGF0YSI6eyJ1c2VyIjp7ImlkIjoiMSJ9fX0.YNe6AyWW4B7ZwfFE5wJ0O6qQ8QFcYizimDmBy6hCH_8",
    "user_display_name": "admin",
    "user_email": "admin@localhost.dev",
    "user_nicename": "admin"
}
`

Error response from the server

`
{
    "code": "jwt_auth_failed",
    "data": {
        "status": 403
    },
    "message": "Invalid Credentials."
}
`

Once you get the token, you must store it somewhere in your application, ex. in a **cookie** or using **localstorage**.

From this point, you should pass this token to every API call

Sample call using the Authorization header using AngularJS

`
app.config( function( $httpProvider ) {
  $httpProvider.interceptors.push( [ '$q', '$location', '$cookies', function( $q, $location, $cookies ) {
    return {
      'request': function( config ) {
        config.headers = config.headers || {};
        //Assume that you store the token in a cookie.
        var globals = $cookies.getObject( 'globals' ) || {};
        //If the cookie has the CurrentUser and the token
        //add the Authorization header in each request
        if ( globals.currentUser && globals.currentUser.token ) {
          config.headers.Authorization = 'Bearer ' + globals.currentUser.token;
        }
        return config;
      }
    };
  } ] );
} );
`

The **wp-api-jwt-auth** will intercept every call to the server and will look for the Authorization Header, if the Authorization header is present will try to decode the token and will set the user according with the data stored in it.

If the token is valid, the API call flow will continue as always.

**Sample Headers**

`
POST /resource HTTP/1.1
Host: server.example.com
Authorization: Bearer mF_s9.B5f-4.1JqM
`

###ERRORS

If the token is invalid an error will be returned, here are some samples of errors.

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

### /wp-json/jwt-auth/v1/token/validate

This is a simple helper endpoint to validate a token; you only will need to make a POST request sending the Authorization header.

Valid Token Response

`
{
  "code": "jwt_auth_valid_token",
  "data": {
    "status": 200
  }
}
`

###AVAILABLE HOOKS

The **wp-api-jwt-auth** is dev friendly and has five filters available to override the default settings.

####jwt_auth_cors_allow_headers

The **jwt_auth_cors_allow_headers** allows you to modify the available headers when the CORs support is enabled.

Default Value:

`
'Access-Control-Allow-Headers, Content-Type, Authorization'
`

###jwt_auth_not_before

The **jwt_auth_not_before** allows you to change the [**nbf**](https://tools.ietf.org/html/rfc7519#section-4.1.5) value before the token is created.

Default Value:

`
Creation time - time()
`

###jwt_auth_expire

The **jwt_auth_expire** allows you to change the value [**exp**](https://tools.ietf.org/html/rfc7519#section-4.1.4) before the token is created.

Default Value:

`
time() + (DAY_IN_SECONDS * 7)
`

###jwt_auth_token_before_sign

The **jwt_auth_token_before_sign** allows you to modify all the token data before to be encoded and signed.

Default Value

`
<?php
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

###jwt_auth_token_before_dispatch
The **jwt_auth_token_before_dispatch** allows you to modify all the response array before to dispatch it to the client.

Default Value:

`
<?php
$data = array(
    'token' => $token,
    'user_email' => $user->data->user_email,
    'user_nicename' => $user->data->user_nicename,
    'user_display_name' => $user->data->display_name,
);
`

==Installation==

= Using The WordPress Dashboard =

1. Navigate to the 'Add New' in the plugins dashboard
2. Search for 'jwt-authentication-for-wp-rest-api'
3. Click 'Install Now'
4. Activate the plugin on the Plugin dashboard

= Uploading in WordPress Dashboard =

1. Navigate to the 'Add New' in the plugins dashboard
2. Navigate to the 'Upload' area
3. Select `jwt-authentication-for-wp-rest-api.zip` from your computer
4. Click 'Install Now'
5. Activate the plugin in the Plugin dashboard

###Please read how to configured the plugin https://wordpress.org/plugins/jwt-authentication-for-wp-rest-api/

== Changelog ==
= 1.2.0 =
* Tested with 4.4.2

= 1.0.0 =
* Initial Release.



== Upgrade Notice ==
.
