import {Component, Input} from '@angular/core';
import {Cours, EtatCours} from '../model/et/Cours';
import {PositionTemps} from '../model/et/PositionTemps';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-modal-et-cours-details',
  templateUrl: 'et-cours-details.component.html',
  styles: ['.section div:first-of-type {font-weight: bold} .section:hover {background-color: #ccc}']
})
export class ModalEtCoursDetailsComponent {
  @Input() cours: Cours;

  EtatCours = EtatCours;
  PositionTemps = PositionTemps;

  constructor(public activeModal: NgbActiveModal) {
  }
}
