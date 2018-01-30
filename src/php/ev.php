<?php

session_start();

// Common imports
require_once 'commons.php';

// Class imports
require_once 'EV/DB.php';
require_once 'EV/Evenement.php';

// Define
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
    . BEGINCOLUMN . " DATETIME NOT NULL,"
    . ENDCOLUMN . " DATETIME,"
    . INFOCOLUMN . " TEXT DEFAULT NULL,"
    . TYPECOLUMN . " VARCHAR(64) DEFAULT NULL,"
    . URLCOLUMN . " VARCHAR(255) DEFAULT NULL"
    . ")");

// Les mots de passe disponibles
define("ADMINMDP", [
    "mdptest",
    "loictest"
]);

if (!isset($_SESSION['admin'])) {
    $_SESSION['admin'] = false;
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
