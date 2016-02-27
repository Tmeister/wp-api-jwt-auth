<?php

namespace Laracasts\TestDummy;

use Faker\Factory as Faker;

class FakerAdapter
{

    /**
     * The faker generator.
     *
     * @var mixed
     */
    protected $generator;

    /**
     * Create a new FakerAdapter instance.
     *
     * @param mixed $generator
     */
    public function __construct($generator = null)
    {
        $this->generator = $generator ?: Faker::create();
    }

    /**
     * Get the faker generator.
     *
     * @return mixed
     */
    public function generator()
    {
        return $this->generator;
    }

    /**
     * Set the locale of the generator
     *
     * @param string $locale
     */
    public function locale($locale)
    {
        $this->generator = Faker::create($locale);
    }

    /**
     * Ensure that the faked value is unique.
     *
     * @param  boolean $reset
     * @param  integer $retries
     * @return static
     */
    public function unique($reset = false, $retries = 5000)
    {
        return new static($this->generator()->unique($reset, $retries));
    }

    /**
     * Ensure that the faked value is optional.
     *
     * @param  float $weight
     * @param  mixed $default
     * @return static
     */
    public function optional($weight = 0.5, $default = null)
    {
        return new static($this->generator()->optional($weight, $default));
    }

    /**
     * Wrap all faker property access in a closure
     * to ensure a random value each time.
     *
     * @param  string $name
     * @return closure
     */
    public function __get($name)
    {
        return function () use ($name) {
            return $this->generator()->$name;
        };
    }

    /**
     * Wrap all faker method calls in a closure
     * to ensure a random value each time.
     *
     * @param  string $method
     * @param  array  $params
     * @return closure
     */
    public function __call($method, $params)
    {
        return function () use ($method, $params) {
            return call_user_func_array([$this->generator(), $method], $params);
        };
    }

}
