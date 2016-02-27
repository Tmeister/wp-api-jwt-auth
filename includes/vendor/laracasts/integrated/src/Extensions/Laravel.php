<?php

namespace Laracasts\Integrated\Extensions;

use Laracasts\Integrated\Extensions\Traits\LaravelTestCase;
use Illuminate\Foundation\Testing\TestCase;
use Laracasts\Integrated\Emulator;

abstract class Laravel extends TestCase implements Emulator
{
    use LaravelTestCase;
}
