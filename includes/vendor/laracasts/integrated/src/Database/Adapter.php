<?php

namespace Laracasts\Integrated\Database;

class Adapter
{
    /**
     * The table to perform a query on.
     *
     * @var string
     */
    protected $table;

    /**
     * A list of where clauses.
     *
     * @var array
     */
    protected $wheres = [];

    /**
     * The bindings for the where clauses.
     *
     * @var array
     */
    protected $bindings = [];

    /**
     * Create a new Connection instance.
     *
     * @param Connection $connection
     */
    public function __construct(Connection $connection)
    {
        $this->connection = $connection;
    }

    /**
     * Set the table to perform a query on.
     *
     * @param  string
     * @return self
     */
    public function table($table)
    {
        $this->table = $table;

        return $this;
    }

    /**
     * See if the table contains records that match the given data.
     *
     * @param  array $data
     * @return boolean
     */
    public function whereExists(array $data)
    {
        $this->parseConstraints($data);

        $query = $this->connection->getPdo()->prepare($this->getSelectQuery());

        return $this->execute($query)->fetch();
    }

    /**
     * Parse the "where" constraints.
     *
     * @param  array  $wheres
     * @return void
     */
    protected function parseConstraints(array $wheres)
    {
        foreach ($wheres as $column => $value) {
            $this->wheres[] = "{$column} = ?";
            $this->bindings[] = $value;
        }
    }

    /**
     * Create the SELECT query statement.
     *
     * @return string
     */
    protected function getSelectQuery()
    {
        return sprintf(
            "SELECT * FROM %s WHERE %s",
            $this->table, implode(' and ', $this->wheres)
        );
    }

    /**
     * Execute the query.
     *
     * @param  \PDOStatement $query
     * @return \PDOStatement
     */
    protected function execute($query)
    {
        $query->execute($this->bindings);

        return $query;
    }
}
