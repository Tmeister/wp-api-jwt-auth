<?php

use Laracasts\TestDummy\Factory as TestDummy;

use Illuminate\Database\Capsule\Manager as DB;

require 'vendor/phpunit/phpunit/src/Framework/Assert/Functions.php';

class FactoryTest extends PHPUnit_Framework_TestCase
{
    public function setUp()
    {
        parent::setUp();

        TestDummy::$factoriesPath = __DIR__ . '/support/factories';

        $this->setUpDatabase();
        $this->migrateTables();
    }

    protected function setUpDatabase()
    {
        $db = new DB;

        $db->addConnection([
            'driver' => 'sqlite',
            'database' => ':memory:'
        ]);

        $db->bootEloquent();
        $db->setAsGlobal();
    }

    protected function migrateTables()
    {
        DB::schema()->create('posts', function ($table) {
            $table->increments('id');
            $table->integer('author_id')->unsigned();
            $table->string('title');
            $table->timestamps();
        });

        DB::schema()->create('comments', function ($table) {
            $table->increments('id');
            $table->integer('post_id')->unsigned();
            $table->string('body');
            $table->timestamps();
        });

        DB::schema()->create('people', function ($table) {
            $table->increments('id');
            $table->string('name');
            $table->timestamps();
        });

        DB::schema()->create('messages', function ($table) {
            $table->increments('id');
            $table->integer('sender_id')->unsigned();
            $table->integer('receiver_id')->unsigned();
            $table->string('contents');
            $table->timestamps();
        });
    }

    /** @test */
    public function it_builds_up_attributes_for_an_entity()
    {
        $attributes = TestDummy::build('Post');

        assertInstanceOf('Post', $attributes);
        assertEquals('Post Title', $attributes->title);
    }

    /** @test */
    public function it_allows_for_overriding_attributes()
    {
        $post = TestDummy::build('Post', ['title' => 'override']);

        assertEquals('override', $post->title);
    }

    /** @test */
    public function it_accepts_a_short_name_identifier_instead_of_the_model_class()
    {
        $post = TestDummy::build('scheduled_post');

        assertInstanceOf('Post', $post);
    }

    /** @test */
    public function it_allows_a_closure_to_be_used_for_defining_factories()
    {
        $comments = TestDummy::times(2)->create('Comment');

        assertInstanceOf('Comment', $comments[0]);
        assertInternalType('string', $comments[0]->body);

        // Faker should produce a unique value for each generation.
        assertNotEquals($comments[0]->body, $comments[1]->body);
    }

    /** @test */
    public function it_gets_an_array_only_of_attributes()
    {
        $attributes = TestDummy::attributesFor('Post', ['title' => 'override']);

        assertInternalType('array', $attributes);
        assertEquals('override', $attributes['title']);
    }

    /** @test */
    public function it_builds_and_persists_attributes()
    {
        $post = TestDummy::create('Post');

        assertInstanceOf('Post', $post);
        assertNotNull($post->id);
    }

    /** @test */
    public function it_builds_up_relationships_if_specified()
    {
        $comment = TestDummy::create('Comment');

        assertInstanceOf('Comment', $comment);
        assertInstanceOf('Post', $comment->post);
    }

    /** @test */
    public function it_can_build_and_persist_multiple_times()
    {
        $posts = TestDummy::times(3)->create('Post');

        assertInstanceOf('Illuminate\Support\Collection', $posts);
        assertCount(3, $posts);
    }

    /**
     * @test
     * @expectedException Laracasts\TestDummy\TestDummyException
     */
    public function it_squawks_if_you_try_to_build_an_unknown()
    {
        TestDummy::attributesFor('ClassThatDoesNotExist');
    }

    /** @test */
    public function it_does_not_look_for_existing_global_functions_when_using_short_names()
    {
        TestDummy::attributesFor('comment');
    }

    /** @test */
    public function it_overrides_relationship_attributes_if_specified()
    {
        $comment = TestDummy::create('Comment', [
            'post_id.title' => 'override'
        ]);

        assertEquals('override', $comment->post->title);
    }

    /** @test */
    public function it_overrides_relationship_attributes_separately_for_relationships_that_use_the_same_factory()
    {
        $message = TestDummy::create('Message', [
            'sender_id.name' => 'Adam',
            'receiver_id.name' => 'Jeffrey',
        ]);

        assertEquals('Adam', $message->sender->name);
        assertEquals('Jeffrey', $message->receiver->name);
    }

    /** @test */
    public function it_can_override_deeply_nested_relationships()
    {
        $comment = TestDummy::create('comment_for_post_by_person', [
            'body' => 'Overridden Comment Body',
            'post_id.title' => 'Overridden Post Title',
            'post_id.author_id.name' => 'Overridden Author Name',
        ]);

        assertEquals('Overridden Comment Body', $comment->body);
        assertEquals('Overridden Post Title', $comment->post->title);
        assertEquals('Overridden Author Name', $comment->post->author->name);
    }

    /** @test */
    public function relationship_overrides_are_ignored_if_the_relationship_is_not_actually_defined()
    {
        $comment = TestDummy::create('Comment', [
            'post_id' => 1,
            'post_id.title' => 'override'
        ]);

        assertNull($comment->post);
        assertNull($comment->getAttribute('post_id.title'));
    }
}

function comment()
{
    throw new \Exception('This function should never be called by TestDummy.');
}
