<?php

require_once 'vendor/autoload.php';
require_once 'commons.php';

require_once 'ET/ET.php';

define("URLTIMEOUT", 4); // request timeout before considering that ADE is down
define("REFRESHINTERVAL", 2 * 60); // Refresh ical each REFRESHINTERVAL minutes
define("DISCARDDB", true);

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

if (!isset($_GET['week'])) {
    $week = 4;
} else {
    $week = intval($_GET['week']);
}

if (!isset($_GET['year'])) {
    $year = 2018;
} else {
    $year = intval($_GET['year']);
}

if ($week < 1 || $week > 52) {
    $week = 4;
}

if ($year < 2017 || $year > 2018) {
    $year = 2018;
}

$et = new ET($year, $week);
$res = $et->get_response();

if ($res) {
    $et->print();
}
