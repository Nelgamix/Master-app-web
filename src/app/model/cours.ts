import * as moment from 'moment';

export class Cours {
	type: string;
	nom: string;
	professeur: string;
	description: string;
	salle: string;

	debut: any;
	fin: any;
	duree: any;

	couleur: string;

	static readonly TYPE_COULEURS = {
		"Cours": "crimson",
		"TD": "dodgerblue",
		"TP": "seagreen"
	};

	constructor(c) {
		this.type = c.type;
		this.nom = c.nom;
		this.professeur = c.professeur;
		this.description = c.description;
		this.salle = c.salle;
		this.debut = moment(c.debut, "DD-MM-YYYY HH:mm");
		this.fin = moment(c.fin, "DD-MM-YYYY HH:mm");
		this.duree = moment(c.duree, "HH:mm");

		this.couleur = Cours.TYPE_COULEURS[this.type];
		if (!this.couleur) this.couleur = "black";
	}
}