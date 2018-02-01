<?php

require_once 'Data.php';

class ET implements JsonSerializable
{
    private $data;
    public $ade_online;
    public $ok;

    public function __construct($year, $week)
    {
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

    public function init()
    {
        $this->ade_online = $this->test_url($this->data->get_url());
        if (DISCARDADE) {
            // Pour tester en cas d'offline
            $this->ade_online = false;
        }

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
        if (!$headers) {
            Commons::debug_line("ADE offline ou connexion reset.");
            $code = 500;
        } else {
            $code = explode(" ", $headers)[1];
            Commons::debug_line("ADE online, code " . $code);
        }

        return (200 <= $code) && ($code < 400);
    }
}
