# TestDummy [![Build Status](https://travis-ci.org/laracasts/TestDummy.svg?branch=master)](https://travis-ci.org/laracasts/TestDummy) [![SensioLabsInsight](https://insight.sensiolabs.com/projects/10d5bafd-bc3a-44c3-9449-c0a18c6d2975/mini.png)](https://insight.sensiolabs.com/projects/10d5bafd-bc3a-44c3-9449-c0a18c6d2975)


TestDummy makes the process of preparing factories (dummy data) for your integration tests as easy as possible. As easy as...

### Build a Post model with dummy attributes.

```php
use Laracasts\TestDummy\Factory;

$post = Factory::build('Post');
```

If we then do `$post->toArray()`, this might return:

```bash
array(4) {
  ["title"]=>
  string(21) "The Title of the Post"
  ["author_id"]=>
  string(1) "5"
  ["body"]=>
  string(226) "Iusto qui optio et iste. Cumque aliquid et omnis enim. Nesciunt ad esse a reiciendis expedita quidem veritatis. Nostrum repellendus reiciendis distinctio amet sapiente. Eum molestias a recusandae modi aut et adipisci corrupti."
  ["publish_date"]=>
  string(19) "2014-03-02 11:05:48"
}
```

### Build a post, but override the default title.

```php
use Laracasts\TestDummy\Factory;

$post = Factory::build('Post', ['title' => 'Override Title']);
```

Again, when cast to an array...

```bash
array(4) {
  ["title"]=>
  string(14) "Override Title"
  ["author_id"]=>
  string(1) "5"
  ["body"]=>
  string(254) "In eos porro qui est rerum possimus voluptatem non. Repudiandae eaque nostrum eaque aut deleniti possimus quod minus. Molestiae commodi odit sunt dignissimos corrupti repudiandae quibusdam quo. Autem maxime tenetur autem corporis aut quis sint occaecati."
  ["publish_date"]=>
  string(19) "2013-06-24 10:01:30"
}
```

### Build an array of attributes for the model.

```php
$post = Factory::attributesFor('Post');
```

The difference between `build()` and `attributesFor()` is that the former will return an instance of the given model type (such as `Post`). The latter will simply return an array of the generated attributes, which can be useful in some situations. 

### Build and persist a song entity.

```php
use Laracasts\TestDummy\Factory;

$song = Factory::create('Song');
```

### Create and persist a comment three times.

```php
use Laracasts\TestDummy\Factory;

Factory::times(3)->create('Comment');
```

In effect, this will give you three rows in your `comments` table. If that table has relationships (such as an owning Post), those related rows will be created with dummy data as well.

## Usage

### Step 1: Install

Pull this package in through Composer, just like any other package.

```js
"require-dev": {
    "laracasts/testdummy": "~2.0"
}
```

### Step 2: Create a Factories File

TestDummy isn't magic. You need to describe the type of data that should be generated.

Within a `tests/factories` directory, you may create any number of PHP files that will automatically be
loaded by TestDummy. Why don't you start with a generic `tests/factories/factories.php` file.

Each factory file you create will automatically have access to two variables:

- `$factory`
- `$faker`

`$factory` is the function that you'll use to define new sets of data, such as the makeup of a Post or Album.

```php
$factory('Album', [
    'name' => 'Rock or Bust',
    'artist' => 'AC/DC'
]);
```

Think of this as your definition for any future generated albums - like when you do this:

```php
use Laracasts\TestDummy\Factory;

$album = Factory::create('Album');
```

#### Faker

You probably won't want to hardcode strings for your various factories. It would be easier and faster to use random data. TestDummy pulls in the excellent [Faker](https://github.com/fzaninotto/Faker) library to assist with this.

In fact, any files in your `tests/factories/` directory will automatically have access to a `$faker` object that you may use. Here's an example:

```php
$factory('Comment', [
    'body' => $faker->sentence
]);
```

