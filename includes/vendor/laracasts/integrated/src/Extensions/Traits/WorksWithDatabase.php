<?php

namespace Laracasts\Integrated\Extensions\Traits;

use Laracasts\Integrated\IntegratedException;
use Laracasts\Integrated\Database\Connection;
use Laracasts\Integrated\Database\Adapter;

trait WorksWithDatabase
{


    /**
     * The database adapter instance.
     *
     * @var Adapter
     */
    protected $db;

    /**
     * Get the adapter to the database.
     *
     * @return Adapter
     */
    protected function getDbAdapter()
    {
        if (! $this->db) {
            try {
                $config = $this->getPackageConfig('pdo');
            } catch (IntegratedException $e) {
                throw new IntegratedException(
                    "Thank you for riding Johnny Cab. To input your destination (and use the database adapter with Selenium), " .
                    "you must specify your db connection in a integrated.json file." .
                    "\n\nSee: https://github.com/laracasts/Integrated/wiki/Configuration#database-credentials"
                );
            }

            $connection = new Connection($this->getPackageConfig('pdo'));
            $this->db = new Adapter($connection);
        }

        return $this->db;
    }

    /**
     * Get the number of rows that match the given condition.
     *
     * @param  string $table
     * @param  array $data
     * @return integer
     */
    protected function seeRowsWereReturned($table, $data)
    {
        // If the user has imported the Laravel application trait, we can use Laravel to
        // work with the database.

        if (isset($this->app) || in_array('Laracasts\Integrated\Services\Laravel\Application', class_uses($this))) {
            return $this->app['db']->table($table)->where($data)->count();
        }

        // Otherwise, we'll default to the database adapter that Integrated provides.

        return $this->getDbAdapter()->table($table)->whereExists($data);
    }
}
