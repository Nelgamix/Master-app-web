import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {Component, Input} from '@angular/core';

@Component({
  selector: 'modal-accueil-info',
  templateUrl: './accueil-info.component.html',
  styleUrls: ['./accueil-info.component.css']
})
export class ModalAccueilInfoComponent {
  @Input() data;

  constructor(public activeModal: NgbActiveModal) {
  }
}
