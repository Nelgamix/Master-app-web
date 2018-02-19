<?php

require_once 'vendor/autoload.php';
require_once 'common/commons.php';

require_once 'config.php';
require_once 'ET/ET.php';
require_once 'ET/Info.php';

define("TABLENAME", "masteret");
define("WEEKCOLUMN", "week");
define("YEARCOLUMN", "year");
define("DATACOLUMN", "data");

// Don't touch this, only things above
define("TABLECREATE", "CREATE TABLE IF NOT EXISTS " . TABLENAME . " ("
    . WEEKCOLUMN . " INT(11) NOT NULL,"
    . YEARCOLUMN . " INT(11) NOT NULL,"
    . DATACOLUMN . " TEXT DEFAULT NULL,"
    . "PRIMARY KEY (" . WEEKCOLUMN . "," . YEARCOLUMN . "))");

// Récup options de la commandline
$longoptions = [
    "week:",
    "year:",
    "info"
];
$in = Commons::parse_args($longoptions, $_GET);

if (isset($in['info'])) {
    // Info
    $info = new Info();
    $r = $info->get_from_db();

    Commons::output(json_encode($r));
} else {
    // Parser les arguments en int
    try {
        // Check for arg
        if (!isset($in['week'])
            || !isset($in['year'])) {
            throw new Exception("arguments non donnés");
        }

        // Check for int
        if (!ctype_digit($in['week'])
            || !ctype_digit($in['year'])) {
            throw new Exception("arguments non entiers");
        }

        // Parse
        $in['year'] = intval($in['year']);
        $in['week'] = intval($in['week']);

        // Check for range
        if (!Commons::check_in_range($in['week'], 0, 52)
            || !Commons::check_in_range($in['year'], 2017, 2018)) {
            throw new Exception("arguments externes à l'intervalle");
        }
    } catch (Exception $e) {
        Commons::debug_line("Valeur d'entrée invalide: " . $e->getMessage());
        Commons::output("{}");
        exit(0);
    }

    $et = new ET($in['year'], $in['week']);
    $res = $et->init();

    if ($res) {
        Commons::output(json_encode($et));
    } else {
        Commons::output("{}");
    }
}
