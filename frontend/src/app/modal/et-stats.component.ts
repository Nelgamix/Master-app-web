import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {Component, Input, OnInit} from '@angular/core';
import * as moment from 'moment';
import {Duree} from '../pipes/duree.pipe';
import {colorSets} from '@swimlane/ngx-charts/release/utils';

@Component({
  selector: 'app-modal-et-stats',
  templateUrl: './et-stats.component.html'
})
export class ModalEtStatsComponent implements OnInit {
  @Input() stats: any;

  data: any[] = [];
  colorScheme: any = colorSets.find(s => s.name === 'vivid');

  constructor(public activeModal: NgbActiveModal) {
  }

  ngOnInit() {
    for (const j of this.stats.jours.data) {
      this.data.push({
        name: j.date.format('dddd'),
        value: j.cours.length
      });
    }
  }

  toString(val): string {
    if (!val) {
      return 'Pas de valeur';
    } else if (typeof val === 'string') {
      return val;
    } else if (typeof val === 'number') {
      return val.toString();
    } else if (Array.isArray(val)) {
      return 'Array (' + val.length + ' éléments)';
    } else if (moment.isDuration(val)) {
      return new Duree().transform(val);
    } else {
      return 'Inconnu: ' + typeof val;
    }
  }
}
