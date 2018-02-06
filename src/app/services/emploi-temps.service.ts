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

  coursActuel: Cours;
  prochainCours: Cours;
  prochainCoursTimer: any;

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

    if (this.metadata['ok']) {
      const res = data['data'];
      this.metadata['stats'] = res['stats'];
      this.metadata['lastUpdated'] = moment(res['updated'], 'DD-MM-YYYY HH:mm');
      const cours = res['cours'];

      this.emploiTemps.init(cours);
      this.analyse();

      this.notifyObserver();
    }

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
      for (const e of exclusions) {
        this.exclusions.push(e);
      }
    }

    this.emploiTemps.filterExclusions(this.exclusions);
    this.analyse();
    this.sauvegardeCookies(this.exclusions);
  }

  analyse(): void {
    this.emploiTemps.analyse();

    const now = moment();
    this.coursActuel = null;
    this.prochainCours = null;

    // Calcule cours actuel, prochain cours
    for (const j of this.emploiTemps.jours) {
      if (j) {
        if (now.isBefore(j.premierCours.debut)) { // on est avant ce jour.
          this.prochainCours = j.premierCours;
          break;
        } else if (now.isAfter(j.dernierCours.fin)) { // on est après ce jour.
          continue;
        } else { // on est dans ce jour: on doit trouver le bon cours.
          for (const c of j.coursActifs) { // on parcours les cours
            if (this.coursActuel === null && now.isBetween(c.debut, c.fin)) { // on a trouvé le cours actuel
              this.coursActuel = c;
            }

            if (now.isBefore(c.debut)) { // si le cours qu'on analyse est après now, alors c'est le cours d'avant qui est le plus proche.
              this.prochainCours = c;
              break;
            }
          }

          break;
        }
      }
    }

    if (this.prochainCours !== null) {
      this.prochainCoursTimer = moment.duration(now.diff(this.prochainCours.debut));
    }
  }
}
