<?php
/**
 * Created by PhpStorm.
 * User: Kryoxem
 * Date: 30/01/2018
 * Time: 12:06
 */

use ICal\ICal;

require_once 'Cours.php';
require_once 'HoursDuration.php';

define("URLADE", "http://ade6-ujf-ro.grenet.fr/jsp/custom/modules/plannings/anonymous_cal.jsp?resources=9756&projectId=2&calType=ical&firstDate=%s&lastDate=%s");

class Data implements JsonSerializable
{
    const FORMAT_JOUR = "d-m-Y H:i";

    private $stats;
    private $cours;
    /**
     * @var DateTime
     */
    private $updated;

    /**
     * @var PDO
     */
    private $conn;
    private $data_in_db; // true if there is data of the week in db
    private $year; // Année
    private $week; // N° de semaine de l'année
    private $ical; // ICal
    private $url; // URL pour aller chercher les données depuis ADE

    /**
     * construct data from year (int) and week number (int)
     */
    public function __construct($year, $week)
    {
        Commons::debug_section("Creation de Data");
        $this->year = $year;
        $this->week = $week;
        $this->ical = new ICal();

        $diw = $this->days_in_week($this->year, $this->week);
        $debut = $diw[0];
        $fin = $diw[4];
        $this->url = sprintf(URLADE, $debut, $fin);
    }

    /**
     *   Returns every day as Php Datetime in a week
     *   E.g:
     *    0 => string '10/06/2013' (length=10)
     *    1 => string '11/06/2013' (length=10)
     *    2 => string '12/06/2013' (length=10)
     *    3 => string '13/06/2013' (length=10)
     *    4 => string '14/06/2013' (length=10)
     *    5 => string '15/06/2013' (length=10)
     *    6 => string '16/06/2013' (length=10)
     */
    private function days_in_week($year, $week)
    {
        $result = [];
        $datetime = new DateTime();
        $datetime->setISODate($year, $week, 1);
        $interval = new DateInterval('P1D');
        $week = new DatePeriod($datetime, $interval, 6);

        foreach ($week as $day) {
            $result[] = $day->format('Y-m-d');
        }

        return $result;
    }

    public function init($ade_online)
    {
        $need_ade = false;
        Commons::debug_line("Initialisation de Data");

        if (!DISCARDDB && !$need_ade && $this->connect_to_db()) // On se connecte à la BD
        {
            if ($this->init_from_db() && $this->data_in_db) // les données ont été récup depuis la BD
            {
                Commons::debug_line("Les données sont dans la BD");
                $d = clone $this->updated;
                $d->modify("+" . REFRESHINTERVAL . " minutes");
                $now = new DateTime("now");

                if ($now > $d && $ade_online) // On doit update depuis ADE
                {
                    Commons::debug_line("Les données de la BD ne sont pas à jour.");
                    $need_ade = true;
                }
            } else {
                Commons::debug_line("Les données ne sont pas dans la BD");
                $need_ade = true;
            }
        } else {
            Commons::debug_line("Impossible de se connecter à la BD, ou need_ade = true");
            $need_ade = true;
        }

        if ($need_ade) {
            if ($ade_online) {
                Commons::debug_line("ADE online, on récup");
                $this->init_from_ical();
                $this->write_on_db();

                return true;
            } else {
                Commons::debug_line("ADE est offline...");
                return false;
            }
        } else {
            return true;
        }
    }

    private function connect_to_db()
    {
        Commons::debug_line("Tentative de connexion a la BD");
        $ok = false;
        try {
            $dom = DB;
            Commons::debug_line("Connexion vers '" . $dom . "' (usr '" . USERNAME . "' mdp '" . PASSWORD . "')");
            $this->conn = new PDO($dom, USERNAME, PASSWORD);
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $this->conn->exec(TABLECREATE);
            $ok = true;
        } catch (PDOException $e) {
            Commons::debug_line("Erreur: " . $e->getMessage());
        }

        return $ok;
    }

    private function init_from_db()
    {
        Commons::debug_line("Initialisation depuis la BD");
        if (!isset($this->conn)) {
            return false;
        }

        $this->reset_data();

        try {
            $s = $this->conn->prepare("SELECT " . DATACOLUMN . " FROM `" . TABLENAME . "` WHERE " . WEEKCOLUMN . " = :week AND " . YEARCOLUMN . " = :year LIMIT 1");
            $s->bindParam(':year', $this->year);
            $s->bindParam(':week', $this->week);
            $s->execute();

            if ($s->rowCount() == 1) {
                $json = json_decode($s->fetch(PDO::FETCH_ASSOC)["data"]);
                $this->data_in_db = true;

                $this->stats = $json->stats;
                $this->cours = $json->cours;
                $this->updated = new DateTime($json->updated);
            } else {
                $this->data_in_db = false;
            }

            return true;
        } catch (PDOException $e) {
            Commons::debug_line("Erreur: " . $e->getMessage());
            return false;
        }
    }

    private function reset_data()
    {
        $this->cours = [];
        $this->stats = null;
    }

    private function init_from_ical()
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

        Commons::debug_section("Ajout des cours");
        foreach ($events as $event) {
            $this->ajout_cours($event);
        }

        $this->updated = new DateTime("now");
        //$this->calculate_stats();

        return true;
    }

    private function ajout_cours($event)
    {
        $dtstart = $this->ical->iCalDateToDateTime($event->dtstart_array[3], true);
        $dtend = $this->ical->iCalDateToDateTime($event->dtend_array[3], true);

        $dtstart->setTimezone(new DateTimeZone("Europe/Paris"));
        $dtend->setTimezone(new DateTimeZone("Europe/Paris"));

        $this->cours[] = new Cours($event->summary, $dtstart, $dtend, $event->description, $event->location);
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
    }

    private function write_on_db()
    {
        Commons::debug_line("Ecriture sur BD");
        if (!isset($this->conn)) {
            return false;
        }

        $jsn = json_encode($this->jsonSerialize());
        if ($this->data_in_db) {
            $u = $this->conn->prepare("UPDATE `" . TABLENAME . "` SET " . DATACOLUMN . " = :data WHERE " . WEEKCOLUMN . " = :week AND " . YEARCOLUMN . " = :year");
            $u->bindParam(':week', $this->week);
            $u->bindParam(':year', $this->year);
            $u->bindParam(':data', $jsn);

            $u->execute();
        } else {
            $i = $this->conn->prepare("INSERT INTO `" . TABLENAME . "` (" . WEEKCOLUMN . ", " . YEARCOLUMN . ", " . DATACOLUMN . ") VALUES (:week, :year, :data)");
            $i->bindParam(':week', $this->week);
            $i->bindParam(':year', $this->year);
            $i->bindParam(':data', $jsn);

            $i->execute();
        }

        return true;
    }

    /**
     * returns a json object corresponding to the state of this object
     */
    public function jsonSerialize()
    {
        return [
            'year' => $this->year,
            'week' => $this->week,
            'stats' => $this->stats,
            'updated' => $this->updated->format(self::FORMAT_JOUR),
            'cours' => $this->cours
        ];
    }

    public function get_url()
    {
        return $this->url;
    }
}