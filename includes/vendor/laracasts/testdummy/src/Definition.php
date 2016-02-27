<?php

namespace Laracasts\TestDummy;

class Definition
{

    /**
     * The class name for the factory.
     *
     * @var string
     */
    public $name;

    /**
     * The abbreviated short-name.
     *
     * @var string
     */
    public $shortName;

    /**
     * Attributes for the factory.
     *
     * @var array
     */
    public $attributes;

    /**
     * Create a new Definition instance.
     *
     * @param string $name
     * @param string $shortName
     * @param array  $attributes
     */
    public function __construct($name, $shortName, $attributes = [])
    {
        $this->name = $name;
        $this->shortName = $shortName;
        $this->attributes = $attributes;
    }

}
