import {Component} from '@angular/core';

import {EmploiTempsService} from '../services/emploi-temps.service';

@Component({
  selector: 'et-table',
  templateUrl: './ettable.component.html',
  styleUrls: ['./ettable.component.css']
})
export class EtTableComponent {
  constructor(public et: EmploiTempsService) {
  }
}
