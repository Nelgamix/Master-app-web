<?php
	$to = 'nicolas.huchet@skysurf.fr, loic.houdebine@wanadoo.fr';
	$sb = 'master.skysurf: nouveau message';

	/*
J'ai une idée: on test le champ?
Sinon ça peut passer... &hellip; &larr; <script>alert('truc');</script> (503)
	 */

	function between($val, $min, $max, $inclusive=false)
	{
		if ($inclusive)
		{
			return $min <= $val && $val <= $max;
		}
		else
		{
			return $min < $val && $val < $max;
		}
	}

	// les vérifs retournent null si le champ est mauvais, sinon le champ est corrigé et renvoyé
	function verif_email($email)
	{
		if (!isset($email))
		{
			return null;
		}

		if (filter_var($email, FILTER_VALIDATE_EMAIL))
		{
			return $email;
		}
		else
		{
			return null;
		}
	}

	function verif_sujet($sujet)
	{
		if (!isset($sujet))
		{
			return null;
		}
		
		if (between(strlen($sujet), 0, 30))
		{
			return $sujet;
		}

		// else
		return null;
	}

	function verif_message($message)
	{
		if (!isset($message))
		{
			return null;
		}
		
		if (between(strlen($message), 0, 500))
		{
			return stripcslashes(preg_replace('/(?<!\r)\n/', '\r\n', $message));
		}

		// else
		return null;
	}

	$res = [
		"success" => false,
		"erreur" => "",
		"recu" => ""
	];

	$email = verif_email($_GET['email']);
	$sujet = verif_sujet($_GET['sujet']);
	$message = verif_message(base64_decode($_GET['message']));

	if (isset($sujet) && isset($message))
	{
		$sb .= ' (sujet: ' . $sujet . ')';
		$txt = "";
		if (isset($email))
		{
			$txt .= "Email de l'auteur: " . $email . "\r\n";
		}

		$txt .= "Sujet du message: " . $sujet . "\r\n";
		$txt .= "Message (à la ligne)\r\n" . $message;

		$txt = wordwrap($txt, 70, "\r\n");

		//echo($txt);
		mail($to, $sb, $txt);
		$res['recu'] = $txt;

		$res['success'] = true;
	}
	else
	{
		$res['success'] = false;
		$res['erreur'] = "Sujet ou message non spécifié";
	}

	echo(json_encode($res));
?>