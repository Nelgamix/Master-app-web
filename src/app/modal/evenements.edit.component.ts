import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';

import * as moment from 'moment';

@Component({
	selector: 'ngbd-modal-evenements-edit',
	templateUrl: './evenements.edit.component.html',
	styleUrls: ['./evenements.edit.component.css']
})
export class NgbdModalEvenementsEdit implements OnInit {
	debutDate: any;
	debutTime: any;
	finDate: any;
	finTime: any;

	info: string;
	type: string;
	url: string;

	@Input() data; // source: this; ev: Evenement; type: number (ajout=0, modification=1)

	typesPossibles = [
		"Vie de la filière",
		"Examens",
		"Devoirs à rendre",
		"Vie étudiante",
		"Autres"
	];

	constructor(public activeModal: NgbActiveModal, private http: HttpClient) {}

	ngOnInit(): void {
		this.initDate(this.data.ev.debut, 0);
		this.initDate(this.data.ev.fin, 1);
		this.info = this.data.ev.info;
		this.type = this.data.ev.type;
		this.url = this.data.ev.url;
	}

	initDate(d, which): void { // which: 0 pour début, 1 pour fin
		if (!d || d == "") {
			return;
		}

		switch (which) {
			case 0:
				this.debutDate = {
					year: d.year(),
					month: d.month()+1,
					day: d.date()
				};
				this.debutTime = {
					hour: d.hour(),
					minute: d.minute()
				};
				break;

			case 1:
				this.finDate = {
					year: d.year(),
					month: d.month()+1,
					day: d.date()
				};
				this.finTime = {
					hour: d.hour(),
					minute: d.minute()
				};
				break;
		}
	}

	valider(): void {
		if (!this.debutDate || !this.info || !this.type) {
			return;
		}

		let debut = moment([this.debutDate.year, this.debutDate.month-1, this.debutDate.day, this.debutTime.hour, this.debutTime.minute]);
		let fin;
		if (this.finDate && this.finTime) {
			console.log(this.finDate);
			fin = moment([this.finDate.year, this.finDate.month-1, this.finDate.day, this.finTime.hour, this.finTime.minute]);
		}

		this.data.ev.setDebut(debut.format());
		this.data.ev.setFin(fin ? fin.format() : '');

		this.data.ev.setInfo(this.info);
		this.data.ev.setType(this.type);
		this.data.ev.setUrl(this.url);

		if (this.data.type == 0) { // Ajout
			this.data.source.insert(this.data.ev);
		} else {
			this.data.source.update(this.data.ev);
		}

		this.activeModal.close('Closed programmatically');
	}
}