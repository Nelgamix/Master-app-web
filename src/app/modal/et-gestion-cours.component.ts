import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {Component, EventEmitter, Output} from '@angular/core';

@Component({
  selector: 'app-modal-et-gestion-cours',
  templateUrl: './et-gestion-cours.component.html'
})
export class ModalEtGestionCoursComponent {
  @Output() out = new EventEmitter();

  constructor(public activeModal: NgbActiveModal) {
  }
}
