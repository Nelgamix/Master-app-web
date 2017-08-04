import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';

@Component({
	selector: 'ngbd-modal-evenements-login',
	templateUrl: './evenements.login.component.html',
	styleUrls: ['./evenements.login.component.css']
})
export class NgbdModalEvenementsLogin implements OnInit {
	motdepasse: string;
	incorrect: any;

	@Input() inObj;

	constructor(public activeModal: NgbActiveModal, private http: HttpClient) {}

	ngOnInit(): void {
		this.incorrect = false;
	}

	log(): void {
		let hp = new HttpParams().set('req', 'login').set('psw', this.motdepasse);
		this.http.get("php/ev.php", { params: hp }).subscribe(data => {
			if (data['success'] == true) {
				this.incorrect = false;
				this.inObj.admin = true;
				this.activeModal.close('Closed programmatically');
			} else {
				this.incorrect = true;
			}
		});
	}
}