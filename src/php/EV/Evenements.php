<?php

require_once __DIR__.'/../common/Commons.php';
require_once 'Evenement.php';

class Evenements
{
    private $db;

    function __construct()
    {
        $this->db = new BD();
        $this->db->connect();
        $this->db->exec(TABLECREATE);
    }

    public function select()
    {
        return $this->db->fetch_class("SELECT `"
            . IDCOLUMN
            . "`, `"
            . BEGINCOLUMN
            . "`, `"
            . ENDCOLUMN
            . "`, `"
            . INFOCOLUMN
            . "`, `"
            . TYPECOLUMN
            . "`, `"
            . URLCOLUMN
            . "` FROM `"
            . TABLENAME
            . "`", "Evenement");
    }

    public function insert(Evenement $ev)
    {
        if (!$this->db->is_connected()) {
            return false;
        }

        $c = $this->db->get_connection();

        $debut = $ev->getSQL('debut');
        $fin = $ev->getSQL('fin');
        $info = $ev->getSQL('info');
        $type = $ev->getSQL('type');
        $url = $ev->getSQL('url');

        $s = $c->prepare("INSERT INTO `" . TABLENAME . "` (`" . BEGINCOLUMN . "`, `" . ENDCOLUMN . "`, `" . INFOCOLUMN . "`, `" . TYPECOLUMN . "`, `" . URLCOLUMN . "`) VALUES (:debut, :fin, :info, :type, :url)");
        $s->bindParam(":debut", $debut);
        $s->bindParam(":fin", $fin);
        $s->bindParam(":info", $info);
        $s->bindParam(":type", $type);
        $s->bindParam(":url", $url);

        return $s->execute();
    }

    public function update(Evenement $ev)
    {
        if (!$this->db->is_connected()) {
            return false;
        }

        $c = $this->db->get_connection();

        $id = $ev->getSQL('id');
        $debut = $ev->getSQL('debut');
        $fin = $ev->getSQL('fin');
        $info = $ev->getSQL('info');
        $type = $ev->getSQL('type');
        $url = $ev->getSQL('url');

        $s = $c->prepare("UPDATE `" . TABLENAME . "` SET `" . BEGINCOLUMN . "` = :debut, `" . ENDCOLUMN . "` = :fin, `" . INFOCOLUMN . "` = :info, `" . TYPECOLUMN . "` = :type, `" . URLCOLUMN . "` = :url WHERE `" . IDCOLUMN . "` = :id");
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
        if (!$this->db->is_connected()) {
            return false;
        }

        $c = $this->db->get_connection();

        $s = $c->prepare("DELETE FROM `" . TABLENAME . "` WHERE `" . IDCOLUMN . "` = :id");
        $s->bindParam(":id", $id);

        return $s->execute();
    }
}
