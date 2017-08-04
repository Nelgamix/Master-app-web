import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Component, Input } from '@angular/core';

@Component({
	selector: 'ngbd-modal-accueil-info',
	templateUrl: './accueil.info.component.html',
	styleUrls: ['./accueil.info.component.css']
})
export class NgbdModalAccueilInfo {
  @Input() data;

  constructor(public activeModal: NgbActiveModal) {}
}