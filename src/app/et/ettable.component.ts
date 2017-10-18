import {Component} from '@angular/core';

import {EmploiTempsService} from '../services/emploi-temps.service';

@Component({
  selector: 'app-et-table',
  templateUrl: './ettable.component.html',
  styleUrls: ['./ettable.component.css']
})
export class EtTableComponent {
  sSearchFor: string;

  constructor(public et: EmploiTempsService) {
    this.sSearchFor = '';
  }

  getPopoverDetails(cours) {
    let a = '';

    a += 'Salles: ';
    for (const s of cours.salles) {
      a += s.batiment + ' ' + s.salle;
    }

    return a;
  }

  getPopoverTitle(cours) {
    let a = '';

    a += cours.type + ' ' + cours.nom;

    return a;
  }
}
