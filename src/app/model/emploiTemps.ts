import { Cours } from './cours';
import { Jour } from './jour';

import * as moment from 'moment';

export class EmploiTemps {
	cours: Cours[];
	jours: {};

	constructor() {
		moment.locale('fr');
		this.reInit();
	}

	init(cours): void {
		// Ajouter les cours depuis les données json récupérées
		for (let c of cours) {
			this.cours.push(new Cours(c));
		}

		// Pour chaque cours, on le met au bon endroit dans les jours (pour l'affichage)
		for (let c of this.cours) {
			let j = c.debut.weekday();
			//if (j > 4) continue;

			if (!this.jours[j]) {
				this.jours[j] = new Jour(c);
			}

			this.jours[j].ajouterCours(c);
		}

		for (let j in this.jours) {
			this.jours[j].analyse();
		}
	}

	reInit(): void {
		this.jours = {};
		this.cours = [];
	}
}