<?php

namespace Laracasts\TestDummy;

use TestCase, Artisan, DB;

/**
 * Helper parent class for Laravel users.
 * Extend this class from your test classes.
 */
class DbTestCase extends TestCase
{

    /**
     * Setup the DB before each test.
     */
    public function setUp()
    {
        parent::setUp();

        // This should only do work for Sqlite DBs in memory.
        Artisan::call('migrate');

        // We'll run all tests through a transaction,
        // and then rollback afterward.
        DB::beginTransaction();
    }

    /**
     * Rollback transactions after each test.
     */
    public function tearDown()
    {
        DB::rollback();

        parent::tearDown();
    }

}
