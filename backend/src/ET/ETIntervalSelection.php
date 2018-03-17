<?php

class ETIntervalSelection
{
    /**
     * -1 = no selection
     * 0 = all
     * 1 = from week and year (to x weeks)
     * 2 = unique week (from_week and from_year)
     * @var int type of the interval
     */
    private $type;
    private $from_week; // from week number
    private $from_year; // from week year
    private $nb_weeks; // number of weeks from start (from_week and from_year)

    /**
     * @var array containing all the weeks selected.
     */
    private $weeks_selected;

    private $options = [
        'update_db' => true,
        'discard_ade' => false,
        'discard_db' => false
    ];

    function __construct()
    {
        $this->weeks_selected = [];
        $this->set_interval(-1, 0, 0, 0);
    }

    public function select_all_weeks(): void
    {
        $this->set_interval(0, 0, 0, 0);
    }

    public function select_unique_week(int $week, int $year): void
    {
        $this->set_interval(2, $week, $year, 0);
    }

    public function select_multiple_nb_weeks(int $from_week, int $from_year, int $nb_weeks): void
    {
        $this->set_interval(1, $from_week, $from_year, $nb_weeks);
    }

    public function select_multiple_to_weeks(int $from_week, int $from_year, int $to_week, int $to_year): void
    {
        // Verify input
        if ($from_year > $to_year || $from_year === $to_year && $from_week > $to_week)
        {
            return;
        }

        $d = $this->get_datetime_from_week_year($from_week, $from_year);
        $dw = $this->get_number_from_datetime($d, 'W');
        $dy = $this->get_number_from_datetime($d, 'Y');
        $nb = 0;
        while ($dy !== $to_year || $dw !== $to_week)
        {
            $d->modify('+1 week');
            $dw = $this->get_number_from_datetime($d, 'W');
            $dy = $this->get_number_from_datetime($d, 'Y');
            $nb++;
        }

        $this->set_interval(1, $from_week, $from_year, $nb);
    }

    public function add_selection(): bool
    {
        switch ($this->type)
        {
            case -1:
                return false;
            case 0:
                $info = new Info();
                foreach ($info->get_from_db() as $r)
                {
                    $this->weeks_selected[] = [$r[0], $r[1]];
                }
                break;
            case 1:
                $this->weeks_selected[] = [$this->from_week, $this->from_year];
                $d = $this->get_datetime_from_week_year($this->from_week, $this->from_year);
                for ($i = 1; $i < $this->nb_weeks; $i++)
                {
                    $dw = $this->get_number_from_datetime($d, 'W');
                    $dy = $this->get_number_from_datetime($d, 'Y');
                    $this->weeks_selected[] = [$dw, $dy];
                }
                break;
            case 2:
                $this->weeks_selected[] = [$this->from_week, $this->from_year];
                break;
            default:
                Commons::debug_line('Mauvais type dans l\'interval à process.');
                return false;
        }

        $this->type = -1;
        return true;
    }

    public function clear_selection()
    {
        $this->weeks_selected = [];
    }

    /**
     * @return array
     */
    public function getWeeksSelected(): array
    {
        return $this->weeks_selected;
    }

    /**
     * @return array
     */
    public function getOptions(): array
    {
        return $this->options;
    }

    public function set_options(bool $update_db = true, bool $discard_ade = false, bool $discard_db = false)
    {
        $this->options['update_db'] = $update_db;
        $this->options['discard_ade'] = $discard_ade;
        $this->options['discard_db'] = $discard_db;
    }

    /**
     * Create a DateTime from a week number and a year.
     * The DateTime will default to the Monday of the week.
     * @param int $week the week of the date
     * @param int $year the year of the date
     * @return DateTime the object DateTime.
     */
    private function get_datetime_from_week_year(int $week, int $year): DateTime
    {
        $d = new DateTime();
        $d->setISODate($week, $year);
        return $d;
    }

    private function get_number_from_datetime(DateTime $d, String $format): int
    {
        $v = $d->format($format);
        if (ctype_digit($v))
        {
            return intval($v);
        }
        else
        {
            return -1;
        }
    }

    private function set_interval(int $type, int $from_week, int $from_year, int $nb_weeks): void
    {
        $this->type = $type;
        $this->from_week = $from_week;
        $this->from_year = $from_year;
        $this->nb_weeks = $nb_weeks;
    }
}
