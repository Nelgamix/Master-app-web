import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {EmploiTempsService} from '../services/emploi-temps.service';
import {Semaine} from '../model/et/Semaine';
import {PositionTemps} from '../model/et/PositionTemps';
import {Objet} from '../pipes/objet.pipe';
import {colorSets} from '@swimlane/ngx-charts/release/utils';
import {Observable} from 'rxjs/Observable';

@Component({
  selector: 'app-et-info',
  templateUrl: './et-info.component.html',
  styleUrls: ['./et-info.component.css']
})
export class EtInfoComponent implements OnInit {
  @Output() onClose = new EventEmitter();

  chartData: any = [];
  colorScheme: any = colorSets.find(s => s.name === 'vivid');

  semaines$: Observable<Semaine[]>;
  semaines: Semaine[];

  loaded: boolean;
  cacher: boolean[];

  PositionTemps = PositionTemps;

  constructor(public etService: EmploiTempsService) {
    this.cacher = [];
  }

  ngOnInit() {
    this.loaded = false;
    this.refresh();
  }

  refresh() {
    this.semaines$ = this.etService.updateAllWeeks();
    this.semaines$.subscribe(s => {
      this.semaines = s;

      const st = {name: 'Total', series: []};
      const sa = {name: 'Cours actifs', series: []};
      const sc = {name: 'Cours cachés', series: []};
      const ss = {name: 'Cours supprimés', series: []};
      this.chartData = [st, sa, sc, ss];

      s.forEach((w: Semaine) => {
        this.cacher.push(true);
        st.series.push({name: w.date.annee + ' S' + w.date.semaine, value: w.ensembleCours.setCours.getTaille()});
        sa.series.push({name: w.date.annee + ' S' + w.date.semaine, value: w.ensembleCours.setCours.coursActifs.length});
        sc.series.push({name: w.date.annee + ' S' + w.date.semaine, value: w.ensembleCours.setCours.coursCaches.length});
        ss.series.push({name: w.date.annee + ' S' + w.date.semaine, value: w.ensembleCours.setCours.coursSupprimes.length});
      });

      this.loaded = true;
    });
  }

  getData(s: Semaine, champ: string): any[] {
    const o = s.ensembleCours.setCours.stats[champ].data;
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
