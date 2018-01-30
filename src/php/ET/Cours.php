<?php
/**
 * Created by PhpStorm.
 * User: Kryoxem
 * Date: 30/01/2018
 * Time: 12:05
 */

class Cours implements JsonSerializable
{
    const FORMAT_JOUR = "d-m-Y H:i";
    const FORMAT_DUREE = "%h:%I";

    private $nom;
    private $debut;
    private $fin;
    private $professeur;
    private $description;
    private $salle;
    private $duree;
    private $type;
    private $groupe;

    function __construct($nom, $debut, $fin, $summary, $location)
    {
        Commons::debug("Création d'un cours: ");
        $this->nom = $nom;
        $this->debut = $debut;
        $this->fin = $fin;
        $this->description = Commons::clean(preg_replace("/\(Exporté le.+\)/", "", $summary));
        $this->salle = $location;

        // Par défaut
        $this->professeur = "";
        $this->duree = $debut->diff($fin);
        $this->type = "";
        $this->groupe = [];

        // Analyse
        if (preg_match("/\b(?!INFO)[A-Z]+ [A-Z][a-z|éèàîô-]+/", $this->description, $matches) > 0) {
            $this->professeur = $matches[0];
        }

        $a = ["nom", "salle", "description"]; // On recherche le type dans ces éléments de la classe
        $found = false;
        foreach ($a as $ab) {
            if (preg_match("/(TP|TD)\/(TP|TD)|TD|TP|Cours/", $this->$ab, $matches) > 0) {
                $this->type = $matches[0];
                $found = true;
                break;
            }
        }

        if ($found) {
            foreach ($a as $ab) {
                $this->$ab = str_replace($this->type, "", $this->$ab);
            }
        }

        if (preg_match_all("/G([0-9])|R([0-9])|GRP ([0-9a-z])|GROUPE ([0-9a-z])/i", $this->nom, $matches, PREG_SET_ORDER) > 0) {
            foreach ($matches as $match) {
                for ($i = 1; $i < count($match); $i++) {
                    if ($match[$i] !== "") {
                        $this->groupe[] = $match[$i];
                        break;
                    }
                }

                $this->nom = str_replace($match[0], "", $this->nom);
            }
        }

        if ($this->salle == "") // on regarde dans le nom
        {
            if (preg_match_all("/(?:salle )?([a-z0-9]+ [a-z]?[0-9]+)/i", $this->nom, $matches, PREG_SET_ORDER) > 0) {
                foreach ($matches as $match) {
                    $this->salle .= $match[1];
                    $this->nom = str_replace($match[0], "", $this->nom);
                }
            }
        }

        $this->clean_all();

        Commons::debug_line($this->nom . " " . $this->professeur . " " . $this->salle);
    }

    private function clean_all()
    {
        $this->nom = Commons::clean($this->nom);
        $this->salle = Commons::clean($this->salle);
        $this->description = Commons::clean($this->description);
    }

    public function jsonSerialize()
    {
        return [
            'nom' => mb_convert_encoding($this->nom, "UTF-8"),
            'debut' => $this->debut->format(self::FORMAT_JOUR),
            'fin' => $this->fin->format(self::FORMAT_JOUR),
            'duree' => $this->duree->format(self::FORMAT_DUREE),
            'professeur' => mb_convert_encoding($this->professeur, "UTF-8"),
            'description' => mb_convert_encoding($this->description, "UTF-8"),
            'salle' => mb_convert_encoding($this->salle, "UTF-8"),
            'type' => mb_convert_encoding($this->type, "UTF-8"),
            'groupe' => Commons::deploy_array($this->groupe)
        ];
    }

    public function get_duree()
    {
        return $this->duree;
    }
}