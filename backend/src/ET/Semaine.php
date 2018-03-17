<?php

require_once 'ADEICal.php';
require_once 'Cours.php';

class Semaine implements JsonSerializable
{
    const FORMAT_JOUR = "d-m-Y H:i";

    private $adeical;
    private $db;
    private $data_in_db; // true if there is data of the week in db

    private $year; // Année
    private $week; // N° de semaine de l'année
    private $stats;
    private $updated;
    private $cours;

    private $options;

    /**
     * Semaine constructor.
     * @param int $week
     * @param int $year
     * @param array $options
     */
    public function __construct(int $week, int $year, array $options)
    {
        $this->options = $options;
        $this->week = $week;
        $this->year = $year;

        $diw = $this->days_in_week($this->week, $this->year);
        $debut = $diw[0];
        $fin = $diw[4];

        // Ouverture de connexion à la BD
        if (!$this->options['discard_db'])
        {
            $this->db = new BD();
            if (!$this->connect_to_db())
            {
                Commons::debug_line("Connexion BD échouée.");
            }
        }

        if (!$this->options['discard_ade'])
        {
            $this->adeical = new ADEICal($debut, $fin);
        }

        Commons::debug_section("Creation de la semaine " . $week . " " . $year);
        Commons::debug_line("Jours de la semaine: " . json_encode($diw));
    }

    public function init($ade_online): bool
    {
        Commons::debug_section("Initialisation de la semaine");

        if (!$this->options['discard_db'])
        {
            if ($this->db->is_connected())
            {
                if ($this->init_from_db() && $this->data_in_db) // les données ont été récup depuis la BD
                {
                    Commons::debug_line("Les données sont dans la BD");
                    $d = clone $this->updated;
                    $d->modify("+" . REFRESHINTERVAL . " minutes");
                    $now = new DateTime("now");

                    if ($now > $d && !$this->options['discard_ade'] && $ade_online) // On doit update depuis ADE
                    {
                        Commons::debug_line("Les données de la BD ne sont pas à jour.");
                    }
                    else
                    {
                        return true;
                    }
                }
                else
                {
                    Commons::debug_line("Les données ne sont pas dans la BD");
                }
            }
        }

        if (!$this->options['discard_ade'] && $ade_online)
        {
            Commons::debug_line("ADE online, on récupère les données");
            if ($this->init_from_ical())
            {
                if ($this->options['update_db'])
                {
                    $this->write_on_db();
                }

                return true;
            }
            else
            {
                return false;
            }
        }

        return false;
    }

    /**
     *   Returns every day as string formatted 'Y-m-d' in a week
     *   E.g:
     *    0 => string '10/06/2013' (length=10)
     *    1 => string '11/06/2013' (length=10)
     *    2 => string '12/06/2013' (length=10)
     *    3 => string '13/06/2013' (length=10)
     *    4 => string '14/06/2013' (length=10)
     *    5 => string '15/06/2013' (length=10)
     *    6 => string '16/06/2013' (length=10)
     * @param $week int
     * @param $year int
     * @return array
     */
    private function days_in_week(int $week, int $year)
    {
        $result = [];

        $debut = new DateTime();
        $debut->setISODate($year, $week);

        $fin = new DateTime();
        $fin->setISODate($year, $week);
        $fin->modify('+7 days');

        try
        {
            $interval = new DateInterval('P1D');
            $week = new DatePeriod($debut, $interval, $fin);

            foreach ($week as $day)
            {
                $result[] = $day->format('Y-m-d');
            }
        }
        catch (Exception $e)
        {
            Commons::debug_line('Erreur dans la fonction days_in_week: ' . $e->getMessage());
        }

        return $result;
    }

    private function connect_to_db()
    {
        $ok = $this->db->connect();

        if ($ok) {
            $this->db->exec(TABLECREATE);
        }

        return $ok;
    }

    private function init_from_db()
    {
        Commons::debug_line("Initialisation depuis la BD");
        if (!$this->db->is_connected()) {
            return false;
        }

        $c = $this->db->get_connection();

        try {
            $s = $c->prepare("SELECT " . DATACOLUMN . " FROM `" . TABLENAME . "` WHERE " . WEEKCOLUMN . " = :week AND " . YEARCOLUMN . " = :year LIMIT 1");
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

    private function init_from_ical()
    {
        Commons::debug_line("Initialisation depuis l'ICal");

        $this->adeical->download_cours();
        $this->stats = $this->adeical->getStats();
        $this->cours = $this->adeical->getCours();
        $this->updated = $this->adeical->getUpdated();

        return true;
    }

    private function write_on_db()
    {
        Commons::debug_line("Ecriture sur BD");
        if (!$this->db->is_connected()) {
            return false;
        }

        $c = $this->db->get_connection();
        $jsn = json_encode($this->jsonSerialize());
        if ($this->data_in_db) {
            $u = $c->prepare("UPDATE `" . TABLENAME . "` SET " . DATACOLUMN . " = :data WHERE " . WEEKCOLUMN . " = :week AND " . YEARCOLUMN . " = :year");
            $u->bindParam(':week', $this->week);
            $u->bindParam(':year', $this->year);
            $u->bindParam(':data', $jsn);

            $u->execute();
        } else {
            $i = $c->prepare("INSERT INTO `" . TABLENAME . "` (" . WEEKCOLUMN . ", " . YEARCOLUMN . ", " . DATACOLUMN . ") VALUES (:week, :year, :data)");
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
}
