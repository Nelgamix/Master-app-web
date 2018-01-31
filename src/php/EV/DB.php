<?php

class DB
{
    /**
     * @var PDO
     */
    private $conn;
    private $connected;

    function __construct()
    {
        $this->connected = false;
        $this->init();
    }

    private function init()
    {
        $this->conn = null;

        try {
            Commons::debug_section("Connexion à la DB");
            $dom = DB;
            Commons::debug_line("Serveur: " . $dom);
            $this->conn = new PDO($dom, USERNAME, PASSWORD, array(PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8"));
            Commons::debug_line("PDO connexion créée");
            $this->connected = true;
            $this->conn->exec(TABLECREATE);
            Commons::debug_line("Requête création table envoyée.");
        } catch (PDOException $e) {
            Commons::debug_line("Connexion échouée. Raison: " . $e->getMessage());
            $this->connected = false;
        }
    }

    public function select()
    {
        if (!$this->connected) {
            return null;
        }

        $results = [];

        $s = $this->conn->prepare("SELECT `" . IDCOLUMN . "`, `" . BEGINCOLUMN . "`, `" . ENDCOLUMN . "`, `" . INFOCOLUMN . "`, `" . TYPECOLUMN . "`, `" . URLCOLUMN . "` FROM `" . TABLENAME . "`");

        if ($s->execute() && $s->rowCount() > 0) {
            $results = $s->fetchAll(PDO::FETCH_CLASS, "Evenement");
        }

        return $results;
    }

    public function insert(Evenement $ev)
    {
        if (!$this->connected) {
            return false;
        }

        $debut = $ev->getSQL('debut');
        $fin = $ev->getSQL('fin');
        $info = $ev->getSQL('info');
        $type = $ev->getSQL('type');
        $url = $ev->getSQL('url');

        $s = $this->conn->prepare("INSERT INTO `" . TABLENAME . "` (`" . BEGINCOLUMN . "`, `" . ENDCOLUMN . "`, `" . INFOCOLUMN . "`, `" . TYPECOLUMN . "`, `" . URLCOLUMN . "`) VALUES (:debut, :fin, :info, :type, :url)");
        $s->bindParam(":debut", $debut);
        $s->bindParam(":fin", $fin);
        $s->bindParam(":info", $info);
        $s->bindParam(":type", $type);
        $s->bindParam(":url", $url);

        return $s->execute();
    }

    public function update(Evenement $ev)
    {
        if (!$this->connected) {
            return false;
        }

        $id = $ev->getSQL('id');
        $debut = $ev->getSQL('debut');
        $fin = $ev->getSQL('fin');
        $info = $ev->getSQL('info');
        $type = $ev->getSQL('type');
        $url = $ev->getSQL('url');

        $s = $this->conn->prepare("UPDATE `" . TABLENAME . "` SET `" . BEGINCOLUMN . "` = :debut, `" . ENDCOLUMN . "` = :fin, `" . INFOCOLUMN . "` = :info, `" . TYPECOLUMN . "` = :type, `" . URLCOLUMN . "` = :url WHERE `" . IDCOLUMN . "` = :id");
        $s->bindParam(":id", $id);
        $s->bindParam(":debut", $debut);
        $s->bindParam(":fin", $fin);
        $s->bindParam(":info", $info);
        $s->bindParam(":type", $type);
        $s->bindParam(":url", $url);

        return $s->execute();
    }

    public function delete($id)
    {
        if (!$this->connected) {
            return false;
        }

        $s = $this->conn->prepare("DELETE FROM `" . TABLENAME . "` WHERE `" . IDCOLUMN . "` = :id");
        $s->bindParam(":id", $id);

        return $s->execute();
    }
}
