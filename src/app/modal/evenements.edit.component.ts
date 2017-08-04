import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';

@Component({
	selector: 'ngbd-modal-evenements-edit',
	templateUrl: './evenements.edit.component.html',
	styleUrls: ['./evenements.edit.component.css']
})
export class NgbdModalEvenementsEdit implements OnInit {
	_debutDate: any;
	debutTime: any;
	_finDate: any;
	finTime: any;

	info: string;
	type: string;
	url: string;

	dd: any;
	df: any;

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

	set debutDate(value) {
		if (value && value.year && value.month && value.day) {
			this._debutDate = value;
			if (this.finDate && (value.year > this.finDate.year || value.month > this.finDate.month || value.day > this.finDate.day)) {
				this.finDate = value;
			}
		}
	}
	get debutDate() {
		return this._debutDate;
	}

	set finDate(value) {
		if (value && value.year && value.month && value.day) {
			if (value.year >= this.debutDate.year && value.month >= this.debutDate.month && value.day >= this.debutDate.day) {
				this._finDate = value;
			} else {
				this._finDate = this.finDate;
			}
		}
	}
	get finDate() {
		return this._finDate;
	}

	valider(): void {
		if (!this.debutDate || !this.info || !this.type) {
			return;
		}

		this.data.ev.setDebut(this.debutDate.year, this.debutDate.month, this.debutDate.day, this.debutTime ? this.debutTime.hour : 0, this.debutTime ? this.debutTime.minute : 0);
		if (this.finDate) {
			this.data.ev.setFin(this.finDate.year, this.finDate.month, this.finDate.day, this.finTime ? this.finTime.hour : 0, this.finTime ? this.finTime.minute : 0);
		}

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