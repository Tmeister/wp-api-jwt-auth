# JWT Authentication for the WP REST API

A simple plugin to add [JSON Web Token (JWT)](https://tools.ietf.org/html/rfc7519) Authentication to the WP REST API.

To know more about JSON Web Tokens, please visit [http://jwt.io](http://jwt.io).

## Requirements

### WP REST API V2

This plugin was conceived to extend the [WP REST API V2](https://github.com/WP-API/WP-API) plugin features and, of course, was built on top of it.

So, to use the **wp-api-jwt-auth** you need to install and activate [WP REST API](https://github.com/WP-API/WP-API).

### PHP

**Minimum PHP version: 5.3.0**

### Enable PHP HTTP Authorization Header

#### Shared Hosts

Most shared hosts have disabled the **HTTP Authorization Header** by default.

To enable this option you'll need to edit your **.htaccess** file by adding the following:

```
RewriteEngine on
RewriteCond %{HTTP:Authorization} ^(.*)
RewriteRule ^(.*) - [E=HTTP_AUTHORIZATION:%1]
```

#### WPEngine

To enable this option you'll need to edit your **.htaccess** file by adding the following (see https://github.com/Tmeister/wp-api-jwt-auth/issues/1):

```
SetEnvIf Authorization "(.*)" HTTP_AUTHORIZATION=$1
```

## Installation & Configuration

[Download the zip file](https://github.com/Tmeister/wp-api-jwt-auth/archive/master.zip) and install it like any other WordPress plugin.

Or clone this repo into your WordPress installation into the wp-content/plugins folder.

### Configurate the Secret Key

The JWT needs a **secret key** to sign the token. This **secret key** must be unique and never revealed.

To add the **secret key**, edit your wp-config.php file and add a new constant called **JWT_AUTH_SECRET_KEY**.


```php
define('JWT_AUTH_SECRET_KEY', 'your-top-secret-key');
```

You can use a string from here https://api.wordpress.org/secret-key/1.1/salt/

### Configurate CORs Support

The **wp-api-jwt-auth** plugin has the option to activate [CORs](https://en.wikipedia.org/wiki/Cross-origin_resource_sharing) support.

To enable the CORs Support edit your wp-config.php file and add a new constant called **JWT_AUTH_CORS_ENABLE**


```php
define('JWT_AUTH_CORS_ENABLE', true);
```


Finally activate the plugin within the plugin dashboard.

## Namespace and Endpoints

When the plugin is activated, a new namespace is added.


```
/jwt-auth/v1
```


Also, two new endpoints are added to this namespace.


| Endpoint                              | HTTP Verb |
| ------------------------------------- | --------- |
| */wp-json/jwt-auth/v1/token*          | POST      |
| */wp-json/jwt-auth/v1/token/validate* | POST      |

## Usage
### /wp-json/jwt-auth/v1/token

This is the entry point for the JWT Authentication.

Validates the user credentials, *username* and *password*, and returns a token to use in a future request to the API if the authentication is correct or error if the authentication fails.

#### Sample request using AngularJS

```javascript

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


```

Success response from the server:

```json
{
    "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOlwvXC9qd3QuZGV2IiwiaWF0IjoxNDM4NTcxMDUwLCJuYmYiOjE0Mzg1NzEwNTAsImV4cCI6MTQzOTE3NTg1MCwiZGF0YSI6eyJ1c2VyIjp7ImlkIjoiMSJ9fX0.YNe6AyWW4B7ZwfFE5wJ0O6qQ8QFcYizimDmBy6hCH_8",
    "user_display_name": "admin",
    "user_email": "admin@localhost.dev",
    "user_nicename": "admin"
}
```

Error response from the server:

```json
{
    "code": "jwt_auth_failed",
    "data": {
        "status": 403
    },
    "message": "Invalid Credentials."
}
```

Once you get the token, you must store it somewhere in your application, e.g. in a **cookie** or using **localstorage**.

From this point, you should pass this token to every API call.

Sample call using the Authorization header using AngularJS:

```javascript
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
```

The **wp-api-jwt-auth** will intercept every call to the server and will look for the authorization header, if the authorization header is present, it will try to decode the token and will set the user according with the data stored in it.

If the token is valid, the API call flow will continue as always.

**Sample Headers**

```
POST /resource HTTP/1.1
Host: server.example.com
Authorization: Bearer mF_s9.B5f-4.1JqM
```

### Errors

If the token is invalid an error will be returned. Here are some samples of errors:

**Invalid Credentials**

```json
[
  {
    "code": "jwt_auth_failed",
    "message": "Invalid Credentials.",
    "data": {
      "status": 403
    }
  }
]
```

**Invalid Signature**

```json
[
  {
    "code": "jwt_auth_invalid_token",
    "message": "Signature verification failed",
    "data": {
      "status": 403
    }
  }
]
```

**Expired Token**

```json
[
  {
    "code": "jwt_auth_invalid_token",
    "message": "Expired token",
    "data": {
      "status": 403
    }
  }
]
```

### /wp-json/jwt-auth/v1/token/validate

This is a simple helper endpoint to validate a token; you only will need to make a POST request sending the Authorization header.

Valid Token Response:

```json
{
  "code": "jwt_auth_valid_token",
  "data": {
    "status": 200
  }
}
```

## Available Hooks

The **wp-api-jwt-auth** is dev friendly and has five filters available to override the default settings.

#### jwt_auth_cors_allow_headers

The **jwt_auth_cors_allow_headers** allows you to modify the available headers when the CORs support is enabled.

Default Value:

```
'Access-Control-Allow-Headers, Content-Type, Authorization'
```

### jwt_auth_not_before

The **jwt_auth_not_before** allows you to change the [**nbf**](https://tools.ietf.org/html/rfc7519#section-4.1.5) value before the token is created.

Default Value:

```
Creation time - time()
```

### jwt_auth_expire

The **jwt_auth_expire** allows you to change the value [**exp**](https://tools.ietf.org/html/rfc7519#section-4.1.4) before the token is created.

Default Value:

```
time() + (DAY_IN_SECONDS * 7)
```

### jwt_auth_token_before_sign

The **jwt_auth_token_before_sign** allows you to modify all the token data before to be encoded and signed.

Default value:

```php
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
```

### jwt_auth_token_before_dispatch
The **jwt_auth_token_before_dispatch** allows you to modify all the response array before to dispatch it to the client.

Default value:

```php
<?php
$data = array(
    'token' => $token,
    'user_email' => $user->data->user_email,
    'user_nicename' => $user->data->user_nicename,
    'user_display_name' => $user->data->display_name,
);
```

## Testing

Since version **1.1.0** I've added a new test suite to be sure that the basic features of this plugin do what it's expected.

You can run this test using the following command

```
composer install
includes/vendor/bin/phpunit tests
```

![Command Line Output](https://s3.amazonaws.com/f.cl.ly/items/2o0j0a403A0N1a0r1C3H/Image%202016-02-27%20at%208.16.48%20PM.png?v=5fe1c76e)

All the tests can be found at https://github.com/Tmeister/wp-api-jwt-auth/tree/develop/tests/GeneralTest.php

##Credits
[WP REST API V2](http://v2.wp-api.org/)

[PHP-JWT from firebase](https://github.com/firebase/php-jwt)

##License
[GPLv2](http://www.gnu.org/licenses/old-licenses/gpl-2.0.html)
