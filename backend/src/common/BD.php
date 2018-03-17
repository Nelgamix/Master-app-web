<?php

require_once 'Commons.php';

class BD
{
    /**
     * @var PDO
     */
    private $connection;
    private $connected;

    function __construct()
    {
        $this->connection = null;
        $this->connected = false;
    }

    function connect()
    {
        Commons::debug_section("Connexion a la base de donnee");

        try {
            $dom = DB;
            Commons::debug_line("Serveur: " . $dom);
            $this->connection = new PDO($dom, USERNAME, PASSWORD, array(PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8"));

            Commons::debug_line("PDO connexion créée");
            $this->connected = true;
        } catch (PDOException $e) {
            Commons::debug_line("Connexion échouée. Raison: " . $e->getMessage());
            $this->connected = false;
        }

        return $this->is_connected();
    }

    function get_connection()
    {
        return $this->connection;
    }

    function is_connected()
    {
        return $this->connected;
    }

    function exec(String $req)
    {
        if (!$this->is_connected())
        {
            Commons::debug_line("Connexion indisponible: impossible d'exec");
            return;
        }

        $o = $this->connection->prepare($req);
        $o->execute();
    }

    function query(String $req)
    {
        if (!$this->is_connected())
        {
            Commons::debug_line("Connexion indisponible: impossible d'exec");
            return null;
        }

        return $this->connection->query($req, PDO::FETCH_NAMED);
    }

    function fetch_class(String $req, String $class)
    {
        if (!$this->is_connected()) {
            Commons::debug_line("Connexion indisponible: impossible de fetch");
            return null;
        }

        $results = [];

        $s = $this->connection->prepare($req);

        if ($s->execute() && $s->rowCount() > 0) {
            $results = $s->fetchAll(PDO::FETCH_CLASS, $class);
        }

        return $results;
    }
}
