import { Component } from '@angular/core';
import { OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { EmploiTemps } from '../model/emploiTemps';
import { Jour } from '../model/jour';

import * as moment from 'moment';

@Component({
	selector: 'et-root',
	templateUrl: './et.component.html',
	styleUrls: ['./et.component.css']
})
export class EtComponent implements OnInit {
	emploiTemps: EmploiTemps;
	jours: Jour[]; // pour éviter d'utiliser un pipe couteux en perf

	dates: any;
	selectedDate: any;
	adeOnline: any;
	ok: any;
	lastUpdated: any;
	loading: any;
	stats: any;

	constructor(private http: HttpClient) {
		this.emploiTemps = new EmploiTemps();
	}

	ngOnInit(): void {
		this.reInit();

		this.getDates();		
	}

	/**
	 * Effectue une requête GET au serveur pour obtenir les semaines disponibles.
	 * Ces semaines sont affectées à this.dates, et la semaine la plus proche est sélectionnée (this.selectedDate)
	 */
	getDates(): void {
		this.http.get('php/dates.php').subscribe(data => {
			this.dates = data; // il faut que ce soit dans l'ordre (trié...) eg 2017-35, 2017-36, ...

			if (!this.dates || this.dates.length < 1) {
				throw "dates script didn't return any year/week json object";
			}

			let now = moment();
			let nowWeekDay = now.weekday();
			let nowWeek = now.week();
			let nowYear = now.year();

			let first = this.dates[0]; // première semaine dispo dans les dates
			let last = this.dates[this.dates.length-1]; // dernière semaine dispo

			if (nowYear < first.year || (nowYear == first.year && nowWeek < first.nowWeek)) { // on est avant
				this.selectedDate = first;
			} else if (nowYear > last.year || (nowYear == last.year && nowWeek > last.nowWeek)) { // on est après
				this.selectedDate = last;
			} else { // on est dedans
				for (let d of this.dates) {
					// peut être facto dans une seule cond, mais plus clair ainsi
					if (d.year > nowYear) { // l'année est après; on doit le sélectionner
						this.selectedDate = d;
						break;
					} else if (d.year == nowYear && d.week == nowWeek && nowWeekDay < 5) { // même semaine, vendredi ou avant
						// si on est dans la même semaine, mais le weekend, on sélectionne celle d'après ('if' suivant)
						this.selectedDate = d;
						break;
					} else if (d.year == nowYear && d.week >= nowWeek) { // semaine d'après
						this.selectedDate = d;
						break;
					}
				}
			}

			if (!this.selectedDate) {
				throw "selectedDate could not be find";
			}
			
			this.onChangeDate(this.selectedDate);
		});
	}

	reInit(): void {
		this.emploiTemps.reInit();
	}

	/**
	 * Active le loading screen et effectue une requête au serveur pour récupérer les données
	 * @param {} date l'objet {year: xxxx, week: xx}
	 */
	onChangeDate(date): void {
		this.loading = true;
		this.http.get('php/ical.php?year=' + date.year + '&week=' + date.week).subscribe(this.setData.bind(this));
	}

	setData(data): void {
		this.reInit();

		this.loading = false;
		this.adeOnline = data["ade-online"];
		this.ok = data["ok"];
		
		let res = data["data"];
		this.stats = res["stats"];
		this.lastUpdated = moment(res["updated"], "DD-MM-YYYY HH:mm");
		let cours = res["cours"];

		this.emploiTemps.init(cours);
		this.jours = [];
		for (let j in this.emploiTemps.jours) {
			this.jours.push(this.emploiTemps.jours[j]);
		}
	}
}