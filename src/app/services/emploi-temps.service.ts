import {Injectable} from '@angular/core';

import {EmploiTemps} from '../model/et/EmploiTemps';
import {HttpClient} from '@angular/common/http';
import * as moment from 'moment';
import {GlobalVariable} from '../globals';
import {Cours} from '../model/et/Cours';
import {CookieService} from 'ngx-cookie-service';
import {Exclusion} from '../model/et/Exclusion';

@Injectable()
export class EmploiTempsService {
  readonly exclusionsCookie = 'et-exclusions';

  metadata = {};

  emploiTemps: EmploiTemps;
  exclusions: Exclusion[];

  coursActuel: Cours;
  prochainCours: Cours;
  prochainCoursTimer: any;

  observers: any[];

  constructor(private http: HttpClient,
              private cookiesService: CookieService) {
    this.observers = [];
    this.emploiTemps = new EmploiTemps();
    this.initExclusionsFromCookies();
  }

  private initExclusionsFromCookies(): Exclusion[] {
    this.exclusions = [];
    if (this.cookiesService.check(this.exclusionsCookie)) {
      const eJson = JSON.parse(this.cookiesService.get(this.exclusionsCookie));
      if (eJson && eJson instanceof Array) {
        for (const o of eJson) {
          this.exclusions.push(new Exclusion(o['type'], o['nom'], o['professeur'], o['salle'], o['supprimer'], o['includes']));
        }
      }
    }

    return this.exclusions;
  }

  private sauvegardeExclusionsToCookies(exclusions: any): void {
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

  private loadData(data: any, cb?: Function): void {
    this.metadata['adeOnline'] = data['ade-online'];
    this.metadata['ok'] = data['ok'];

    if (this.metadata['ok']) {
      const res = data['data'];
      this.metadata['stats'] = res['stats'];
      this.metadata['lastUpdated'] = moment(res['updated'], 'DD-MM-YYYY HH:mm');
      const cours = res['cours'];

      // Init cours
      const coursInits = [];
      cours.forEach(c => coursInits.push(Cours.initFromIcal(c)));

      this.emploiTemps.addCours(coursInits);
      /*this.emploiTemps.addCours(new Cours({
        nom: 'TER',
        debut: moment('09/02/2018 09:00', 'DD-MM-YYYY HH:mm'),
        fin: moment('09/02/2018 11:30', 'DD-MM-YYYY HH:mm')
      }));*/
      this.analyse();
      this.filterExclusions(this.exclusions);

      this.notifyObserver();
    }

    if (cb) cb();
  }

  updateData(week: number, year: number, cb?: Function): void {
    if (this.emploiTemps.addSemaine(week, year)) {
      this.emploiTemps.selectSemaine(week, year);
      this.http.get('php/ical.php?year=' + year + '&week=' + week).subscribe(data => this.loadData(data, cb));
    } else {
      this.emploiTemps.selectSemaine(week, year);
      if (cb) cb();
    }
  }

  exclure(cours: Cours): void {
    this.exclusions.push(new Exclusion('', cours.nom, '', '', true, false));
    this.filterExclusions(this.exclusions);
  }

  filterExclusions(exclusions: Exclusion[]) {
    if (exclusions !== this.exclusions) {
      this.exclusions.splice(0, this.exclusions.length); // remove all (clear)
      for (const e of exclusions) {
        this.exclusions.push(e);
      }
    }

    this.emploiTemps.applyExclusions(this.exclusions);
    this.analyse();
    this.sauvegardeExclusionsToCookies(this.exclusions);
  }

  analyse(): void {
    this.emploiTemps.analyse();

    const now = moment();
    this.coursActuel = null;
    this.prochainCours = null;

    // Calcule cours actuel, prochain cours
    for (const s of this.emploiTemps.semainesSelectionnees) {
      for (const j of s.jours) {
        if (j && j.coursActifs.length > 0) {
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
    }

    if (this.prochainCours !== null) {
      this.prochainCoursTimer = moment.duration(now.diff(this.prochainCours.debut));
    }
  }
}
