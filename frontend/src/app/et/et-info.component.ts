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

  colorScheme: any = colorSets.find(s => s.name === 'vivid');
  chartDataCours: any = [];
  chartDataHeures: any = [];

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
      this.semaines.forEach(w => this.cacher.push(true));
      this.refreshCharts();
      this.loaded = true;
    });
  }

  private refreshCharts(): void {
    this.refreshChartCours();
    this.refreshChartHeures();
  }

  private refreshChartCours(): void {
    const st = {name: 'Total', series: []};
    const sa = {name: 'Cours actifs', series: []};
    const sc = {name: 'Cours cachés', series: []};
    const ss = {name: 'Cours supprimés', series: []};
    this.chartDataCours = [st, sa, sc, ss];

    this.semaines.forEach((s: Semaine) => {
      st.series.push({name: s.date.annee + ' S' + s.date.semaine, value: s.ensembleCours.setCours.getTaille()});
      sa.series.push({name: s.date.annee + ' S' + s.date.semaine, value: s.ensembleCours.setCoursActifs.getTaille()});
      sc.series.push({name: s.date.annee + ' S' + s.date.semaine, value: s.ensembleCours.setCoursCaches.getTaille()});
      ss.series.push({name: s.date.annee + ' S' + s.date.semaine, value: s.ensembleCours.setCoursSupprimes.getTaille()});
    });
  }

  private refreshChartHeures(): void {
    const sc = {name: 'Sans conflits', series: []};
    const ac = {name: 'Avec conflits', series: []};
    this.chartDataHeures = [sc, ac];

    this.semaines.forEach((s: Semaine) => {
      sc.series.push({name: s.date.annee + ' S' + s.date.semaine, value: s.ensembleCours.setCoursActifs.duree.asHours()});
      ac.series.push({name: s.date.annee + ' S' + s.date.semaine, value: s.ensembleCours.setCoursActifs.dureeTotale.asHours()});
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
