import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-modal-evenements-login',
  templateUrl: './evenements-login.component.html',
  styleUrls: ['./evenements-login.component.css']
})
export class ModalEvenementsLoginComponent implements OnInit {
  motdepasse: string;
  incorrect: any;

  @Input() inObj;

  constructor(public activeModal: NgbActiveModal, private http: HttpClient) {
  }

  ngOnInit(): void {
    this.incorrect = false;
  }

  log(): void {
    const hp = new HttpParams().set('req', 'login').set('psw', this.motdepasse);
    this.http.get('backend/ev', {params: hp}).subscribe(data => {
      if (data['success'] === true) {
        this.incorrect = false;
        this.inObj.admin = true;
        this.activeModal.close('Closed programmatically');
      } else {
        this.incorrect = true;
      }
    }, err => {
      console.error(err);
      this.incorrect = true;
    });
  }
}
