# JWT Authentication for the WP REST API

A simple plugin to add [JSON Web Token (JWT)](https://tools.ietf.org/html/rfc7519) Authentication to the WP REST API.

To know more about JSON Web Tokens, please visit [http://jwt.io](http://jwt.io).

## Description

This plugin seamlessly extends the WP REST API, enabling robust and secure authentication using JSON Web Tokens (JWT). It provides a straightforward way to authenticate users via the REST API, returning a standard JWT upon successful login.

### Key features of this free version include:

* **Standard JWT Authentication:** Implements the industry-standard [RFC 7519](https://tools.ietf.org/html/rfc7519) for secure claims representation.
* **Simple Endpoints:** Offers clear `/token` and `/token/validate` endpoints for generating and validating tokens.
* **Configurable Secret Key:** Define your unique secret key via `wp-config.php` for secure token signing.
* **Optional CORS Support:** Easily enable Cross-Origin Resource Sharing support via a `wp-config.php` constant.
* **Developer Hooks:** Provides filters (`jwt_auth_expire`, `jwt_auth_token_before_sign`, etc.) for customizing token behavior.

For users requiring more advanced capabilities such as multiple signing algorithms (RS256, ES256), token refresh/revocation, UI-based configuration, or priority support, consider checking out **[JWT Authentication PRO](https://jwtauth.pro/?utm_source=github_readme&utm_medium=link&utm_campaign=pro_promotion&utm_content=description_link)**.

**Support and Requests:** Please use [GitHub Issues](https://github.com/Tmeister/wp-api-jwt-auth/issues). For priority support, consider upgrading to [PRO](https://jwtauth.pro/support/?utm_source=github_readme&utm_medium=link&utm_campaign=pro_promotion&utm_content=description_support_link).

## JWT Authentication PRO

Elevate your WordPress security and integration capabilities with **JWT Authentication PRO**. Building upon the solid foundation of the free version, the PRO version offers advanced features, enhanced security options, and a streamlined user experience:

* **Easy Configuration UI:** Manage all settings directly from the WordPress admin area.
* **Token Refresh Endpoint:** Allow users to refresh expired tokens seamlessly without requiring re-login.
* **Token Revocation Endpoint:** Immediately invalidate specific tokens for enhanced security control.
* **Customizable Token Payload:** Add custom claims to your JWT payload to suit your specific application needs.
* **Granular CORS Control:** Define allowed origins and headers with more precision directly in the settings.
* **Rate Limiting:** Protect your endpoints from abuse with configurable rate limits.
* **Audit Logs:** Keep track of token generation, validation, and errors.
* **Priority Support:** Get faster, dedicated support directly from the developer.

**[Upgrade to JWT Authentication PRO Today!](https://jwtauth.pro/?utm_source=github_readme&utm_medium=link&utm_campaign=pro_promotion&utm_content=pro_section_cta)**

### Free vs. PRO Comparison

Here's a quick look at the key differences:

| Feature | Free Version | JWT Auth Pro (starts at $59/yr) |
|---------|-------------|--------------------------|
| Basic JWT Authentication | ✅ Included | ✅ Included |
| Token Generation | ✅ Included | ✅ Included |
| Token Validation | ✅ Included | ✅ Included |
| Token Refresh Mechanism | ❌ Not Included | ✅ Included |
| Token Revocation | ❌ Not Included | ✅ Included |
| Token Management Dashboard | ❌ Not Included | ✅ Included |
| Analytics & Monitoring | ❌ Not Included | ✅ Included |
| Geo-IP Identification | ❌ Not Included | ✅ Included |
| Rate Limiting | ❌ Not Included | ✅ Included |
| Detailed Documentation | Basic | Comprehensive |
| Developer Tools | ❌ Not Included | ✅ Included |
| Premium Support | Community via GitHub | Priority Direct Support |

## Requirements

### WP REST API V2

This plugin was conceived to extend the [WP REST API V2](https://github.com/WP-API/WP-API) plugin features and, of course, was built on top of it.

So, to use the **wp-api-jwt-auth** you need to install and activate [WP REST API](https://github.com/WP-API/WP-API).

### PHP

**Minimum PHP version: 7.4.0**

### Enable PHP HTTP Authorization Header

#### Shared Hosts

Most shared hosting providers have disabled the **HTTP Authorization Header** by default.

To enable this option you'll need to edit your **.htaccess** file by adding the following:

```apache
RewriteEngine on
RewriteCond %{HTTP:Authorization} ^(.*)
RewriteRule ^(.*) - [E=HTTP_AUTHORIZATION:%1]
```

#### WPEngine

For WPEngine hosting, you'll need to edit your **.htaccess** file by adding the following:

```apache
SetEnvIf Authorization "(.*)" HTTP_AUTHORIZATION=$1
```

See https://github.com/Tmeister/wp-api-jwt-auth/issues/1 for more details.

## Installation & Configuration

[Download the zip file](https://github.com/Tmeister/wp-api-jwt-auth/archive/master.zip) and install it like any other WordPress plugin.

Or clone this repo into your WordPress installation into the wp-content/plugins folder.

### Configure the Secret Key

The JWT needs a **secret key** to sign the token. This **secret key** must be unique and never revealed.

To add the **secret key**, edit your wp-config.php file and add a new constant called **JWT_AUTH_SECRET_KEY**:

```php
define('JWT_AUTH_SECRET_KEY', 'your-top-secret-key');
```

You can generate a secure key from: https://api.wordpress.org/secret-key/1.1/salt/

**Looking for easier configuration?** [JWT Authentication PRO](https://jwtauth.pro/?utm_source=github_readme&utm_medium=link&utm_campaign=pro_promotion&utm_content=config_secret_key_link) allows you to manage all settings through a simple admin UI.

### Configure CORS Support

The **wp-api-jwt-auth** plugin has the option to activate [CORS](https://en.wikipedia.org/wiki/Cross-origin_resource_sharing) support.

To enable CORS Support, edit your wp-config.php file and add a new constant called **JWT_AUTH_CORS_ENABLE**:

```php
define('JWT_AUTH_CORS_ENABLE', true);
```

Finally, activate the plugin within your wp-admin.

## Namespace and Endpoints

When the plugin is activated, a new namespace is added:

```
/jwt-auth/v1
```

Also, two new endpoints are added to this namespace:

| Endpoint | HTTP Verb |
|----------|-----------|
| */wp-json/jwt-auth/v1/token* | POST |
| */wp-json/jwt-auth/v1/token/validate* | POST |

**Need more functionality?** [JWT Authentication PRO](https://jwtauth.pro/?utm_source=github_readme&utm_medium=link&utm_campaign=pro_promotion&utm_content=endpoints_pro_note) includes additional endpoints for token refresh and revocation.

## Usage
### /wp-json/jwt-auth/v1/token

This is the entry point for JWT Authentication.

It validates the user credentials, *username* and *password*, and returns a token to use in future requests to the API if the authentication is correct, or an error if authentication fails.

#### Sample Request Using AngularJS

```javascript
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

Once you get the token, you must store it somewhere in your application, e.g. in a **cookie** or using **localStorage**.

From this point, you should pass this token with every API call.

#### Sample Call Using The Authorization Header With AngularJS

```javascript
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
```

The **wp-api-jwt-auth** plugin will intercept every call to the server and will look for the Authorization Header. If the Authorization header is present, it will try to decode the token and will set the user according to the data stored in it.

If the token is valid, the API call flow will continue as normal.

**Sample Headers**

```http
POST /resource HTTP/1.1
Host: server.example.com
Authorization: Bearer mF_s9.B5f-4.1JqM
```

## Errors

If the token is invalid, an error will be returned. Here are some sample errors:

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

**Need advanced error tracking?** [JWT Authentication PRO](https://jwtauth.pro/?utm_source=github_readme&utm_medium=link&utm_campaign=pro_promotion&utm_content=errors_pro_note) offers enhanced error tracking and monitoring capabilities.

### /wp-json/jwt-auth/v1/token/validate

This is a simple helper endpoint to validate a token. You only need to make a POST request with the Authorization header.

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

The **wp-api-jwt-auth** plugin is developer-friendly and provides five filters to override the default settings.

### jwt_auth_cors_allow_headers

The **jwt_auth_cors_allow_headers** filter allows you to modify the available headers when CORS support is enabled.

Default Value:

```
'Access-Control-Allow-Headers, Content-Type, Authorization'
```

### jwt_auth_not_before

The **jwt_auth_not_before** filter allows you to change the [**nbf**](https://tools.ietf.org/html/rfc7519#section-4.1.5) value before the token is created.

Default Value:

```
Creation time - time()
```

### jwt_auth_expire

The **jwt_auth_expire** filter allows you to change the [**exp**](https://tools.ietf.org/html/rfc7519#section-4.1.4) value before the token is created.

Default Value:

```
time() + (DAY_IN_SECONDS * 7)
```

### jwt_auth_token_before_sign

The **jwt_auth_token_before_sign** filter allows you to modify all token data before it is encoded and signed.

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

**Want easier customization?** [JWT Authentication PRO](https://jwtauth.pro/?utm_source=github_readme&utm_medium=link&utm_campaign=pro_promotion&utm_content=hook_payload_pro_note) allows you to add custom claims directly through the admin UI.

### jwt_auth_token_before_dispatch

The **jwt_auth_token_before_dispatch** filter allows you to modify the response array before it is sent to the client.

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

### jwt_auth_algorithm

The **jwt_auth_algorithm** filter allows you to modify the signing algorithm.

Default value:

```php
<?php
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
```

**Need more advanced algorithms?** [JWT Authentication PRO](https://jwtauth.pro/?utm_source=github_readme&utm_medium=link&utm_campaign=pro_promotion&utm_content=algorithm_hook_link) supports multiple signing algorithms (RS256, ES256) that you can easily configure through the UI.

## Frequently Asked Questions

### Does this plugin support algorithms other than HS256?
The free version only supports HS256. For support for RS256, ES256, and other algorithms, please consider [JWT Authentication PRO](https://jwtauth.pro/?utm_source=github_readme&utm_medium=link&utm_campaign=pro_promotion&utm_content=faq_algorithms_link).

### Can I manage settings without editing wp-config.php?
The free version requires editing `wp-config.php`. [JWT Authentication PRO](https://jwtauth.pro/?utm_source=github_readme&utm_medium=link&utm_campaign=pro_promotion&utm_content=faq_config_link) provides a full settings UI within the WordPress admin.

### Is there a way to refresh or revoke tokens?
Token refresh and revocation features are available in [JWT Authentication PRO](https://jwtauth.pro/?utm_source=github_readme&utm_medium=link&utm_campaign=pro_promotion&utm_content=faq_refresh_revoke_link).

### Where can I get faster support?
Priority support is included with [JWT Authentication PRO](https://jwtauth.pro/support/?utm_source=github_readme&utm_medium=link&utm_campaign=pro_promotion&utm_content=faq_support_link). For free support, please use the [GitHub issues tracker](https://github.com/Tmeister/wp-api-jwt-auth/issues).

### How secure is JWT authentication?
JWT authentication is very secure when implemented correctly. Make sure to use a strong secret key and keep it confidential. [JWT Auth PRO](https://jwtauth.pro/?utm_source=github_readme&utm_medium=link&utm_campaign=pro_promotion&utm_content=faq_security_link) offers additional security features like rate limiting and token revocation.

## Testing
I've created a small app to test the basic functionality of the plugin. You can get the app and read all the details in the [JWT-Client Repo](https://github.com/Tmeister/jwt-client).

## Credits
[WP REST API V2](http://v2.wp-api.org/)

[PHP-JWT from firebase](https://github.com/firebase/php-jwt)

## License
[GPLv2](http://www.gnu.org/licenses/old-licenses/gpl-2.0.html)

---
Want to enhance your JWT authentication with advanced features like token refresh, revocation, UI-based configuration, multiple algorithms, and more? Check out [JWT Authentication PRO](https://jwtauth.pro/?utm_source=github_readme&utm_medium=link&utm_campaign=pro_promotion&utm_content=footer_cta)!
