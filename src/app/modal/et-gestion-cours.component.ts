import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {Component, EventEmitter, Input, Output} from '@angular/core';
import {Cours} from '../model/et/Cours';

@Component({
  selector: 'app-modal-et-gestion-cours',
  templateUrl: './et-gestion-cours.component.html'
})
export class ModalEtGestionCoursComponent {
  @Input() cours: Cours[];
  @Output() out = new EventEmitter();

  constructor(public activeModal: NgbActiveModal) {
  }
}
