import {Injectable} from '@angular/core';

import {EmploiTemps} from '../model/emploiTemps';

@Injectable()
export class EmploiTempsService {
  emploiTemps: EmploiTemps;

  observers: any[];

  constructor() {
    this.observers = [];
    this.emploiTemps = new EmploiTemps();
  }

  registerObserver(obs) {
    this.observers.push(obs);
  }

  notifyObserver() {
    for (const o of this.observers) {
      o.changed();
    }
  }

  loadCours(cours): void {
    this.emploiTemps.init(cours);
    this.notifyObserver();
  }

  filterExclusions(exclusions) {
    this.emploiTemps.filterExclusions(exclusions);
    this.emploiTemps.analyse();
  }
}
