import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {Component, Input} from '@angular/core';

@Component({
  selector: 'app-modal-et-exclusions',
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

  valider(): void {
    const it = this.exclusions[Symbol.iterator];
    let i = 0;
    while (i < this.exclusions.length) {
      const e = this.exclusions[i];
      if (this.typesPossible.indexOf(e['type']) < 0 || e['contient'].length === 0) {
        this.exclusions.splice(i, 1);
      } else {
        i++;
      }
    }
    this.activeModal.close(this.exclusions);
  }

  ajoutExclusion(): void {
    this.exclusions.push({type: 'nom', contient: '', supprime: false});
  }

  suppressionExclusion(e): void {
    this.exclusions.splice(this.exclusions.indexOf(e), 1);
  }
}
