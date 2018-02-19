import {Injectable} from '@angular/core';

import {EmploiTemps} from '../model/et/EmploiTemps';
import {HttpClient} from '@angular/common/http';
import {Cours} from '../model/et/Cours';
import {CookieService} from 'ngx-cookie-service';
import {Exclusion} from '../model/et/Exclusion';
import * as moment from 'moment';

@Injectable()
export class EmploiTempsService {
  /**
   * Nom pour le stockage du cookie contenant les exclusions.
   * @type {string}
   */
  readonly exclusionsCookie = 'et-exclusions';

  /**
   * Objet contenant les métadonnées pour l'emploi du temps (ADE)
   * @type {{}}
   */
  metadata = {};

  /**
   * Objet Emploi du temps.
   */
  emploiTemps: EmploiTemps;

  /**
   * Exclusions configurées par l'utilisateur.
   */
  exclusions: Exclusion[];

  /**
   * Cours actuellement en cours.
   */
  coursActuel: Cours;

  /**
   * Prochain cours qui arrive.
   */
  prochainCours: Cours;

  /**
   * Countdown avant le prochain cours.
   */
  prochainCoursTimer: any;

  /**
   * Liste d'observers à notifier quand il y a un changement.
   */
  observers: any[];

  constructor(private http: HttpClient,
              private cookiesService: CookieService) {
    this.observers = [];
    this.emploiTemps = new EmploiTemps();
    this.initExclusionsFromCookies();
  }

  /**
   * Ajoute un nouvel observeur de l'emploi du temps.
   * Il sera notifié quand un changement intervient dans l'emploi du temps,
   * par l'appel à sa fonction changed().
   * @param obs l'observeur
   */
  registerObserver(obs) {
    this.observers.push(obs);
  }

  /**
   * Update les données de l'emploi du temps en ajoutant celles de la semaine week,
   * année year. Le callback cb est appelé si fourni, à la fin de l'update.
   * @param {number} week numéro de semaine
   * @param {number} year année
   * @param {Function} cb fonction qui s'exécute après l'update.
   */
  updateSingleWeek(week: number, year: number, cb?: Function): void {
    const t = this.emploiTemps.trouverSemaine(week, year);
    if (t === null) {
      this.http.get('php/ical.php?from_year=' + year + '&from_week=' + week).subscribe(data => this.loadData(data, cb));
    } else {
      this.emploiTemps.selectSemaine(week, year);
      if (cb) {
        cb();
      }
    }
  }

  updateAllWeeks(cb?: Function): void {
    this.http.get('php/ical.php?info').subscribe(data => this.loadData(data, cb));
  }

  /**
   * Exclure strictement le cours cours, puis filtrer les cours.
   * @param {Cours} cours le cours à exclure de l'emploi du temps.
   */
  exclure(cours: Cours): void {
    this.exclusions.push(new Exclusion('', cours.nom, '', '', true, false));
    this.filterExclusions(this.exclusions);
  }

  /**
   * Filtrer les cours avec les exclusions fournies en paramètre.
   * @param {Exclusion[]} exclusions les exclusions qui vont exclure les cours.
   */
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

  /**
   * Analyse l'ensemble des semaines sélectionnées.
   */
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

  /**
   * Initialise les exclusions depuis les cookies.
   * @returns {Exclusion[]} les exclusions récupérées des cookies.
   */
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

  /**
   * Sauvegarde les exclusions dans les cookies.
   * @param exclusions les exclusions à sauvegarder.
   */
  private sauvegardeExclusionsToCookies(exclusions: any): void {
    this.cookiesService.set(this.exclusionsCookie, JSON.stringify(exclusions));
  }

  /**
   * Notifie les observeurs d'un changement dans l'emploi du temps.
   */
  private notifyObserver() {
    for (const o of this.observers) {
      o.changed();
    }
  }

  /**
   * Fonction qui est appelée après qu'on ait récupéré les données depuis le serveur de l'emploi du temps.
   * Met à jour les métadonnées, et si les données ont pu être récupérées, met à jour la semaine.
   * Enfin, appelle la fonction de callback si présente.
   * @param data les données renvoyées par le serveur.
   * @param {Function} cb le callback qui est appelé à la fin de l'update.
   */
  private loadData(data: any, cb?: Function): void {
    if (data['metadata']) {
      this.metadata['adeOnline'] = data.metadata['ade-online'];
      this.metadata['ok'] = data.metadata['ok'];
    }

    if (this.metadata['ok'] && data['semaines']) {
      const semaines = data['semaines'];
      const sts = [];

      semaines.forEach(s => {
        const w = parseInt(s['week'], 10);
        const y = parseInt(s['year'], 10);
        const u = s['updated'];
        const cs = s['cours'];

        let so;
        if (this.emploiTemps.addSemaine(w, y)) {
          so = this.emploiTemps.trouverSemaine(w, y);
          so.updated = moment(u, 'DD-MM-YYYY HH:mm');
          const coursInits = [];
          cs.forEach(c => coursInits.push(Cours.initFromIcal(c)));
          so.addAllCours(coursInits);
        } else {
          so = this.emploiTemps.trouverSemaine(w, y);
        }

        sts.push(so);
      });

      this.emploiTemps.selectMultipleSemaines(sts);

      /*this.emploiTemps.addCours(new Cours({
        nom: 'TER',
        debut: moment('09/02/2018 09:00', 'DD-MM-YYYY HH:mm'),
        fin: moment('09/02/2018 11:30', 'DD-MM-YYYY HH:mm')
      }));*/
      this.analyse();
      this.filterExclusions(this.exclusions);

      this.notifyObserver();
    }

    if (cb) {
      cb();
    }
  }
}
