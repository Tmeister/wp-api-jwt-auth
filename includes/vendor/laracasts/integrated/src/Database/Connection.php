<?php

namespace Laracasts\Integrated\Database;

use Exception;
use PDO;

class Connection
{

    /**
     * The PDO connection instance.
     *
     * @var PDO
     */
    protected $connection;

    /**
     * Create a new Connection instance.
     *
     * @param array $pdo
     */
    public function __construct(array $pdo)
    {
        $connection = $pdo['connection'];
        $username = isset($pdo['username']) ? $pdo['username'] : '';
        $password = isset($pdo['password']) ? $pdo['password'] : '';

        try {
            $this->connection = new PDO($connection, $username, $password);

            $this->connection->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        } catch (Exception $e) {
            dd($e->getMessage());
        }
    }

    /**
     * Get the PDO instance.
     *
     * @return PDO
     */
    public function getPdo()
    {
        return $this->connection;
    }
}
