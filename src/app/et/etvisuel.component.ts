import { Component, Input, OnInit } from '@angular/core';

import { EmploiTemps } from '../model/emploiTemps';
import { Jour } from '../model/jour';

import * as moment from 'moment';

@Component({
	selector: 'et-visuel',
	templateUrl: './etvisuel.component.html',
	styleUrls: ['./etvisuel.component.css']
})
export class EtVisuelComponent implements OnInit {
	@Input() et: EmploiTemps;
	jours: {};

	legendeHeures = {
		debut: 8,
		fin: 20,
		interval: 1,
		legendes: []
	};

	legendeJours = [
		"Lundi",
		"Mardi",
		"Mercredi",
		"Jeudi",
		"Vendredi"
	];

	constructor() {
		let le = this.legendeHeures;
		for (let i = le.debut; i <= le.fin; i = i + le.interval) {
			le.legendes.push(i);
		}
	}

	ngOnInit() {
		if (!this.et) {
			this.et = new EmploiTemps();
			this.et.init([
				{
					type: 'TD',
					nom: 'C CLI',
					professeur: 'Blanchon',
					description: '',
					salle: 'F301',
					debut: '08-09-2017 08:00',
					fin: '08-09-2017 10:00',
					duree: '02:00'
				},
				{
					type: 'Cours',
					nom: 'This is a test',
					professeur: 'Dude',
					description: '',
					salle: 'F301',
					debut: '06-09-2017 10:15',
					fin: '06-09-2017 11:45',
					duree: '01:30'
				},
				{
					type: 'TP',
					nom: 'Algo',
					professeur: 'Wack',
					description: '',
					salle: 'F105',
					debut: '05-09-2017 14:00',
					fin: '05-09-2017 15:00',
					duree: '01:00'
				}
			]);
		}

		this.analyse();
	}

	analyse(): void {
		this.jours = {};
		for (let i = 0; i < this.legendeJours.length; i++) {
			this.jours[i] = [];
			if (this.et.jours[i]) {
				for (let c of this.et.jours[i].cours) {
					this.jours[i].push({
						cours: c,
						position: {
							top: (((c.debut.hour() * 60 + c.debut.minute()) - (this.legendeHeures.debut * 60)) / (this.legendeHeures.fin * 60 - this.legendeHeures.debut * 60)) * 100,
							height: ((c.duree.hour() * 60 + c.duree.minute()) / (this.legendeHeures.fin * 60 - this.legendeHeures.debut * 60)) * 100
						}
					});
				}
			}
		}
	}
}