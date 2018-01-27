<?php

define("DEBUG", false);
define("TRUEOUTPUT", true);
define("FORMATWEB", false);

define("SERVERNAME", "skysurfoatnico.mysql.db");
define("DBNAME", "skysurfoatnico");
define("USERNAME", "skysurfoatnico");
define("PASSWORD", "eE80fdNQ");
define("LOCALDB", "mysql:host=localhost;dbname=" . DBNAME);
define("WEBDB", "mysql:host=" . SERVERNAME . ";dbname=" . DBNAME);
define("DB" , (DEBUG ? LOCALDB : WEBDB));

$section_number = 1;

if (DEBUG) {
    ini_set('display_errors', 1);
    ini_set('display_startup_errors', 1);
    error_reporting(E_ALL);
}

class Commons {
    private static $section_number = 1;

    public static function format_web(String $msg) {
        return str_replace("\n", "<br />", $msg);
    }

    public static function output(String $output) {
        if (TRUEOUTPUT) printf("%s", $output);
    }

    public static function debug(String $msg) {
        $s = FORMATWEB ? Commons::format_web($msg) : $msg;
        if (DEBUG) printf("%s", $s);
    }

    public static function debugline(String $msg) {
        Commons::debug($msg . "\n");
    }

    public static function debug_section(String $sec) {
        Commons::debugline("--- " . Commons::$section_number . " - " . strtoupper($sec) . " ---");
        Commons::$section_number++;
    }

    public static function clean($string)
    {
        return trim(preg_replace('/\s+/S', " ", preg_replace("/-/", "", $string)));
    }

    public static function deploy_array($array)
    {
        return implode(', ', $array);
    }
}
