import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {Component, Input, OnInit} from '@angular/core';
import * as moment from 'moment';
import {Duree} from '../pipes/duree.pipe';
import {colorSets} from '@swimlane/ngx-charts/release/utils';
import {Cours} from '../model/et/Cours';
import {Objet} from '../pipes/objet.pipe';

// TODO: change PIPE (foreach objet in HTML) which is not pure and updates way too much the DOM (on each click!)
@Component({
  selector: 'app-modal-et-stats',
  templateUrl: './et-stats.component.html'
})
export class ModalEtStatsComponent implements OnInit {
  @Input() stats: any;

  data: any;
  dataChart: any[] = [];
  colorScheme: any = colorSets.find(s => s.name === 'vivid');

  statSelected: any;

  constructor(public activeModal: NgbActiveModal) {
  }

  ngOnInit() {
    for (const j of this.stats.jours.data) {
      this.dataChart.push({
        name: j.date.format('dddd'),
        value: j.cours.length
      });
    }

    this.data = (new Objet()).transform(this.stats);
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
    } else if (val instanceof Cours) {
      return val.nom;
    } else {
      return 'Inconnu: ' + typeof val;
    }
  }
}
