import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {CookieService} from 'ngx-cookie-service';

import {EmploiTempsService} from '../services/emploi-temps.service';
import {ModalEtExclusionsComponent} from '../modal/et-exclusions.component';

import {ModalEtStatsComponent} from '../modal/et-stats.component';
import {DatesService} from '../services/dates.service';

import * as moment from 'moment';
import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-et-root',
  templateUrl: './et.component.html',
  styleUrls: ['./et.component.css']
})
export class EtComponent implements OnInit {
  vueType = 1;
  loading: any;
  exclusions = [];
  selectedDate: any;
  infoSemaine: any;
  weekProgress: number;

  constructor(public etService: EmploiTempsService,
              public datesService: DatesService,
              private modalService: NgbModal) {
    etService.registerObserver(this);
  }

  ngOnInit(): void {
    this.getDates();
    this.exclusions = this.etService.initFromCookies();
  }

  /**
   * Effectue une requête GET au serveur pour obtenir les semaines disponibles.
   * Ces semaines sont affectées à this.dates, et la semaine la plus proche est sélectionnée (this.selectedDate)
   */
  private getDates(): void {
    this.datesService.updateDates(() => {
      this.selectedDate = this.datesService.semaineProche;
      this.onChangeDate(this.datesService.semaineProche);
    });
  }

  /**
   * Active le loading screen et effectue une requête au serveur pour récupérer les données
   * @param {} date l'objet {year: xxxx, week: xx}
   */
  onChangeDate(date): void {
    this.loading = true;
    this.datesService.semaineSelectionnee = date;
    this.etService.updateData(date, () => {
      this.loading = false;
      this.etService.filterExclusions(this.exclusions);
    });
    this.updateWeekProgress();
  }

  openExclusions() {
    const modalRef = this.modalService.open(ModalEtExclusionsComponent);
    modalRef.componentInstance.exclusions = Object.assign([], this.exclusions);
    modalRef.result.then(r => {
      this.etService.filterExclusions(r);
    }, r => {
      // this.etService.filterExclusions(this.exclusions);
    });
  }

  private updateWeekProgress(): void {
    const now = moment();
    const first = this.datesService.semaineSelectionnee.debut.clone().add(8, 'h');
    const last = this.datesService.semaineSelectionnee.fin.clone().add(18, 'h');

    this.weekProgress = -1;
    this.infoSemaine = {
      /*
      -1 = on est avant cette semaine (la semaine arrive) => avant this.emploiTemps.premierJour.premierCours.debut
      0 = on est dans la semaine
      1 = on est après cette semaine => après emploiTemps.jours[5].dernierCours
       */
      placement: 0,
      date: null // la date
    };

    if (this.datesService.semaineSelectionnee) {
      // update info semaine
      if (now.isBefore(first)) { // on est avant
        this.infoSemaine.placement = -1;
        this.infoSemaine.date = moment.duration(now.diff(first));
      } else if (now.isAfter(last)) { // on est après
        this.infoSemaine.placement = 1;
        this.infoSemaine.date = moment.duration(now.diff(last));
      } else { // on est dans la semaine
        this.infoSemaine.placement = 0;
        this.infoSemaine.date = moment.duration(now.diff(first));
      }

      // update week progress
      if (now.diff(first) < 0) {
        this.weekProgress = 0;
      } else if (last.diff(now) < 0) {
        this.weekProgress = 100;
      } else {
        this.weekProgress = (now.diff(first, 'minutes') / (last.diff(first, 'minutes'))) * 100;
      }
    }
  }

  previousWeek() {
    this.datesService.previousWeek();
    this.updateSemaine();
  }
  nextWeek() {
    this.datesService.nextWeek();
    this.updateSemaine();
  }
  nowWeek() {
    this.datesService.nowWeek();
    this.updateSemaine();
  }

  private updateSemaine() {
    this.selectedDate = this.datesService.semaineSelectionnee;
    this.onChangeDate(this.selectedDate);
  }

  openStats() {
    const modalRef = this.modalService.open(ModalEtStatsComponent);
    modalRef.componentInstance.stats = this.etService.emploiTemps.stats;
  }

  changed(): void {
    this.exclusions = this.etService.exclusions;
  }
}
