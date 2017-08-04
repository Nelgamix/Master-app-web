import { Component } from '@angular/core';
import { OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
	selector: 'contact-root',
	templateUrl: './contact.component.html',
	styleUrls: ['./contact.component.css']
})
export class ContactComponent implements OnInit {

	constructor(private http: HttpClient) {}

	ngOnInit(): void {
		//this.http.get('assets/data.json').subscribe(data => {});
	}
}