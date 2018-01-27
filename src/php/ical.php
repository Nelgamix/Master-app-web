<?php

require_once 'vendor/autoload.php';
require_once 'commons.php';

use ICal\ICal;

define("URLTIMEOUT", 4); // request timeout before considering that ADE is down
define("REFRESHINTERVAL", 2 * 60); // Refresh ical each REFRESHINTERVAL minutes

define("TABLENAME", "masteret");
define("WEEKCOLUMN", "week");
define("YEARCOLUMN", "year");
define("DATACOLUMN", "data");

// Don't touch this, only things above
define("TABLECREATE", "CREATE TABLE IF NOT EXISTS " . TABLENAME . " ("
    . WEEKCOLUMN . " INT(11) NOT NULL,"
    . YEARCOLUMN . " INT(11) NOT NULL,"
    . DATACOLUMN . " TEXT DEFAULT NULL,"
    . "PRIMARY KEY (" . WEEKCOLUMN . "," . YEARCOLUMN . "))");

define("URLADE", "http://ade6-ujf-ro.grenet.fr/jsp/custom/modules/plannings/anonymous_cal.jsp?resources=9756&projectId=2&calType=ical&firstDate=%s&lastDate=%s");

/**
 * Classe pour stocker le total d'heures (stats)
 */
class HoursDuration
{
    private $minutes;

    public function __construct()
    {
        $this->minutes = 0;
    }

    public function add(DateInterval $interval)
    {
        $str = $interval->format("%H:%i");
        $strsp = explode(":", $str);

        $this->minutes += (60 * intval($strsp[0]));
        $this->minutes += intval($strsp[1]);
    }

    public function divide($n)
    {
        $this->minutes /= $n;
    }

    public function format()
    {
        $h = floor($this->minutes / 60);
        $m = $this->minutes % 60;
        return $h . ":" . str_pad(strval($m), 2, "0");
    }
}

/**
 * Class to represent a course
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
        Commons::debug_section("Création d'ICAL");
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
        if (preg_match("/\b(?!INFO)[A-Z]+ [A-Z][a-z|éèàî-]+/", $this->description, $matches) > 0) {
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

/**
 * Class to represent the data we store in DB and get from ICal
 */
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
        Commons::debugline("Initialisation de Data");

        if (!$need_ade && $this->connect_to_db()) // On se connecte à la BD
        {
            if ($this->init_from_db() && $this->data_in_db) // les données ont été récup depuis la BD
            {
                $d = clone $this->updated;
                $d->modify("+" . REFRESHINTERVAL . " minutes");
                $now = new DateTime("now");

                if ($now > $d && $ade_online) // On doit update depuis ADE
                {
                    $need_ade = true;
                }
            } else {
                $need_ade = true;
            }
        } else {
            $need_ade = true;
        }

        if ($need_ade) {
            if ($ade_online) {
                $this->init_from_ical();
                $this->write_on_db();

                return true;
            } else {
                return false;
            }
        } else {
            return true;
        }
    }

    private function connect_to_db()
    {
        Commons::debugline("Tentative de connexion a la BD");
        $ok = false;
        try {
            $dom = DB;
            Commons::debugline("Connexion vers '" . $dom . "' (usr '" . USERNAME . "' mdp '" . PASSWORD . "')");
            $this->conn = new PDO($dom, USERNAME, PASSWORD);
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $this->conn->exec(TABLECREATE);
            $ok = true;
        } catch (PDOException $e) {
            Commons::debugline("error: " . $e->getMessage());
        }

        return $ok;
    }

    private function init_from_db()
    {
        Commons::debugline("Initialisation depuis la BD");
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
        Commons::debugline("Initialisation depuis l'ICal");
        $this->reset_data();

        try {
            $this->ical->defaultTimeZone = "UTC";
            $this->ical->initUrl($this->url);
        } catch (\Exception $e) {
            return false;
        }

        $events = $this->ical->sortEventsWithOrder($this->ical->events());

        foreach ($events as $event) {
            $this->ajout_cours($event);
        }

        $this->updated = new DateTime("now");
        //$this->calculate_stats();

        return true;
    }

    private function ajout_cours($event)
    {
        Commons::debugline("Ajout d'un nouveau cours");
        $dtstart = $this->ical->iCalDateToDateTime($event->dtstart_array[3], true);
        $dtend = $this->ical->iCalDateToDateTime($event->dtend_array[3], true);

        $dtstart->setTimezone(new DateTimeZone("Europe/Paris"));
        $dtend->setTimezone(new DateTimeZone("Europe/Paris"));

        $this->cours[] = new Cours($event->summary, $dtstart, $dtend, $event->description, $event->location);
    }

    private function calculate_stats()
    {
        Commons::debugline("Calculate stats");
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
        Commons::debugline("Write on DB");
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

/**
 * Class to represent the ET ('emploi du temps')
 */
class ET implements JsonSerializable
{
    private $data;
    private $ade_online;
    private $ok;

    public function __construct($year, $week)
    {
        Commons::debugline("week $week, year $year");
        ini_set('default_socket_timeout', URLTIMEOUT);
        Commons::debugline("Creation de Data");
        $this->data = new Data($year, $week);
    }

    public function jsonSerialize()
    {
        return [
            "ade-online" => $this->ade_online,
            "ok" => $this->ok,
            "data" => $this->data
        ];
    }

    public function print()
    {
        Commons::output(json_encode($this));
    }

    public function get_response()
    {
        $this->ade_online = $this->test_url($this->data->get_url());
        //$this->ade_online = false; // Pour tester en cas d'offline

        $this->ok = $this->data->init($this->ade_online);

        return true;
    }

    /**
     * returns 1 if url works (website online), 0 if not
     */
    private function test_url($url)
    {
        Commons::debug_section("test ade");
        $headers = get_headers($url, 1)[0];
        Commons::debug("ADE code ");
        $code = explode(" ", $headers)[1];
        Commons::debugline($code);
        return (200 <= $code) && ($code < 400);
    }
}

if (!isset($_GET['week'])) {
    $week = 4;
} else {
    $week = intval($_GET['week']);
}

if (!isset($_GET['year'])) {
    $year = 2018;
} else {
    $year = intval($_GET['year']);
}

if ($week < 1 || $week > 52) {
    $week = 4;
}

if ($year < 2017 || $year > 2018) {
    $year = 2018;
}

Commons::debug_section("Creation de l'ET");
$et = new ET($year, $week);
Commons::debugline("Fin creation ET");

$res = $et->get_response();
if ($res) {
    $et->print();
}
