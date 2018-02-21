import {Injectable} from '@angular/core';

import {EmploiTemps} from '../model/et/EmploiTemps';
import {HttpClient} from '@angular/common/http';
import {Cours} from '../model/et/Cours';
import {CookieService} from 'ngx-cookie-service';
import {Exclusion} from '../model/et/Exclusion';
import {CoursPerso} from '../model/et/CoursPerso';
import * as moment from 'moment';

@Injectable()
export class EmploiTempsService {
  /**
   * Nom pour le stockage du cookie contenant les exclusions.
   * @type {string}
   */
  readonly exclusionsCookie = 'et-exclusions';

  /**
   * Nom pour le stockage du cookie contenant les cours perso.
   * @type {string}
   */
  readonly coursPersoCookie = 'et-cours-perso';

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
   * Cours persos ajoutés par l'utilisateur.
   */
  coursPersos: CoursPerso[];

  /**
   * Countdown avant le prochain cours.
   */
  prochainCoursTimer: any;

  /**
   * Si vrai, alors aucune analyse ne sera effectuée.
   */
  analyseDisabled: boolean;

  /**
   * Liste d'observers à notifier quand il y a un changement.
   */
  observers: any[];

  constructor(private http: HttpClient,
              private cookiesService: CookieService) {
    this.observers = [];
    this.analyseDisabled = false;
    this.emploiTemps = new EmploiTemps();

    this.initExclusionsFromCookies();
    this.initCoursPersoFromCookies();
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
      this.analyse();
      if (cb) {
        cb();
      }
    }
  }

  updateAllWeeks(cb?: Function): void {
    this.http.get('php/ical.php?info').subscribe(data => this.loadData(data, cb));
  }

  exclure(exclusion: Exclusion): void {
    this.exclusions.push(exclusion);
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

    const total = this.emploiTemps.applyExclusions(this.exclusions);
    this.analyse();
    this.sauvegardeExclusionsToCookies();
  }

  ajoutCoursPerso(coursPerso: CoursPerso[]): void {
    if (coursPerso !== this.coursPersos) {
      this.coursPersos.splice(0, this.coursPersos.length); // remove all (clear)
      for (const e of coursPerso) {
        this.coursPersos.push(e);
      }
    }

    coursPerso.forEach(c => c.testePlusieursSemaine(this.emploiTemps.semainesSelectionnees));
    this.analyse();
    this.sauvegardeCoursPersoToCookies();
  }

  /**
   * Analyse l'ensemble des semaines sélectionnées.
   */
  analyse(): void {
    if (this.analyseDisabled) {
      return;
    }

    this.emploiTemps.analyse();

    const now = moment();

    // TODO
    if (this.emploiTemps.getSemaineUnique().setCours.coursSuivant) {
      this.prochainCoursTimer = moment.duration(now.diff(this.emploiTemps.getSemaineUnique().setCours.coursSuivant.debut));
    }
  }

  /**
   * Initialise les cours perso depuis les cookies.
   * @returns {CoursPerso[]} les cours perso récupérées des cookies.
   */
  private initCoursPersoFromCookies(): CoursPerso[] {
    this.coursPersos = [];
    if (this.cookiesService.check(this.coursPersoCookie)) {
      const eJson = JSON.parse(this.cookiesService.get(this.coursPersoCookie));
      if (eJson && eJson instanceof Array) {
        for (const o of eJson) {
          this.coursPersos.push(new CoursPerso(o['recurrence'], moment(o['date']), o['debut'], o['fin'], o['description'], o['nom'], o['type'], o['professeur'], o['lieu']));
        }
      }
    }

    return this.coursPersos;
  }

  /**
   * Sauvegarde les cours perso dans les cookies.
   */
  private sauvegardeCoursPersoToCookies(): void {
    this.cookiesService.set(this.coursPersoCookie, JSON.stringify(this.coursPersos));
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
   */
  private sauvegardeExclusionsToCookies(): void {
    this.cookiesService.set(this.exclusionsCookie, JSON.stringify(this.exclusions));
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
      // Récup et sort les semaines.
      const semaines = data['semaines'];
      semaines.sort((e1, e2) => {
        const y1 = parseInt(e1['year'], 10);
        const y2 = parseInt(e2['year'], 10);
        const w1 = parseInt(e1['week'], 10);
        const w2 = parseInt(e2['week'], 10);

        if (y1 < y2) return -1;
        if (y1 > y2) return 1;

        if (w1 < w2) return -1;
        if (w1 > w2) return 1;

        return 0;
      });

      const sts = []; // semaines to select (semaine qui vont être sélectionnées à la fin)

      // pour chaque semaine
      for (const s of semaines) {
        const w = parseInt(s['week'], 10);
        const y = parseInt(s['year'], 10);
        const u = s['updated'];
        const cs = s['cours'];

        const added = this.emploiTemps.addSemaine(w, y);
        const so = this.emploiTemps.trouverSemaine(w, y);
        if (added) {
          so.updated = moment(u, 'DD-MM-YYYY HH:mm');
          const coursInits = [];
          cs.forEach(c => coursInits.push(Cours.initFromIcal(c)));
          so.addAllCours(coursInits);
        }

        sts.push(so);
      }

      this.emploiTemps.selectMultipleSemaines(sts);

      this.analyseDisabled = true;
      this.filterExclusions(this.exclusions);
      this.ajoutCoursPerso(this.coursPersos);
      this.analyseDisabled = false;

      this.analyse();
      this.notifyObserver();
    }

    if (cb) {
      cb();
    }
  }
}
