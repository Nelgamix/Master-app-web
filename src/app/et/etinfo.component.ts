import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {EmploiTempsService} from '../services/emploi-temps.service';
import {Semaine} from '../model/et/Semaine';
import {PositionTemps} from '../model/et/PositionTemps';
import {Objet} from '../pipes/objet.pipe';
import {colorSets} from '@swimlane/ngx-charts/release/utils';
import {Observable} from 'rxjs/Observable';

@Component({
  selector: 'app-etinfo',
  templateUrl: './etinfo.component.html',
  styleUrls: ['./etinfo.component.css']
})
export class EtInfoComponent implements OnInit {
  @Output() onClose = new EventEmitter();

  chartData: any = [];
  colorScheme: any = colorSets.find(s => s.name === 'vivid');

  semaines$: Observable<Semaine[]>;
  semaines: Semaine[];

  loaded: boolean;

  PositionTemps = PositionTemps;

  constructor(public etService: EmploiTempsService) {
  }

  ngOnInit() {
    this.loaded = false;
    this.refresh();
  }

  refresh() {
    this.semaines$ = this.etService.updateAllWeeks(() => {
      this.loaded = true;
    });

    this.semaines$.subscribe(s => {
      this.semaines = s;
      const e = {name: 'Cours', series: []};
      this.chartData = [e];
      for (const w of s) {
        e.series.push({name: w.year + ' S' + w.week, value: w.setCours.getTaille()});
      }
    });
  }

  getData(s: Semaine, champ: string): any[] {
    const o = s.stats[champ].data;
    const ot = new Objet().transform(o);
    ot.sort((l, r) => {
      return r.value - l.value || l.key.localeCompare(r.key);
    });
    return ot;
  }

  close() {
    this.onClose.emit();
  }
}
