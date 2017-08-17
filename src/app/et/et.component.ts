import {Component} from '@angular/core';
import {OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {CookieService} from 'ngx-cookie-service';

import {EmploiTempsService} from '../services/emploi-temps.service';
import {ModalEtExclusionsComponent} from '../modal/et-exclusions.component';

import * as moment from 'moment';
import {ModalEtStatsComponent} from "../modal/et-stats.component";

@Component({
  selector: 'et-root',
  templateUrl: './et.component.html',
  styleUrls: ['./et.component.css']
})
export class EtComponent implements OnInit {
  readonly exclusionsCookie = 'et-exclusions';

  vueType = 1;

  dates: any;
  selectedDate: any;
  adeOnline: any;
  ok: any;
  lastUpdated: any;
  loading: any;
  stats: any;

  exclusions = [];

  constructor(private http: HttpClient,
              public emploiTempsService: EmploiTempsService,
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
  getDates(): void {
    this.http.get('php/dates.php').subscribe(data => {
      this.dates = data; // il faut que ce soit dans l'ordre (trié...) eg 2017-35, 2017-36, ...

      if (!this.dates || this.dates.length < 1) {
        throw new Error('dates script didn\'t return any year/week json object');
      }

      const now = moment();
      const nowWeekDay = now.weekday();
      const nowWeek = now.week();
      const nowYear = now.year();

      const first = this.dates[0]; // première semaine dispo dans les dates
      const last = this.dates[this.dates.length - 1]; // dernière semaine dispo

      if (nowYear < first.year || (nowYear == first.year && nowWeek < first.nowWeek)) { // on est avant
        this.selectedDate = first;
      } else if (nowYear > last.year || (nowYear == last.year && nowWeek > last.nowWeek)) { // on est après
        this.selectedDate = last;
      } else { // on est dedans
        for (const d of this.dates) {
          // peut être facto dans une seule cond, mais plus clair ainsi
          if (d.year > nowYear) { // l'année est après; on doit le sélectionner
            this.selectedDate = d;
            break;
          } else if (d.year == nowYear && d.week == nowWeek && nowWeekDay < 5) { // même semaine, vendredi ou avant
            // si on est dans la même semaine, mais le weekend, on sélectionne celle d'après ('if' suivant)
            this.selectedDate = d;
            break;
          } else if (d.year == nowYear && d.week >= nowWeek) { // semaine d'après
            this.selectedDate = d;
            break;
          }
        }
      }

      if (!this.selectedDate) {
        throw new Error('selectedDate could not be find');
      }

      this.onChangeDate(this.selectedDate);
    });
  }

  /**
   * Active le loading screen et effectue une requête au serveur pour récupérer les données
   * @param {} date l'objet {year: xxxx, week: xx}
   */
  onChangeDate(date): void {
    this.loading = true;
    this.http.get('php/ical.php?year=' + date.year + '&week=' + date.week).subscribe(this.setData.bind(this));
  }

  setData(data): void {
    this.loading = false;
    this.adeOnline = data['ade-online'];
    this.ok = data['ok'];

    const res = data['data'];
    this.stats = res['stats'];
    this.lastUpdated = moment(res['updated'], 'DD-MM-YYYY HH:mm');
    const cours = res['cours'];

    this.emploiTempsService.loadCours(cours);
    this.emploiTempsService.filterExclusions(this.exclusions);
  }

  openExclusions() {
    const modalRef = this.modalService.open(ModalEtExclusionsComponent);
    modalRef.componentInstance.exclusions = this.exclusions;
    modalRef.result.then(r => {
      this.emploiTempsService.filterExclusions(this.exclusions);
      this.cookiesService.set(this.exclusionsCookie, JSON.stringify(this.exclusions));
    }, r => {
      this.emploiTempsService.filterExclusions(this.exclusions);
    });
  }

  openStats() {
    const modalRef = this.modalService.open(ModalEtStatsComponent);
    modalRef.componentInstance.stats = this.emploiTempsService.emploiTemps.stats;
  }
}
