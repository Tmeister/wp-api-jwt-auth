<?php

namespace Laracasts\Integrated\Extensions;

use Laracasts\Integrated\Extensions\Traits\LaravelTestCase;
use Laravel\Lumen\Testing\TestCase;
use Laracasts\Integrated\Emulator;

abstract class Lumen extends TestCase implements Emulator
{
    use LaravelTestCase;
}
