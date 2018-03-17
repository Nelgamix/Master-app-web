<?php

require_once __DIR__.'/../src/common/Commons.php';

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
exec_script($out, "--from_week no --from_year 2018");
assert(isset($out), "out should exist");

// basic testing (wrong range)
exec_script($out, "--from_week 56 --from_year 2018");
assert(isset($out), "out should exist");

// normal test
exec_script($out, "--from_week 10 --from_year 2018");
assert($out['metadata'] == true, "ok should be true");
assert($out['semaines'] != null, "data should be present");

// Info test
exec_script($out, "--info");
