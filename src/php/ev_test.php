<?php

require_once 'common/commons.php';

define("SCRIPT", "C:\\xampp\\php\\php.exe ev.php");
define("OUTPUT_SCRIPT", true);

if (strlen(session_id() > 0)) session_destroy();

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

    Commons::debug_line("\n");
    $out = json_decode(end($outstr), true);
}

// basic testing
exec_script($out);
assert($out['admin'] == false, "admin should be false");
assert($out['success'] == false, "since we didn't specify any req type, success should be false");

// get
exec_script($out, "--req get");
assert($out['success'] == true, "success should be true");
assert($out['Semaine'] != null, "data should be present");

// try to log in
exec_script($out, "--req login --psw mdptest");
assert($out['admin'] == true, "admin should be true");
