<?php

session_start();

require_once "commons.php";

define("TABLENAME", "masterev");
define("IDCOLUMN", "id");
define("BEGINCOLUMN", "debut");
define("ENDCOLUMN", "fin");
define("INFOCOLUMN", "info");
define("TYPECOLUMN", "type");
define("URLCOLUMN", "url");

// Don't touch this, only things above
define("TABLECREATE", "CREATE TABLE IF NOT EXISTS " . TABLENAME . " ("
    . IDCOLUMN . " INT PRIMARY KEY AUTO_INCREMENT,"
    . BEGINCOLUMN . " DATE NOT NULL,"
    . ENDCOLUMN . " DATE,"
    . INFOCOLUMN . " TEXT DEFAULT NULL,"
    . TYPECOLUMN . " VARCHAR(64) DEFAULT NULL,"
    . URLCOLUMN . " VARCHAR(255) DEFAULT NULL"
    . ")");

define("ADMINMDP", [
    "mdptest",
    "loictest"
]);

if (!isset($_SESSION['admin'])) {
    $_SESSION['admin'] = false;
}

/**
 * Evenement
 */
class Evenement implements JsonSerializable
{
    // Format pour insérer une datetime dans une BD SQL: "Y-m-d H:i:s" (année-mois-jour heure:minutes:secondes)
    public $id; // id unique dans la DB
    public $debut; // doit être set
    public $fin; // peut être vide ('null')
    public $info; // infos de l'évènement
    public $type; // type de l'évènement (ex: DS, TP noté, ...)
    public $url; // url associé (optionnel)

    public function jsonSerialize()
    {
        return [
            IDCOLUMN => $this->id,
            BEGINCOLUMN => $this->debut,
            ENDCOLUMN => $this->fin,
            INFOCOLUMN => $this->info,
            TYPECOLUMN => $this->type,
            URLCOLUMN => $this->url
        ];
    }

    public function getSQL($champ)
    {
        if (!isset($this->$champ) || (is_string($this->$champ) && $this->$champ == "")) {
            return null;
        } else {
            return $this->$champ;
        }
    }
}

