<?php

class Info
{
    /**
     * @var BD
     */
    private $bd;

    function __construct()
    {
        $this->bd = null;
    }

    private function connect_to_db()
    {
        $this->bd = new BD();
        return $this->bd->connect();
    }

    function get_from_db(): array
    {
        if (!$this->connect_to_db()) {
            return [];
        }

        $query = 'SELECT '.WEEKCOLUMN.', '.YEARCOLUMN.' FROM '.TABLENAME;
        if (($r = $this->bd->query($query)) != null) {
            $ra = [];

            foreach ($r as $row) {
                $ra[] = [$row[WEEKCOLUMN], $row[YEARCOLUMN]];
            }

            return $ra;
        } else {
            Commons::debug_line('Erreur lors de la query.');
            return [];
        }
    }
}