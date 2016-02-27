<?php

namespace spec\Laracasts\TestDummy;

use PhpSpec\ObjectBehavior;
use Prophecy\Argument;
use Laracasts\TestDummy\Definition;

class DesignerSpec extends ObjectBehavior {

    function it_is_initializable()
    {
        $this->shouldHaveType('Laracasts\TestDummy\Designer');
    }

    function it_can_store_a_new_model_definition_with_attributes()
    {
        $all = $this->define('Model', 'basic_model', ['foo' => 'bar'])->definitions();

        $all[0]->shouldHaveType('Laracasts\TestDummy\Definition');
        $all[0]->name->shouldBe('Model');
        $all[0]->shortName->shouldBe('basic_model');
        $all[0]->attributes->shouldBe(['foo' => 'bar']);
    }

    function it_does_not_require_a_shortname()
    {
        $all = $this->define('Model', ['foo' => 'bar'])->definitions();

        $all[0]->name->shouldBe('Model');
        $all[0]->shortName->shouldBe('');
        $all[0]->attributes->shouldBe(['foo' => 'bar']);
    }

}
