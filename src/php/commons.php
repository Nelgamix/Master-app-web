<?php

define("DEBUG", true); // print debug messages
define("DEBUGWEB", false); // if debug = true, then all debug messages will be formatted as html
define("LOCAL", true); // local installation?
define("TRUEOUTPUT", true); // show final result?

// DB infos
define("SERVERNAME", "skysurfoatnico.mysql.db");
define("DBNAME", "skysurfoatnico");
define("USERNAME", "skysurfoatnico");
define("PASSWORD", "eE80fdNQ");

// Don't change this
define("LOCALDB", "mysql:host=localhost;dbname=" . DBNAME);
define("WEBDB", "mysql:host=" . SERVERNAME . ";dbname=" . DBNAME);
define("DB", (LOCAL ? LOCALDB : WEBDB));

$section_number = 1;

if (DEBUG) {
    ini_set('display_errors', 1);
    ini_set('display_startup_errors', 1);
    error_reporting(E_ALL);
} else {
    ini_set('display_errors', 0);
    ini_set('display_startup_errors', 0);
    error_reporting(E_ERROR);
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
        $s = DEBUGWEB ? Commons::format_web($msg) : $msg;
        if (DEBUG) printf("%s", $s);
    }

    public static function debug_line(String $msg) {
        Commons::debug($msg . "\n");
    }

    public static function debug_section(String $sec) {
        Commons::debug_line("--- " . Commons::$section_number . " - " . strtoupper($sec) . " ---");
        Commons::$section_number++;
    }

    public static function clean($string) {
        return trim(preg_replace('/\s+/S', " ", preg_replace("/-/", "", $string)));
    }

    public static function deploy_array($array) {
        return implode(', ', $array);
    }
}
