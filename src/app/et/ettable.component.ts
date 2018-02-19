import {Component, Input} from '@angular/core';

import {EmploiTempsService} from '../services/emploi-temps.service';
import {Semaine} from '../model/et/Semaine';

@Component({
  selector: 'app-et-table',
  templateUrl: './ettable.component.html',
  styleUrls: ['./ettable.component.css']
})
export class EtTableComponent {
  @Input() search: string;
  semaine: Semaine;

  constructor(public et: EmploiTempsService) {
    this.et.registerObserver(this);
    this.changed();
  }

  changed(): void {
    this.semaine = this.et.emploiTemps.getSemaineUnique();
  }
}
