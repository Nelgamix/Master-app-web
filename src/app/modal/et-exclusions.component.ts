import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {Component, Input} from '@angular/core';

@Component({
  selector: 'modal-et-exclusions',
  templateUrl: './et-exclusions.component.html'
})
export class ModalEtExclusionsComponent {
  @Input() exclusions: any[];

  typesPossible = [
    'type',
    'nom',
    'salle',
    'professeur'
  ];

  constructor(public activeModal: NgbActiveModal) {
  }

  ajoutExclusion(): void {
    this.exclusions.push({nom: 'nom', contient: ''});
  }

  suppressionExclusion(e): void {
    this.exclusions.splice(this.exclusions.indexOf(e), 1);
  }
}
