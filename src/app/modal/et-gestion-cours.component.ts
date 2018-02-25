import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {Component, EventEmitter, Input, Output} from '@angular/core';
import {CoursPerso, CoursPersoRecurrence} from '../model/et/CoursPerso';

@Component({
  selector: 'app-modal-et-gestion-cours',
  templateUrl: './et-gestion-cours.component.html'
})
export class ModalEtGestionCoursComponent {
  @Input() cours: CoursPerso[];
  @Output() out = new EventEmitter();

  CoursPersoRecurrence = CoursPersoRecurrence;

  constructor(public activeModal: NgbActiveModal) {
  }

  valider(): void {
    let i = 0;
    while (i < this.cours.length) {
      const e = this.cours[i];
      if (e.estVide()) {
        this.cours.splice(i, 1);
      } else {
        i++;
      }
    }
    this.activeModal.close(this.cours);
  }
}
