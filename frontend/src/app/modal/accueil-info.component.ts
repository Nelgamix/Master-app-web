import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {Component, Input} from '@angular/core';
import {Semestre} from '../model/accueil/Semestre';

@Component({
  selector: 'app-modal-accueil-info',
  templateUrl: './accueil-info.component.html',
  styleUrls: ['./accueil-info.component.css']
})
export class ModalAccueilInfoComponent {
  @Input() data: Semestre;

  constructor(public activeModal: NgbActiveModal) {
  }
}
