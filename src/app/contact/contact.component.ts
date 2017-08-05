import { Component } from '@angular/core';
import { OnInit } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

@Component({
	selector: 'contact-root',
	templateUrl: './contact.component.html',
	styleUrls: ['./contact.component.css']
})
export class ContactComponent implements OnInit {
	envoye: boolean;
	erreur: boolean;

	email: string;
	sujets = [
		"Ajout de lien",
		"Idée",
		"Évènement à venir",
		"Correction",
		"Autre"
	];
	sujet: string;
	message: string;

	constructor(private http: HttpClient) {}

	ngOnInit(): void {
		this.envoye = false;
		this.erreur = false;
	}

	envoi(): void {
		if (!this.sujet || !this.message) {
			return;
		}

		let hp = new HttpParams();

		if (this.email && this.email.length > 4) { // il faudrait vérif l'email (via regex)
			hp = hp.set('email', this.email);
		}
		
		if (this.sujets.includes(this.sujet)) { // contournable
			hp = hp.set('sujet', this.sujet);
		} else {
			return;
		}

		if (this.message.length > 5) { // eventuellement escape?
			hp = hp.set('message', this.message);
		} else {
			return;
		}

		this.http.get('php/mail.php', { params: hp }).subscribe(data => {
			if (data && data["success"]) {
				this.envoye = true;
				this.erreur = false;
			} else {
				this.erreur = true;
			}
		});
	}
}