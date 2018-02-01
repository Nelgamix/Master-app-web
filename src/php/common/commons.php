<?php

require_once 'BD.php';
require_once __DIR__.'/../config.php';

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

    public static function light_clean($string)
    {
        return trim(preg_replace('/\s+/S', " ", $string));
    }

    public static function clean($string) {
        return Commons::light_clean(preg_replace("/-/", "", $string));
    }

    public static function deploy_array($array) {
        return implode(', ', $array);
    }

    public static function check_in_range($val, $min, $max) {
        return ($val >= $min && $val <= $max);
    }

    public static function parse_args($opts, $get)
    {
        $in = getopt("", $opts);

        // Récup options de _GET
        foreach ($get as $k => $v)
        {
            $in[$k] = $v;
        }

        // Loop to print all elements
        Commons::debug_section("Arguments");
        foreach ($in as $k => $v)
        {
            Commons::debug_line("$k = $v");
            $res['request'][] = [
                "key" => $k,
                "value" => $v
            ];
        }

        return $in;
    }
}
