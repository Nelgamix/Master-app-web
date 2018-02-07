import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {Component, Input} from '@angular/core';
import {Exclusion} from '../model/et/exclusion';
import {Observable} from 'rxjs/Observable';

@Component({
  selector: 'app-modal-et-exclusions',
  templateUrl: './et-exclusions.component.html'
})
export class ModalEtExclusionsComponent {
  @Input() exclusions: Exclusion[];
  @Input() possibilites: any;

  constructor(public activeModal: NgbActiveModal) {
  }

  valider(): void {
    let i = 0;
    while (i < this.exclusions.length) {
      const e = this.exclusions[i];
      if (e.estVide()) {
        this.exclusions.splice(i, 1);
      } else {
        i++;
      }
    }
    this.activeModal.close(this.exclusions);
  }

  ajoutExclusion(): void {
    this.exclusions.push(new Exclusion('', '', '', '', false, true));
  }

  supprimerTout(): void {
    if (confirm('Voulez-vous vraiment supprimer toutes les exclusions?')) {
      this.exclusions.splice(0, this.exclusions.length);
    }
  }

  suppressionExclusion(e): void {
    this.exclusions.splice(this.exclusions.indexOf(e), 1);
  }
}
