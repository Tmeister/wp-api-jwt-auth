<?php

namespace Laracasts\Integrated\Services\Laravel;

trait DatabaseTransactions
{

    /**
     * Begin a new database transaction.
     *
     * @setUp
     */
    public function beginTransaction()
    {
        $this->app['db']->beginTransaction();
    }

    /**
     * Rollback the transaction.
     *
     * @tearDown
     */
    public function rollbackTransaction()
    {
        $this->app['db']->rollback();
    }
}
