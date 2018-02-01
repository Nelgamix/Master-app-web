<?php

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

    function __construct($nom, $debut, $fin, $duree, $description, $professeur, $salle, $type, $groupe)
    {
        $this->nom = $nom;
        $this->debut = $debut;
        $this->fin = $fin;
        $this->duree = $duree;
        $this->description = $description;
        $this->professeur = $professeur;
        $this->salle = $salle;
        $this->type = $type;
        $this->groupe = $groupe;

        Commons::debug_line(json_encode($this));
    }

    public function jsonSerialize()
    {
        return [
            'debut' => $this->debut->format(self::FORMAT_JOUR),
            'fin' => $this->fin->format(self::FORMAT_JOUR),
            'duree' => $this->duree->format(self::FORMAT_DUREE),
            'nom' => mb_convert_encoding($this->nom, "UTF-8"),
            'professeur' => mb_convert_encoding($this->professeur, "UTF-8"),
            'salle' => mb_convert_encoding($this->salle, "UTF-8"),
            'description' => mb_convert_encoding($this->description, "UTF-8"),
            'type' => mb_convert_encoding($this->type, "UTF-8"),
            'groupe' => Commons::deploy_array($this->groupe)
        ];
    }

    /**
     * @return mixed
     */
    public function get_nom()
    {
        return $this->nom;
    }

    /**
     * @return mixed
     */
    public function get_debut()
    {
        return $this->debut;
    }

    /**
     * @return mixed
     */
    public function get_fin()
    {
        return $this->fin;
    }

    /**
     * @return mixed
     */
    public function get_professeur()
    {
        return $this->professeur;
    }

    /**
     * @return mixed
     */
    public function get_description()
    {
        return $this->description;
    }

    /**
     * @return mixed
     */
    public function get_salle()
    {
        return $this->salle;
    }

    /**
     * @return mixed
     */
    public function get_duree()
    {
        return $this->duree;
    }

    /**
     * @return mixed
     */
    public function get_type()
    {
        return $this->type;
    }

    /**
     * @return mixed
     */
    public function get_groupe()
    {
        return $this->groupe;
    }
}
