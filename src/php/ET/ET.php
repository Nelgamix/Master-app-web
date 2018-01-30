<?php
/**
 * Created by PhpStorm.
 * User: Kryoxem
 * Date: 30/01/2018
 * Time: 12:08
 */

require_once 'Data.php';

class ET implements JsonSerializable
{
    private $data;
    private $ade_online;
    private $ok;

    public function __construct($year, $week)
    {
        Commons::debug_line("week $week, year $year");
        ini_set('default_socket_timeout', URLTIMEOUT);
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
     * Test url, returns true if online & working, false otherwise
     * @param String $url the url to test
     * @return bool       true if ADE online & working
     */
    private function test_url(String $url)
    {
        Commons::debug_section("test ade");
        $headers = get_headers($url, 1)[0];
        $code = explode(" ", $headers)[1];
        if ($code == null) {
            $code = 401;
            Commons::debug_line("ADE down");
        } else {
            Commons::debug("ADE code ");
            Commons::debug_line($code);
        }

        return (200 <= $code) && ($code < 400);
    }
}