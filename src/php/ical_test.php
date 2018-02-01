<?php

require_once 'common/commons.php';

define("SCRIPT", "C:\\xampp\\php\\php.exe ical.php");
define("OUTPUT_SCRIPT", true);

function exec_script(&$out, $options = "")
{
    Commons::debug_section(($options !== "" ? $options : "no arg"));
    exec(SCRIPT . " " . $options, $outstr);

    if (OUTPUT_SCRIPT) {
        foreach ($outstr as $l)
        {
            Commons::debug_line("\t" . $l);
        }
    }

    Commons::debug_line("");
    $out = json_decode(end($outstr), true);
}

// basic testing (no arg)
exec_script($out);
assert(isset($out), "out should exist");

// basic testing (wrong arg)
exec_script($out, "--week no --year 2018");
assert(isset($out), "out should exist");

// basic testing (wrong range)
exec_script($out, "--week 56 --year 2018");
assert(isset($out), "out should exist");

// 2018 5
exec_script($out, "--week 5 --year 2018");
assert($out['ok'] == true, "ok should be true");
assert($out['data'] != null, "data should be present");
