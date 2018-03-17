import {EmploiTempsService} from '../services/emploi-temps.service';
import {DatesService} from '../services/dates.service';
import {MessageService} from '../services/message.service';

import {Component, OnInit} from '@angular/core';
import {Semaine, SemaineDate} from '../model/et/Semaine';
import {ActivatedRoute, ParamMap, Router} from '@angular/router';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/observable/of';

// TODO: info: stats générales, sur les exclusion, les notes, graph sur les heures moyennes (50%)
// TODO: filtrage sur et visuel (0%)
// TODO: cours perso ui (80%)
// TODO: fix vue mobile (60%)

enum VueType {
  ET,
  INFO,
  SETTINGS
}

@Component({
  selector: 'app-et-root',
  templateUrl: './et.component.html',
  styleUrls: ['./et.component.css']
})
export class EtComponent implements OnInit {
  semaine$: Observable<Semaine>;
  semaine: Semaine;
  date$: Observable<any>;
  date: SemaineDate;

  VueType = VueType;
  vueType: VueType;

  constructor(public etService: EmploiTempsService,
              public datesService: DatesService,
              private route: ActivatedRoute,
              private router: Router,
              private messageService: MessageService) {
    this.semaine = null;
    this.vueType = VueType.ET;
  }

  ngOnInit(): void {
    this.datesService.updateDates(() => {
      if (this.route.snapshot.paramMap.has('year') && this.route.snapshot.paramMap.has('week')) {
        this.date$ = this.route.paramMap.switchMap((params: ParamMap) => {
          return this.datesService.getObsDateFromWeekYear(+params.get('week'), +params.get('year'));
        });

        this.date$.subscribe(d => this.date = d);

        this.semaine$ = this.route.paramMap.switchMap((params: ParamMap) => {
          const a = +params.get('year');
          const s = +params.get('week');

          if (a && s && a === 2018 && s > 0 && s < 53) {
            this.messageService.showLoading();
            return this.etService.updateSingleWeek(s, a);
          } else {
            console.error('invalid navigation: ' + a + ' ' + s);
            return Observable.of(null);
          }
        });

        this.semaine$.subscribe((s: Semaine) => {
          if (!s) {
            this.navigateToWeek(this.datesService.semaineProche);
            return;
          }

          this.semaine = s;
          this.messageService.closeLoading();
        });
      } else {
        this.navigateToWeek(this.datesService.semaineProche);
      }
    });
  }

  navigateToWeek(date: SemaineDate): void {
    if (date) {
      this.router.navigate(['et', date.annee, date.semaine]);
    }
  }

  previousWeek() {
    this.navigateToWeek(this.datesService.previousWeek(this.date));
  }

  nextWeek() {
    this.navigateToWeek(this.datesService.nextWeek(this.date));
  }

  nowWeek() {
    this.navigateToWeek(this.datesService.nowWeek(this.date));
  }

  showInfo() {
    this.vueType = VueType.INFO;
  }

  closeInfo() {
    this.vueType = VueType.ET;
  }

  showSettings() {
    this.vueType = VueType.SETTINGS;
  }

  closeSettings() {
    this.etService.analyse([this.semaine]);
    this.vueType = VueType.ET;
  }

  boutonMagique(id: number) {
    // Indiquer que fait chaque id.
    switch (id) {
      case 0:
        break;
    }
  }
}
