import {Injectable} from '@angular/core';

import {EmploiTemps} from '../model/emploiTemps';
import {Jour} from '../model/jour';

@Injectable()
export class EmploiTempsService {
  emploiTemps: EmploiTemps;
  jours: Jour[];

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
    this.emploiTemps.reInit();
    this.emploiTemps.init(cours);

    this.jours = [];
    for (const j in this.emploiTemps.jours) {
      this.jours.push(this.emploiTemps.jours[j]);
    }

    this.notifyObserver();
  }
}
