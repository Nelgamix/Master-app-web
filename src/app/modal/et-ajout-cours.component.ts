import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {Component, EventEmitter, Output} from '@angular/core';

@Component({
  selector: 'app-modal-et-ajout-cours',
  templateUrl: './et-ajout-cours.component.html'
})
export class ModalEtAjoutCoursComponent {
  @Output() out = new EventEmitter();

  constructor(public activeModal: NgbActiveModal) {
  }
}
