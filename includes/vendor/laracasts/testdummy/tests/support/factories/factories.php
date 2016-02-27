<?php

$factory('Post', 'scheduled_post', [
    'title' => 'Scheduled Post Title'
]);

$factory('Post', [
    'author_id' => 'factory:Person',
    'title' => 'Post Title'
]);

$factory('Comment', function($faker) {

    return [
        'post_id' => 'factory:Post',
        'body' => $faker->word
    ];
});

$factory('Comment', 'comment', []);

$factory('Comment', 'comment_for_post_by_person', [
    'post_id' => 'factory:Post',
    'body' => $faker->word
]);

$factory('Foo', function($faker) {
    return [
        'name' => $faker->word
    ];
});

$factory('Message', [
    'contents' => $faker->sentence,
    'sender_id' => 'factory:Person',
    'receiver_id' => 'factory:Person',
]);

$factory('Person', [
    'name' => $faker->name
]);
