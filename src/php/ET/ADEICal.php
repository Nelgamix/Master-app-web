<?php

use ICal\ICal;

require_once 'Cours.php';
require_once 'HoursDuration.php';

class ADEICal
{
    private $url;
    private $ical;
    private $cours;
    private $stats;
    private $updated;

    function __construct($debut, $fin)
    {
        Commons::debug_section("Creation d'ical");
        $this->ical = new ICal();
        $this->url = sprintf(URLADE, $debut, $fin);
        Commons::debug_line("URL ADE formattée: " . $this->url);
    }

    function download_cours()
    {
        Commons::debug_line("Initialisation depuis l'ICal");

        $this->reset_data();

        try {
            $this->ical->defaultTimeZone = "UTC";
            $this->ical->initUrl($this->url);
        } catch (\Exception $e) {
            return false;
        }

        $events = $this->ical->sortEventsWithOrder($this->ical->events());
        if (FLUSHICAL)
        {
            Commons::debug_section("Flush ical");
            foreach ($events as $event)
            {
                Commons::debug_line($event->description);
            }
        }

        Commons::debug_section("Ajout des cours");
        foreach ($events as $event) {
            $this->ajout_cours($event);
        }

        $this->updated = new DateTime("now");
        $this->calculate_stats();

        return $this->cours;
    }

    /**
     * @return mixed
     */
    public function getCours()
    {
        return $this->cours;
    }

    /**
     * @return mixed
     */
    public function getStats()
    {
        return $this->stats;
    }

    /**
     * @return string
     */
    public function getUrl(): string
    {
        return $this->url;
    }

    /**
     * @return mixed
     */
    public function getUpdated()
    {
        return $this->updated;
    }

    private function ajout_cours($event)
    {
        try {
            $dtstart = $this->ical->iCalDateToDateTime($event->dtstart_array[3], true);
            $dtend = $this->ical->iCalDateToDateTime($event->dtend_array[3], true);
        } catch (\ICal\Exception $e) {
            Commons::debug_line("Exception ICal, dans ajout_cours. " . $e->getMessage());
        }

        $dtstart->setTimezone(new DateTimeZone("Europe/Paris"));
        $dtend->setTimezone(new DateTimeZone("Europe/Paris"));

        $objcours = [
            "nom" => $event->summary,
            "debut" => $dtstart,
            "fin" => $dtend,
            "duree" => $dtstart->diff($dtend),
            "description" => Commons::light_clean(preg_replace("/\(Exporté le.+\)/", "", $event->description)),
            "professeur" => "",
            "salle" => $event->location,
            "type" => "",
            "groupe" => []
        ];

        // Analyse
        if (preg_match("/\b(?!INFO|MOSIG|ORCO)[A-Z|-]+ [A-Z][a-z|éèëàîïô]+(-[A-Z][a-z]+)?/", $objcours['description'], $matches) > 0) {
            $objcours['professeur'] = $matches[0];
        }

        $a = ["nom", "salle", "description"]; // On recherche le type dans ces éléments de la classe
        $found = false;
        foreach ($a as $ab) {
            if (preg_match("/(C|Cours|TD)\/(TD|TP)|TD|TP|Cours/", $objcours[$ab], $matches) > 0) {
                $objcours['type'] = $matches[0];
                $found = true;
                break;
            }
        }

        if ($found) {
            foreach ($a as $ab) {
                $objcours[$ab] = str_replace($objcours['type'], "", $objcours[$ab]);
            }
        }

        if (preg_match_all("/G([0-9])|R([0-9])|GRP ([0-9a-z])|GROUPE ([0-9a-z])/i", $objcours['nom'], $matches, PREG_SET_ORDER) > 0) {
            foreach ($matches as $match) {
                for ($i = 1; $i < count($match); $i++) {
                    if ($match[$i] !== "") {
                        $objcours['groupe'][] = $match[$i];
                        break;
                    }
                }

                $objcours['nom'] = str_replace($match[0], "", $objcours['nom']);
            }
        }

        if ($objcours['salle'] == "") // on regarde dans le nom
        {
            if (preg_match_all("/(FABLAB)|(?:salle )?([a-z0-9]+ [a-z]?[0-9]+)/i", $objcours['nom'], $matches, PREG_SET_ORDER) > 0) {
                foreach ($matches as $match) {
                    $objcours['salle'] .= $match[1];
                    $objcours['nom'] = str_replace($match[0], "", $objcours['nom']);
                }
            }
        }

        if (substr($objcours['nom'], 0, 2) === "C ") // on a reconnu un Cours
        {
            $objcours['type'] = 'CM';
            $objcours['nom'] = substr($objcours['nom'], 2, strlen($objcours['nom']) - 2);
        }

        $objcours['type'] = str_replace('Cours', 'CM', $objcours['type']);
        $objcours['type'] = str_replace('C/', 'CM/', $objcours['type']);

        $objcours['nom'] = str_replace('&amp;', '&', $objcours['nom']);
        $objcours['nom'] = Commons::clean($objcours['nom']);
        $objcours['salle'] = Commons::clean($objcours['salle']);
        $objcours['description'] = Commons::clean($objcours['description']);

        $this->cours[] =
                new Cours($objcours['nom'],
                        $objcours['debut'],
                        $objcours['fin'],
                        $objcours['duree'],
                        $objcours['description'],
                        $objcours['professeur'],
                        $objcours['salle'],
                        $objcours['type'],
                        $objcours['groupe']);
    }

    private function reset_data()
    {
        $this->cours = [];
        $this->stats = null;
    }

    private function calculate_stats()
    {
        Commons::debug_line("Calculate stats");
        $this->stats = null;
        $total = new HoursDuration();

        foreach ($this->cours as $cours) {
            $total->add($cours->get_duree());
        }

        $moyenne_cours = clone $total;
        $n = count($this->cours);
        if ($n > 0) {
            $moyenne_cours->divide($n);
        }

        $moyenne_semaine = clone $total;
        $moyenne_semaine->divide(5);

        $this->stats = [
            "total" => $total->format(),
            "moyenne-cours" => $moyenne_cours->format(),
            "moyenne-semaine" => $moyenne_semaine->format()
        ];

        return $this->stats;
    }
}
