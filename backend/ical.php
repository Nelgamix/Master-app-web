<?php

require_once 'vendor/autoload.php';
require_once 'src/common/Commons.php';

require_once 'config.php';
require_once 'src/ET/ET.php';
require_once 'src/ET/Info.php';

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
    "from_week:",
    "from_year:",
    "to_week:",
    "to_year:",
    "nb_weeks:",
    "info"
];
$in = Commons::parse_args($longoptions, $_GET);

$is = new ETIntervalSelection();

try
{
    // TODO: factoriser
    if (isset($in['info']))
    {
        $is->set_options(false, true);
        $is->select_all_weeks();
    }
    else if (isset($in['from_week']) && isset($in['from_year']) && isset($in['to_week']) && isset($in['to_year']))
    {
        $fw = Commons::parse_check_int($in['from_week'], 0, 52);
        $fy = Commons::parse_check_int($in['from_year'], 2017, 2018);
        $tw = Commons::parse_check_int($in['to_week'], 0, 52);
        $ty = Commons::parse_check_int($in['to_year'], 2017, 2018);
        $is->select_multiple_to_weeks($fw, $fy, $tw, $ty);
    }
    else if (isset($in['from_week']) && isset($in['from_year']) && isset($in['nb_weeks']))
    {
        $fw = Commons::parse_check_int($in['from_week'], 0, 52);
        $fy = Commons::parse_check_int($in['from_year'], 2017, 2018);
        $nb = Commons::parse_check_int($in['nb_weeks'], 1, 10);
        $is->select_multiple_nb_weeks($fw, $fy, $nb);
    }
    else if (isset($in['from_week']) && isset($in['from_year']))
    {
        $fw = Commons::parse_check_int($in['from_week'], 0, 52);
        $fy = Commons::parse_check_int($in['from_year'], 2017, 2018);
        $is->select_unique_week($fw, $fy);
    }
}
catch (RuntimeException $e)
{
    Commons::debug_line("Number exception: " . $e->getMessage());
}

if (!$is->add_selection())
{
    Commons::debug_line("Problème dans le choix des semaines. Vérifiez les valeurs envoyées puis réessayez.");
    Commons::output("{}");
    exit(0);
}

$et = new ET($is);
$et->init();
Commons::output(json_encode($et));
