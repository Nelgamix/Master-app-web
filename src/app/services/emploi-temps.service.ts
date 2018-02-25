import {Injectable} from '@angular/core';

import {EmploiTemps} from '../model/et/EmploiTemps';
import {HttpClient} from '@angular/common/http';
import {Cours, EtatCours} from '../model/et/Cours';
import {CookieService} from 'ngx-cookie-service';
import {Exclusion} from '../model/et/Exclusion';
import {CoursPerso} from '../model/et/CoursPerso';
import {Observable} from 'rxjs/Observable';
import {Semaine} from '../model/et/Semaine';
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

  readonly optionsCookie = 'et-options';

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

  options: any;

  constructor(private http: HttpClient,
              private cookiesService: CookieService) {
    this.emploiTemps = new EmploiTemps();

    this.initOptionsFromCookies();
    this.initExclusionsFromCookies();
    this.initCoursPersoFromCookies();
  }

  getCouleurOf(cours: Cours): string {
    if (this.options.couleur[cours.type[0]]) {
      return this.options.couleur[cours.type[0]].couleur;
    } else {
      return this.options.couleur.Autre.couleur;
    }
  }

  /**
   * Update les données de l'emploi du temps en ajoutant celles de la semaine week,
   * année year. Le callback cb est appelé si fourni, à la fin de l'update.
   * @param {any} date la date, qui contient year et week
   * @param {Function} cb fonction qui s'exécute après l'update.
   */
  updateSingleWeek(semaine: number, annee: number, cb?: Function): Observable<Semaine> {
    return Observable.create(obs => {
      const t: Semaine = this.emploiTemps.trouverSemaine(semaine, annee);
      if (!t) {
        this.http.get('php/ical.php?from_year=' + annee + '&from_week=' + semaine)
          .subscribe(
            data => this.loadData(data, obs, false, cb),
            error => {
              console.error(error);
              obs.next(null);
              if (cb) {
                cb();
              }
            });
      } else {
        this.analyse([t]);
        obs.next(t);
        if (cb) {
          cb();
        }
      }
    });
  }

  updateAllWeeks(cb?: Function): Observable<Semaine[]> {
    return Observable.create(obs => {
      this.http.get('php/ical.php?info').subscribe(data => this.loadData(data, obs, true, cb));
    });
  }

  addCoursPerso(coursPerso: CoursPerso[]): void {
    this.coursPersos.push(...coursPerso);
  }

  setCoursPerso(coursPerso: CoursPerso[]): void {
    if (coursPerso !== this.coursPersos) {
      this.coursPersos.splice(0, this.coursPersos.length); // remove all (clear)
      for (const e of coursPerso) {
        this.coursPersos.push(e);
      }
    }
  }

  addExclusions(exclusions: Exclusion[]): void {
    this.exclusions.push(...this.exclusions);
  }

  setExclusions(exclusions: Exclusion[]): void {
    if (exclusions !== this.exclusions) {
      this.exclusions.splice(0, this.exclusions.length); // remove all (clear)
      for (const e of exclusions) {
        this.exclusions.push(e);
      }
    }
  }

  preAnalyse(s: Semaine[]): void {
    this.emploiTemps.preAnalyse(moment(), s);
  }

  /**
   * Analyse l'ensemble des semaines sélectionnées.
   */
  analyse(s: Semaine[]): void {
    this.filterExclusions(this.exclusions, s);
    this.ajoutCoursPerso(this.coursPersos, s);
    this.emploiTemps.analyse(this.options, s);
  }

  initOptionsFromCookies(): any {
    this.options = {
      cacherCoursPasses: false,
      couleur: {
        CM: {defaut: 'rgba(220, 20, 60, 0.4)', couleur: 'rgba(220, 20, 60, 0.4)'},
        TD: {defaut: 'rgba(30, 144, 255, 0.4)', couleur: 'rgba(30, 144, 255, 0.4)'},
        TP: {defaut: 'rgba(0, 160, 136, 0.4)', couleur: 'rgba(0, 160, 136, 0.4)'},
        Autre: {defaut: 'rgba(140, 140, 140, 0.4)', couleur: 'rgba(140, 140, 140, 0.4)'}
      }
    };

    if (this.cookiesService.check(this.optionsCookie)) {
      const eJson = JSON.parse(this.cookiesService.get(this.optionsCookie));
      if (eJson) {
        this.options = eJson;
      }
    }

    return this.options;
  }

  sauvegardeOptionsToCookies(): void {
    this.cookiesService.set(this.optionsCookie, JSON.stringify(this.options), 0, '/');
  }

  /**
   * Filtrer les cours avec les exclusions fournies en paramètre.
   * @param {Exclusion[]} exclusions les exclusions qui vont exclure les cours.
   */
  private filterExclusions(exclusions: Exclusion[], s: Semaine[]): number {
    this.sauvegardeExclusionsToCookies();

    let t = 0;
    // reset état
    s.forEach(ss => ss.jours.forEach(j => j.ensembleCours.setCours.cours.forEach(c => c.etat = EtatCours.ACTIF)));

    // filtre
    s.forEach(ss => t += ss.applyExclusions(this.exclusions));

    return t;
  }

  private ajoutCoursPerso(coursPerso: CoursPerso[], s: Semaine[]): void {
    this.sauvegardeCoursPersoToCookies();

    // delete tous les cours prives
    s.forEach(ss => ss.jours.forEach(j => {
      const a = j.ensembleCours.setCours.cours;
      for (let i = 0; i < a.length; i++) {
        if (a[i].prive) {
          a.splice(i, 1);
        }
      }
    }));

    coursPerso.forEach(c => c.testePlusieursSemaine(s, moment()));
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
          this.coursPersos.push(
            new CoursPerso(
              o['recurrence'],
              moment(o['date']),
              o['debut'],
              o['fin'],
              o['description'],
              o['nom'],
              o['type'],
              o['professeur'],
              o['lieu']
            )
          );
        }
      }
    }

    return this.coursPersos;
  }

  /**
   * Sauvegarde les cours perso dans les cookies.
   */
  private sauvegardeCoursPersoToCookies(): void {
    this.cookiesService.set(this.coursPersoCookie, JSON.stringify(this.coursPersos), 0, '/');
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
    this.cookiesService.set(this.exclusionsCookie, JSON.stringify(this.exclusions), 0, '/');
  }

  /**
   * Fonction qui est appelée après qu'on ait récupéré les données depuis le serveur de l'emploi du temps.
   * Met à jour les métadonnées, et si les données ont pu être récupérées, met à jour la semaine.
   * Enfin, appelle la fonction de callback si présente.
   * @param data les données renvoyées par le serveur.
   * @param {any} obs l'observable
   * @param {boolean} selectAll si vrai, l'obsersable renverra alors tous les cours process
   * @param {Function} cb le callback qui est appelé à la fin de l'update.
   */
  private loadData(data: any, obs: any, selectAll: boolean, cb?: Function): void {
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

      const sts: Semaine[] = []; // semaines to select (semaine qui vont être sélectionnées à la fin)

      // pour chaque semaine
      for (const s of semaines) {
        const w = parseInt(s['week'], 10);
        const y = parseInt(s['year'], 10);
        const u = s['updated'];
        const cs = s['cours'];

        const added = this.emploiTemps.ajoutSemaine(w, y);
        const so = this.emploiTemps.trouverSemaine(w, y);
        if (added) {
          so.updated = moment(u, 'DD-MM-YYYY HH:mm');
          const coursInits = [];
          cs.forEach(c => coursInits.push(Cours.initFromIcal(c)));
          so.addAllCours(coursInits);
        }

        sts.push(so);
      }

      this.preAnalyse(sts);

      /*this.analyseDisabled = true;
      this.filterExclusions(this.exclusions, sts);
      this.ajoutCoursPerso(this.coursPersos, sts);
      this.analyseDisabled = false;*/

      this.analyse(sts);

      if (selectAll) {
        obs.next(sts);
      } else {
        obs.next(sts[0]);
      }
    } else {
      obs.error('error');
    }

    if (cb) {
      cb();
    }
  }
}
