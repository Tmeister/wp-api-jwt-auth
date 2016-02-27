<?php

namespace spec\Laracasts\TestDummy;

use PhpSpec\ObjectBehavior;
use Prophecy\Argument;

class FactoriesLoaderSpec extends ObjectBehavior {

    function it_gets_pissed_if_the_given_factories_directory_path_does_not_exist()
    {
        $this->shouldThrow('Laracasts\TestDummy\TestDummyException')->duringLoad(__DIR__.'/nonexistent-folder');
    }

    function it_loads_a_directory_of_user_provided_factories()
    {
        $factories = $this->load(__DIR__.'/helpers');

        $factories->shouldBeArray();
        $factories->shouldHaveCount(2);
    }

    public function getMatchers()
    {
        return [
            'haveKey' => function($subject, $key) {
                return array_key_exists($key, $subject);
            }
        ];
    }
}
