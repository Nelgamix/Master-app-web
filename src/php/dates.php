<?php
	$annee_scolaire = 2017;
	$a = [];
	$first_d = new DateTime($annee_scolaire . "/09/04");

	while (intval($first_d->format('Y')) < $annee_scolaire+1 || intval($first_d->format("m")) < 8)
	{
		$d = $first_d->format("Y-m-d");
		$w = $first_d->format("W");
		$y = $first_d->format("Y");
		$f = $first_d->modify('+4 days')->format("Y-m-d");
		$a[] = [
			"week" => $w,
			"year" => $y,
			"debut" => $d,
			"fin" => $f,
		];
		$first_d->modify('+3 days');
	}

	echo(json_encode($a));
?>