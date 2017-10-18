import {Component} from '@angular/core';
import {OnInit} from '@angular/core';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {CookieService} from 'ngx-cookie-service';

import {EmploiTempsService} from '../services/emploi-temps.service';
import {ModalEtExclusionsComponent} from '../modal/et-exclusions.component';

import {ModalEtStatsComponent} from '../modal/et-stats.component';
import {DatesService} from '../services/dates.service';

import * as moment from 'moment';

@Component({
  selector: 'app-et-root',
  templateUrl: './et.component.html',
  styleUrls: ['./et.component.css']
})
export class EtComponent implements OnInit {
  readonly exclusionsCookie = 'et-exclusions';

  vueType = 1;
  loading: any;
  exclusions = [];
  selectedDate: any;

  constructor(public etService: EmploiTempsService,
              public datesService: DatesService,
              private modalService: NgbModal,
              private cookiesService: CookieService) {
  }

  ngOnInit(): void {
    this.getDates();
    if (this.cookiesService.check(this.exclusionsCookie)) {
      this.exclusions = JSON.parse(this.cookiesService.get(this.exclusionsCookie));
    }
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
  }

  openExclusions() {
    const modalRef = this.modalService.open(ModalEtExclusionsComponent);
    modalRef.componentInstance.exclusions = this.exclusions;
    modalRef.result.then(r => {
      this.etService.filterExclusions(this.exclusions);
      this.cookiesService.set(this.exclusionsCookie, JSON.stringify(this.exclusions));
    }, r => {
      this.etService.filterExclusions(this.exclusions);
    });
  }

  getWeekProgress() {
    if (!this.datesService.semaineSelectionnee) {
      return 0;
    }

    const first = this.datesService.semaineSelectionnee.debut;
    const last = this.datesService.semaineSelectionnee.fin;
    const n = moment();

    if (n.diff(first) < 0) {
      return 0;
    } else if (last.diff(n) < 0) {
      return 100;
    } else {
      return (n.diff(first, 'days') / (last.diff(first, 'days'))) * 100;
    }
  }

  openStats() {
    const modalRef = this.modalService.open(ModalEtStatsComponent);
    modalRef.componentInstance.stats = this.etService.emploiTemps.stats;
  }
}
