import {Injectable} from '@angular/core';

import {EmploiTemps} from '../model/et/emploiTemps';
import {HttpClient} from '@angular/common/http';
import * as moment from 'moment';
import {GlobalVariable} from '../globals';
import {Cours} from '../model/et/cours';
import {CookieService} from 'ngx-cookie-service';

@Injectable()
export class EmploiTempsService {
  readonly exclusionsCookie = 'et-exclusions';

  metadata = {};
  emploiTemps: EmploiTemps;
  exclusions: any[];

  observers: any[];

  constructor(private http: HttpClient,
              private cookiesService: CookieService) {
    this.observers = [];
    this.emploiTemps = new EmploiTemps();
  }

  initFromCookies(): any {
    this.exclusions = [];
    if (this.cookiesService.check(this.exclusionsCookie)) {
      this.exclusions = JSON.parse(this.cookiesService.get(this.exclusionsCookie));
    }

    return this.exclusions;
  }

  sauvegardeCookies(exclusions: any): void {
    this.cookiesService.set(this.exclusionsCookie, JSON.stringify(exclusions));
  }

  registerObserver(obs) {
    this.observers.push(obs);
  }

  private notifyObserver() {
    for (const o of this.observers) {
      o.changed();
    }
  }

  loadData(data, cb): void {
    this.metadata['adeOnline'] = data['ade-online'];
    this.metadata['ok'] = data['ok'];

    const res = data['data'];
    this.metadata['stats'] = res['stats'];
    this.metadata['lastUpdated'] = moment(res['updated'], 'DD-MM-YYYY HH:mm');
    const cours = res['cours'];

    this.emploiTemps.init(cours);
    this.notifyObserver();

    if (cb && cb instanceof Function) {
      cb();
    }
  }

  updateData(date, cb) {
    if (GlobalVariable.LOCAL_DEV) {
      this.http.get('assets/offline/etServiceTest.json').subscribe(data => this.loadData(data, cb));
    } else {
      this.http.get('php/ical.php?year=' + date.year + '&week=' + date.week).subscribe(data => this.loadData(data, cb));
    }
  }

  exclure(cours: Cours): void {
    this.exclusions.push({'type': 'nom', 'contient': cours.nom, 'supprime': true});
    this.filterExclusions(this.exclusions);
  }

  filterExclusions(exclusions: any[]) {
    if (exclusions !== this.exclusions) {
      this.exclusions.splice(0, this.exclusions.length); // remove all (clear)
      for (const e of exclusions) this.exclusions.push(e);
    }

    this.emploiTemps.filterExclusions(this.exclusions);
    this.emploiTemps.analyse();
    this.sauvegardeCookies(this.exclusions);
  }
}