/**
 * DB
 */
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
            Commons::debugline("Serveur: " . $dom);
            $this->conn = new PDO($dom, USERNAME, PASSWORD, array(PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8"));
            Commons::debugline("PDO connexion créée");
            $this->connected = true;
            $this->conn->exec(TABLECREATE);
            Commons::debugline("Requête création table envoyée.");
        } catch (PDOException $e) {
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

        $s = $this->conn->prepare("INSERT INTO `" . TABLENAME . "` (`" . BEGINCOLUMN . "`, `" . ENDCOLUMN . "`, `" . INFOCOLUMN . "`, `" . TYPECOLUMN . "`, `" . URLCOLUMN . "`) VALUES (:debut, :fin, :info, :type, :url)");
        $s->bindParam(":debut", $ev->getSQL('debut'));
        $s->bindParam(":fin", $ev->getSQL('fin'));
        $s->bindParam(":info", $ev->getSQL('info'));
        $s->bindParam(":type", $ev->getSQL('type'));
        $s->bindParam(":url", $ev->getSQL('url'));

        return $s->execute();
    }

    public function update(Evenement $ev)
    {
        if (!$this->connected) {
            return false;
        }

        $s = $this->conn->prepare("UPDATE `" . TABLENAME . "` SET `" . BEGINCOLUMN . "` = :debut, `" . ENDCOLUMN . "` = :fin, `" . INFOCOLUMN . "` = :info, `" . TYPECOLUMN . "` = :type, `" . URLCOLUMN . "` = :url WHERE `" . IDCOLUMN . "` = :id");
        $s->bindParam(":id", $ev->getSQL('id'));
        $s->bindParam(":debut", $ev->getSQL('debut'));
        $s->bindParam(":fin", $ev->getSQL('fin'));
        $s->bindParam(":info", $ev->getSQL('info'));
        $s->bindParam(":type", $ev->getSQL('type'));
        $s->bindParam(":url", $ev->getSQL('url'));

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

function test_mdp($mdp)
{
    if (in_array($mdp, ADMINMDP)) {
        return true;
    }

    // else
    return false;
}

$res = [
    "success" => false, // requête réussie ?
    "error" => "", // si requête ratée, pourquoi ?
    "admin" => false, // l'utilisateur est-il admin ?
    "request" => [], // les données reçues par GET
    "data" => null // les données en cas de besoin (pour un get par ex.)
];

foreach ($_GET as $key => $value) {
    $res['request'][] = [
        "key" => $key,
        "value" => $value
    ];
}

$db = new DB();

if (!isset($_GET['req'])) {
    $res['success'] = false;
    $res['error'] = "Aucune méthode spécifiée (il faut set req=??? dans l'url et donner les paramètres nécessaires).";
} else {
    switch ($_GET['req']) {
        case 'insert':
            if (!$_SESSION['admin'] || !(isset($_GET['debut']) && isset($_GET['fin']) && isset($_GET['info']) && isset($_GET['type']) && isset($_GET['url']))) {
                $res['success'] = false;
                $res['error'] = "(INSERT): Non admin ou tous les champs ne sont pas remplis.";
                break;
            }

            $ev = new Evenement();
            $ev->debut = $_GET['debut'];
            $ev->fin = $_GET['fin'];
            $ev->info = $_GET['info'];
            $ev->type = $_GET['type'];
            $ev->url = $_GET['url'];

            if ($db->insert($ev)) {
                $res['success'] = true;
            } else {
                $res['success'] = false;
                $res['error'] = "(INSERT): Requête SQL a retourné une erreur.";
            }

            break;

        case 'get':
            $get = $db->select();

            if (isset($get)) {
                $res['data'] = $get;
                $res['success'] = true;
            } else {
                $res['success'] = false;
                $res['error'] = "(GET): Requête SQL a retourné une erreur.";
            }

            break;

        case 'update':
            if (!$_SESSION['admin'] || !(isset($_GET['id']) && isset($_GET['debut']) && isset($_GET['fin']) && isset($_GET['info']) && isset($_GET['type']) && isset($_GET['url']))) {
                $res['success'] = false;
                $res['error'] = "(UPDATE): Non admin ou tous les champs ne sont pas remplis.";
                break;
            }

            $ev = new Evenement();
            $ev->id = $_GET['id'];
            $ev->debut = $_GET['debut'];
            $ev->fin = $_GET['fin'];
            $ev->info = $_GET['info'];
            $ev->type = $_GET['type'];
            $ev->url = $_GET['url'];

            if ($db->update($ev)) {
                $res['success'] = true;
            } else {
                $res['success'] = false;
                $res['error'] = "(UPDATE): Requête SQL a retourné une erreur.";
            }

            break;

        case 'delete':
            if (!$_SESSION['admin'] || !(isset($_GET['id']))) {
                $res['success'] = false;
                $res['error'] = "(DELETE): Non admin ou tous les champs ne sont pas remplis.";
                break;
            }

            $id = $_GET['id'];

            if ($db->delete($id)) {
                $res['success'] = true;
            } else {
                $res['success'] = false;
                $res['error'] = "(DELETE): Requête SQL a retourné une erreur.";
            }

            break;

        case 'login':
            if ($_SESSION['admin'] || !(isset($_GET['psw']))) {
                $res['success'] = false;
                $res['error'] = "(LOGIN): Déjà admin ou tous les champs ne sont pas remplis.";
                break;
            }

            if (test_mdp($_GET['psw'])) {
                $_SESSION['admin'] = true;
                $res['success'] = true;
            } else {
                $_SESSION['admin'] = false;
                $res['success'] = false;
                $res['error'] = "(LOGIN): Mot de passe incorrect.";
            }

            break;

        default:
            $res['success'] = false;
            $res['error'] = "Aucune méthode reconnue.";

            break;
    }
}

$res['admin'] = $_SESSION['admin'];

Commons::output(json_encode($res));
