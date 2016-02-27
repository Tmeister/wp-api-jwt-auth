<?php

namespace Laracasts\TestDummy;

class FactoriesLoader
{

    /**
     * Load the factories.
     *
     * @param  string $basePath
     * @return array
     */
    public function load($basePath)
    {
        $this->assertThatFactoriesDirectoryExists($basePath);

        $designer = new Designer;
        $faker = new FakerAdapter;

        $factory = function ($name, $shortName, $attributes = []) use ($designer, $faker) {
            return $designer->define($name, $shortName, $attributes);
        };

        foreach ((new FactoriesFinder($basePath))->find() as $file) {
            include($file);
        }

        return $designer->definitions();
    }

    /**
     * Assert that the given factories directory exists.
     *
     * @param  string $basePath
     * @return mixed
     * @throws TestDummyException
     */
    private function assertThatFactoriesDirectoryExists($basePath)
    {
        if ( ! is_dir($basePath)) {
            throw new TestDummyException(
                "The path provided for the factories directory, {$basePath}, does not exist."
            );
        }
    }
}
