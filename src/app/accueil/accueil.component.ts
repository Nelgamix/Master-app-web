import { Component, Input } from '@angular/core';
import { OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { NgbdModalAccueilInfo } from '../modal/accueil.info.component';

@Component({
	selector: 'accueil-root',
	templateUrl: './accueil.component.html',
	styleUrls: ['./accueil.component.css']
})
export class AccueilComponent implements OnInit {
	quickLinks: any;
	otherLinks: any;
	semestres: any;

	constructor(private http: HttpClient, private modalService: NgbModal) {}

	ngOnInit(): void {
		this.http.get('assets/data.json').subscribe(data => {
			this.quickLinks = data["quickLinks"];
			this.otherLinks = data["otherLinks"];
			this.semestres = data["semestres"];
		});
	}

	onClickQuickLink(lien): void {
		// Ouvrir nouvel onglet
		// window.open(lien);
		// Ouvrir directement (comme un <a>)
		window.location.href = lien;
	}

	onClickOpenModal(semestreData): void {
		const modalRef = this.modalService.open(NgbdModalAccueilInfo);
    	modalRef.componentInstance.data = semestreData;
	}

	typeCheckArray(val) { return val instanceof Array; }
}