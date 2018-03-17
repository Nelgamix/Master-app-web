<?php

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
