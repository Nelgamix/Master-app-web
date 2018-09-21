<?php

$annee_scolaire = 2018;
$a = [];
$first_d = new DateTime($annee_scolaire . "/09/03");

while (intval($first_d->format('Y')) < $annee_scolaire + 1 || intval($first_d->format("m")) < 8)
{
    $d = $first_d->format("Y-m-d");
    $w = intval($first_d->format("W"));
    $y = intval($first_d->format("Y"));
    $f = $first_d->modify('+4 days')->format("Y-m-d");
    $a[] = [
        "week" => $w,
        "year" => $y,
        "debut" => $d,
        "fin" => $f
    ];
    $first_d->modify('+3 days');
}

echo(json_encode($a));
