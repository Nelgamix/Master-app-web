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

	constructor(c) {
		this.type = c.type;
		this.nom = c.nom;
		this.professeur = c.professeur;
		this.description = c.description;
		this.salle = c.salle;
		this.debut = moment(c.debut, "DD-MM-YYYY HH:mm");
		this.fin = moment(c.fin, "DD-MM-YYYY HH:mm");
		this.duree = moment(c.duree, "HH:mm");
	}
}