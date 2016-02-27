<?php

namespace spec\Laracasts\TestDummy;

use Laracasts\TestDummy\FixturesFinder;
use PhpSpec\ObjectBehavior;
use Prophecy\Argument;
use Laracasts\TestDummy\IsPersistable;
use Laracasts\TestDummy\Factory;

class BuilderSpec extends ObjectBehavior {

    function let(IsPersistable $model)
    {
        $factories = (new Factory(__DIR__.'/helpers'))->factories();

        $this->beConstructedWith($model, $factories);
    }

    function it_gets_attributes_for_a_model()
    {
        $attributes = $this->attributesFor('Album', ['artist' => 'AC/DC']);

        $attributes['name']->shouldBeString();
        $attributes['artist']->shouldBe('AC/DC');
    }

    function it_builds_entities(IsPersistable $model)
    {
        $model->build('Album', Argument::type('array'))->willReturn('foo');

        $this->build('Album')->shouldReturn('foo');
    }

    function it_can_override_defaults_from_factory(IsPersistable $model)
    {
        $overrides = ['artist' => 'Captain Geech and the Shrimp-Shack Shooters', 'name' => 'Album Name'];

        $model->build('Album', $overrides)->willReturn($overrides);

        $this->build('Album', $overrides)->shouldReturn($overrides);
    }

    function it_can_handle_attributes_returned_from_closure(IsPersistable $model)
    {
        $model->build('Artist', Argument::type('array'))->willReturn('foo');

        $this->build('Artist')->shouldReturn('foo');
    }

    function it_can_override_defaults_in_a_closure(IsPersistable $model)
    {
        $overrides = ['name' => 'The Boogaloos'];

        $model->build('Artist', $overrides)->willReturn($overrides);

        $this->build('Artist', $overrides)->shouldReturn($overrides);
    }

    function it_can_persist_an_entity(IsPersistable $model)
    {
        $albumStub = new AlbumStub;

        $model->getAttributes(Argument::any())->willReturn([]);
        $model->build('Album', Argument::type('array'))->willReturn($albumStub);
        $model->save($albumStub)->shouldBeCalled();

        $this->create('Album')->shouldReturn($albumStub);
    }

    function it_can_create_multiple_entities_at_once(IsPersistable $model)
    {
        $stub = new AlbumStub;

        $model->getAttributes(Argument::any())->willReturn([]);
        $model->build('Album', Argument::type('array'))->shouldBeCalledTimes(3)->willReturn($stub);
        $model->save($stub)->shouldBeCalledTimes(3);

        $collection = $this->setTimes(3)->create('Album');

        $collection[0]->shouldEqual($stub);
        $collection[1]->shouldEqual($stub);
        $collection[2]->shouldEqual($stub);
    }

    function it_throws_an_exception_if_the_fixture_name_is_not_recognized()
    {
        $this->shouldThrow('Laracasts\TestDummy\TestDummyException')->duringAttributesFor('Bar');
    }

}

class AlbumStub {
    public function getAttributes()
    {
       return ['name' => 'Back in Black', 'artist' => 'AC/DC'];
    }
}
