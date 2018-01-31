<?php

class Evenement implements JsonSerializable
{
    // Format pour insérer une datetime dans une BD SQL: "Y-m-d H:i:s" (année-mois-jour heure:minutes:secondes)
    public $id; // id unique dans la DB
    public $debut; // doit être set
    public $fin; // peut être vide ('null')
    public $info; // infos de l'évènement
    public $type; // type de l'évènement (ex: DS, TP noté, ...)
    public $url; // url associé (optionnel)

    public function jsonSerialize()
    {
        return [
            IDCOLUMN => $this->id,
            BEGINCOLUMN => $this->debut,
            ENDCOLUMN => $this->fin,
            INFOCOLUMN => $this->info,
            TYPECOLUMN => $this->type,
            URLCOLUMN => $this->url
        ];
    }

    public function getSQL($champ)
    {
        if (!isset($this->$champ) || (is_string($this->$champ) && $this->$champ == "")) {
            return null;
        } else {
            return $this->$champ;
        }
    }
}
