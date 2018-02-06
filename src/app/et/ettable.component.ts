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
}
