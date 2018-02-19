<?php

class Metadata implements JsonSerializable
{
    private $ok;
    private $ade_online;

    public function jsonSerialize()
    {
        return [
            'ok' => $this->ok,
            'adeOnline' => $this->ade_online
        ];
    }

    function __construct()
    {
        ini_set('default_socket_timeout', URLTIMEOUT);
        $this->ade_online = $this->test_url(ADEURL);
    }

    /**
     * @param mixed $ok
     */
    public function setOk($ok): void
    {
        $this->ok = $ok;
    }

    /**
     * @return bool
     */
    public function isAdeOnline(): bool
    {
        return $this->ade_online;
    }

    /**
     * Test url, returns true if online & working, false otherwise
     * @param String $url the url to test
     * @return bool       true if ADE online & working
     */
    private function test_url(String $url): bool
    {
        Commons::debug_section("test ade");
        $headers = get_headers($url, 1)[0];
        if (!$headers)
        {
            Commons::debug_line("ADE offline ou connexion reset.");
            $code = 500;
        }
        else
        {
            $code = explode(" ", $headers)[1];
            Commons::debug_line("ADE online, code " . $code);
        }

        return (200 <= $code) && ($code < 400);
    }
}