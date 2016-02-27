<?php

namespace Laracasts\TestDummy;

use RecursiveDirectoryIterator;
use RecursiveIteratorIterator;

class FactoriesFinder
{

    /**
     * The base directory to conduct the search.
     *
     * @var string
     */
    private $basePath;

    /**
     * Create a new FixturesFinder instance.
     *
     * @param string $basePath
     */
    function __construct($basePath)
    {
        $this->basePath = $basePath;
    }

    /**
     * Fetch an array of factory files.
     *
     * @return array
     */
    public function find()
    {
        $files = [];

        foreach ($this->getDirectoryIterator() as $file) {
            if ($this->getExtension($file) !== 'php') continue;

            $files[] = $file->getPathname();
        }

        return $files;
    }

    /**
     * Get the directory iterator.
     *
     * @return RecursiveIteratorIterator
     */
    private function getDirectoryIterator()
    {
        $directoryIterator = new RecursiveDirectoryIterator($this->basePath);
        $directoryIterator->setFlags(RecursiveDirectoryIterator::SKIP_DOTS);

        return new RecursiveIteratorIterator($directoryIterator);
    }

    /**
     * Get the extension of a file.
     *
     * @param $file
     * @return string|null
     */
    private function getExtension($file)
    {
        $fileInfo = pathinfo($file);

        return isset($fileInfo['extension']) ? $fileInfo['extension'] : null;
    }

}
