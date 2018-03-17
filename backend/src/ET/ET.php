<?php

require_once 'Semaine.php';
require_once 'ETIntervalSelection.php';
require_once 'Metadata.php';

class ET implements JsonSerializable
{
    /**
     * @var ETIntervalSelection The interval selection
     */
    private $is;

    /**
     * @var array containing all semaine objects
     */
    private $semaines;

    /**
     * @var Metadata of the request
     */
    private $metadata;

    public function __construct(ETIntervalSelection $is)
    {
        $this->is = $is;
        $this->metadata = new Metadata();
        $this->semaines = [];

        foreach ($is->getWeeksSelected() as $item)
        {
            $this->semaines[] = new Semaine($item[0], $item[1], $is->getOptions());
        }
    }

    public function jsonSerialize()
    {
        return [
            "metadata" => $this->metadata,
            "semaines" => $this->semaines
        ];
    }

    public function init()
    {
        $ok = true;
        foreach ($this->semaines as $semaine)
        {
            $ok = $ok && $semaine->init($this->metadata->isAdeOnline());
        }
        $this->metadata->setOk($ok);
    }
}
