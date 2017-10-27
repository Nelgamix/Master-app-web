import {Injectable} from '@angular/core';

import {EmploiTemps} from '../model/et/emploiTemps';
import {HttpClient} from '@angular/common/http';
import * as moment from 'moment';
import {GlobalVariable} from '../globals';

@Injectable()
export class EmploiTempsService {
  metadata = {};
  emploiTemps: EmploiTemps;

  observers: any[];

  constructor(private http: HttpClient) {
    this.observers = [];
    this.emploiTemps = new EmploiTemps();
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
      this.http.get('assets/etServiceTest.json').subscribe(data => this.loadData(data, cb));
    } else {
      this.http.get('php/ical.php?year=' + date.year + '&week=' + date.week).subscribe(data => this.loadData(data, cb));
    }
  }

  filterExclusions(exclusions) {
    this.emploiTemps.filterExclusions(exclusions);
    this.emploiTemps.analyse();
  }
}
