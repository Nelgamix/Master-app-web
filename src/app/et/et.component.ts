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

		this.http.get('php/dates.php').subscribe(data => {
			this.dates = data;

			let now = moment();
			let nowWeekDay = now.weekday();
			let nowWeek = now.week();
			let nowYear = now.year();
			for (let d of this.dates) {
				if (d.year > nowYear || (d.year == nowYear && d.week >= nowWeek) && nowWeekDay < 5) {
					this.selectedDate = d;
					break;
				}
			}
			
			this.onChangeDate(this.selectedDate);
		});
	}

	reInit(): void {
		this.emploiTemps.reInit();
	}

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