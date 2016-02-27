<?php

namespace Laracasts\Integrated\Services\Laravel;

trait Application
{
    /**
     * The Illuminate application instance.
     *
     * @var \Illuminate\Foundation\Application
     */
    protected $app;

    /**
     * Setup the test environment.
     *
     * @setUp
     * @return void
     */
    public function setUpLaravel()
    {
        if (! $this->app) {
            $this->refreshApplication();
        }
    }

    /**
     * Clean up the testing environment before the next test.
     *
     * @tearDown
     * @return void
     */
    public function tearDownLaravel()
    {
        if ($this->app) {
            $this->app->flush();
        }
    }

    /**
     * Refresh the application instance.
     *
     * @return void
     */
    protected function refreshApplication()
    {
        putenv('APP_ENV=testing');

        $this->app = $this->createApplication();
    }

    /**
     * Creates the application.
     *
     * @return \Illuminate\Foundation\Application
     */
    protected function createApplication()
    {
        $app = require __DIR__.'/../../../../../../bootstrap/app.php';

        $app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

        return $app;
    }
}
