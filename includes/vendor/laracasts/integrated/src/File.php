<?php

namespace Laracasts\Integrated;

class File
{
    /**
     * Make a directory tree recursively.
     *
     * @param  string $dir
     * @return void
     */
    public function makeDirectory($dir)
    {
        if (! is_dir($dir)) {
            mkdir($dir, 0777, true);
        }
    }

    /**
     * Put to a file path.
     *
     * @param  string $path
     * @param  string $contents
     * @return mixed
     */
    public function put($path, $contents)
    {
        $this->makeDirectory(dirname($path));

        return file_put_contents($path, $contents);
    }
}