Now, each time you generate a new comment, the `body` field will be set to a random sentence. Refer to the [Faker](https://github.com/fzaninotto/Faker) documentation for a massive list of available fakes.

#### Relationships

If you wish, TestDummy can automatically generate your relationship models, as well. You just need to let TestDummy know the type of its associated model. TestDummy will then automatically build and save that relationship for you!

Using the `Comment` example from above, it stands to reason that a comment belongs to a user, right? Let's set that up:

```php
$factory('Comment', [
    'user_id' => 'factory:User',
    'body' => $faker->sentence
]);
```

That's it! Notice the special syntax here: "factory:", followed by the name of the associated class/model.

To illustrate this with one more example, if a song belongs to an album, and an album belongs to an artist, then we can easily represent this:

```php
$factory('App\Song', [
    'album_id' => 'factory:App\Album',
    'name' => $faker->sentence
]);

$factory('App\Album', [
    'artist_id' => 'factory:App\Artist',
    'name' => $faker->word
]);

$factory('App\Artist', [
    'name' => $faker->word
]);
```

So here's the cool thing: this will all work recursively. In translation, if you do...

```php
use Laracasts\TestDummy\Factory;

$song = Factory::create('App\Song');
```

...then not only will TestDummy build and persist a song to the database, but it'll also do the same for the related album, and its related artist. Nifty!

#### Custom Factories

So far, you've learned how to generate data, using the name of the class, like `App\User`. However, sometimes, you'll want to define multiple types of users for the purposes of testing.

While it's true that you can use overrides, like this:

```php
Factory::create('App\User', ['role' => 'admin']);
```

...if this is something that you'll be doing often, create a custom factory, like so:

```php
// A generic factory for users...

$factory('App\User', [
    'username' => $faker->username,
    'password' => $faker->password,
    'role'     => 'member'
]);

// And a custom one for administrators

$factory('App\User', 'admin_user', [
    'username' => $faker->username,
    'password' => $faker->password,
    'role'     => 'admin'
]);
```

In the code snippet above, you're already familiar with the first example. For the second one, notice that we've added a "short name", or identifier for this special type of user factory. Now, whenever you want to quickly generate an admin user, you may do:

```php
use Laracasts\TestDummy\Factory;

$adminUser = Factory::create('admin_user');
```

#### Defining with Closures

Alternatively, you may pass a closure as the second argument to the `$factory` method. This can be useful for situations where you need a bit more control over the values that you assign to each attribute. Here's an example:

```php
$factory('App\Artist', function($faker) {
    $name = sprintf('Some Band Named %s', $faker->word);
    
    return [
        'name' => $name
    ];
});
```

Of course, just be sure to return an array from this closure. If you don't, an exception will be thrown.

### Step 3: Setup

When testing against a database, it's recommended that each test works with the exact same database environment and structure. That way, you can protect yourself against false positives. An SQLite database (maybe even one in memory) is a good choice in these cases.

```php
public function setUp()
{
    parent::setUp();

    Artisan::call('migrate');
}
```

Or, if a DB in memory isn't possible, to save a bit of time, a helper `Laracasts\TestDummy\DbTestCase` class is included with this package. If you extend it, before each test, your test DB will be migrated (if necessary), and all DB modifications will be channelled through a transaction, and then rolled back on `tearDown`. This will give you a speed boost, and ensure that all tests start with the same database structure.

```php

use Laracasts\TestDummy\DbTestCase;

class ExampleTest extends DbTestCase {

    /** @test */
    function it_does_something()
    {
        // Before each test, your database will be rolled back
    }
}
```

### Step 4: Write Your Tests

You're all set to go now. Start testing! Here's some code to get you started. Assuming that you have a `Post` and `Comment` model created...

```php

use Laracasts\TestDummy\Factory;

$comment = Factory::create('Comment');
```

This will create and save both a `Comment`, as well as a `Post` record to the database.

Or, maybe you need to write a test to ensure that, if you have three songs with their respective lengths, when you call a `getTotalLength` method on the owning `Album` model, it will return the correct value. That's easy!

```php
// create three songs, and explicitly set the length
Factory::times(3)->create('Song', ['length' => 200]);

$album = Album::first(); // this will be created once automatically.

$this->assertEquals(600, $album->getTotalLength());
```

Now, of course, just make sure that you've registered a definition for a `Song` and `Album` in one of your factory files, and you're good to go!

```
// tests/factories/factories.php

$factory('Song', [
  'album_id' => 'factory:Album',
  'name' => $faker->sentence
]);

$factory('Album', [
  'name' => $faker->sentence
]);
```

### FAQ

#### How do I specify a different factories folder?

Easy. Before your tests run, add:

```
Factory::$factoriesPath = 'app/tests/factories';
```

Now, TestDummy will look for your registered factories in the `app/tests/factories` folder.

#### I want to control how my models are built and saved...

Okay, just create your own implementation of `Laracasts\TestDummy\IsPersistable`. This contract is composed of a few methods that you'll need to implement.

Once you have your implementation, before your tests run, add:

```
Factory::$databaseProvider = new MyCustomBuilder;
```

And that's it! Now, whenever you generate and save an entity, TestDummy will reference your custom implementation.
