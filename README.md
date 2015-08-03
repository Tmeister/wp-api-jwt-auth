# JWT Authentication for the JSON-REST-API

A simple plugin to add JSON Web Token (JWT) Authentication to the json-resp-api.

To know more about the JSON Web Tokens please visit [http://jwt.io](http://jwt.io).

## Requirements

This plugin was conceived to extend the [JSON-REST-API V2](https://github.com/WP-API/WP-API) plugin features and, of course, was built on top of it.

So, in order to use the **wp-api-jwt-auth** you need to install and activate [JSON-REST-API](https://github.com/WP-API/WP-API).



## Installation & Configuration

[Download the zip file](https://github.com/Tmeister/wp-api-jwt-auth/archive/master.zip) and install it as any other WordPress plugin.

Or clone this repo into your WordPress installation under the wp-content/plugins folder.

### Configurate the Secret Key

The JWT need a **secret key** to sign the token this **secret key** must be unique and never revealed.

To add the **secret key** edit your wp-config.php file and add a new constant called **JWT_AUTH_SECRET_KEY**


```php
define('JWT_AUTH_SECRET_KEY', 'your-top-secrect-key');
```

You can use a string from here https://api.wordpress.org/secret-key/1.1/salt/

### Configurate CORs Support

The **wp-api-jwt-auth** plugin has the option to activate [CORs](https://en.wikipedia.org/wiki/Cross-origin_resource_sharing) support.

To enable the CORs Support edit your wp-config.php file and add a new constant called **JWT_AUTH_CORS_ENABLE**


```php
define('JWT_AUTH_CORS_ENABLE', true);
```


Finally activate the plugin within your wp-admin.

## Usage

When the plugin is activated a new namespace is added


```
/jwt-auth/v1
```


Also, two new endpoints are added under this namespace


Endpoint | HTTP Verb
--- | ---
*/wp-json/jwt-auth/v1/token* | POST
*/wp-json/jwt-auth/v1/token/validate* | POST

### /wp-json/jwt-auth/v1/token

This is the entry point for the JWT Authentication.

Validates the user credentials, *username* and *password* and returns a token to use in a future request to the API.

####Sample request using jQuery

```javascript
$( function() {
    $.ajax( {
        url: '/wp-json/jwt-auth/v1/token',
        type: 'POST',
        dataType: 'json',
        data: {
            username: 'admin',
            password: 'password'
        }
    } )
    .done( function( data ) {
        console.log( data );
    } )
    .error( function(data) {
        console.log( data.responseJSON[0] );
    } );
} );

```

Success response from the server

```json
{
    token: "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOlwvXC9qd3QuZGV2IiwiaWF0IjoxNDM4NTcxMDUwLCJuYmYiOjE0Mzg1NzEwNTAsImV4cCI6MTQzOTE3NTg1MCwiZGF0YSI6eyJ1c2VyIjp7ImlkIjoiMSJ9fX0.YNe6AyWW4B7ZwfFE5wJ0O6qQ8QFcYizimDmBy6hCH_8",
    user_display_name: "admin",
    user_email: "admin@localhost.dev",
    user_login: "admin",
    user_nicename: "admin"
}
```

Error response from the server

```json
{
    code: "jwt_auth_failed",
    data: {
        status: 403
    },
    message: "Invalid Credentials."
}
```
