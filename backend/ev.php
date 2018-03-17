<?php

session_start();

// Common imports
require_once 'src/common/Commons.php';
require_once 'config.php';

// Class imports
require_once 'src/EV/Evenements.php';

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

// Récup options de la commandline
$longoptions = [
    "req:",
    "debut:",
    "fin:",
    "info:",
    "url:",
    "psw:"
];
$in = Commons::parse_args($longoptions, $_GET);

$res = [
    "success" => false, // requête réussie ?
    "error" => "", // si requête ratée, pourquoi ?
    "admin" => false, // l'utilisateur est-il admin ?
    "request" => [], // les données reçues par GET
    "data" => null // les données en cas de besoin (pour un get par ex.)
];

foreach ($in as $k => $v)
{
    $res['request'][] = [
        "key" => $k,
        "value" => $v
    ];
}

$evs = new Evenements();

Commons::debug_section("Traitement de la requete");
if (!isset($in['req'])) {
    Commons::debug_line("Pas de requête spécifiée.");
    $res['success'] = false;
    $res['error'] = "Aucune méthode spécifiée (il faut set req=??? dans l'url et donner les paramètres nécessaires).";
} else {
    Commons::debug_line("Requête de ${in['req']} spécifiée.");

    switch ($in['req']) {
        case 'insert':
            if (!$_SESSION['admin'] || !(isset($in['debut']) && isset($in['fin']) && isset($in['info']) && isset($in['type']) && isset($in['url']))) {
                $res['success'] = false;
                $res['error'] = "(INSERT): Non admin ou tous les champs ne sont pas remplis.";
                break;
            }

            $ev = new Evenement();
            $ev->debut = $in['debut'];
            $ev->fin = $in['fin'];
            $ev->info = $in['info'];
            $ev->type = $in['type'];
            $ev->url = $in['url'];

            if ($evs->insert($ev)) {
                $res['success'] = true;
            } else {
                $res['success'] = false;
                $res['error'] = "(INSERT): Requête SQL a retourné une erreur.";
            }

            break;

        case 'get':
            $get = $evs->select();

            if (isset($get)) {
                $res['data'] = $get;
                $res['success'] = true;
            } else {
                $res['success'] = false;
                $res['error'] = "(GET): Requête SQL a retourné une erreur.";
            }

            break;

        case 'update':
            if (!$_SESSION['admin'] || !(isset($in['id']) && isset($in['debut']) && isset($in['fin']) && isset($in['info']) && isset($in['type']) && isset($in['url']))) {
                $res['success'] = false;
                $res['error'] = "(UPDATE): Non admin ou tous les champs ne sont pas remplis.";
                break;
            }

            $ev = new Evenement();
            $ev->id = $in['id'];
            $ev->debut = $in['debut'];
            $ev->fin = $in['fin'];
            $ev->info = $in['info'];
            $ev->type = $in['type'];
            $ev->url = $in['url'];

            if ($evs->update($ev)) {
                $res['success'] = true;
            } else {
                $res['success'] = false;
                $res['error'] = "(UPDATE): Requête SQL a retourné une erreur.";
            }

            break;

        case 'delete':
            if (!$_SESSION['admin'] || !(isset($in['id']))) {
                $res['success'] = false;
                $res['error'] = "(DELETE): Non admin ou tous les champs ne sont pas remplis.";
                break;
            }

            $id = $in['id'];

            if ($evs->delete($id)) {
                $res['success'] = true;
            } else {
                $res['success'] = false;
                $res['error'] = "(DELETE): Requête SQL a retourné une erreur.";
            }

            break;

        case 'login':
            if ($_SESSION['admin'] || !(isset($in['psw']))) {
                $res['success'] = false;
                $res['error'] = "(LOGIN): Déjà admin ou tous les champs ne sont pas remplis.";
                break;
            }

            if (test_mdp($in['psw'])) {
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
