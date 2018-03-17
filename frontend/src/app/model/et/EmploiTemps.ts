import {Semaine} from './Semaine';
import {Exclusion} from './Exclusion';
import {EnsembleCours} from './EnsembleCours';
import * as moment from 'moment';

/**
 * Emploi du temps.
 * Contient l'ensemble des semaines, ainsi que des stats sur toutes les semaines combinées.
 */
export class EmploiTemps {
  /** L'array contenant les semaines. */
  semaines: Semaine[];

  ensembleCours: EnsembleCours;

  constructor() {
    moment.locale('fr');
    this.semaines = [];
    this.ensembleCours = new EnsembleCours();
  }

  /**
   * Cherche et renvoie la semaine de semaine semaine et année annee.
   * @param {number} semaine
   * @param {number} annee
   * @returns {Semaine | null} la semaine, ou null si elle n'a pas été trouvée
   */
  trouverSemaine(semaine: number, annee: number): Semaine | null {
    return this.semaines.find((s: Semaine) => s.date.annee === annee && s.date.semaine === semaine);
  }

  /**
   * Ajoute une nouvelle semaine à l'emploi du temps.
   * @param {number} semaine le numéro de la nouvelle semaine.
   * @param {number} annee l'année de la nouvelle semaine.
   * @returns {boolean} vrai si la semaine a été ajoutée, faux sinon (elle existait déjà)
   */
  ajoutSemaine(semaine: number, annee: number): boolean {
    if (this.trouverSemaine(semaine, annee)) {
      return false;
    }

    this.semaines.push(new Semaine(semaine, annee));

    return true;
  }

  /**
   * Applique les exclusions passés en paramètre à toutes les semaines.
   * @param {Exclusion[]} exclusions les exclusions à appliquer.
   * @returns {number} nombre d'exclusions total.
   */
  appliquerExclusions(exclusions: Exclusion[]): number {
    let total = 0;
    this.semaines.forEach(s => total += s.applyExclusions(exclusions));
    return total;
  }

  preAnalyse(now: any, s?: Semaine[]): void {
    if (s) {
      s.forEach(sm => sm.preAnalyse(now));
    } else {
      this.semaines.forEach(sm => sm.preAnalyse(now));
    }
  }

  /**
   * Analyse toutes les semaines.
   * @param opt les options
   */
  analyse(opt?: any, s?: Semaine[]): void {
    if (s) {
      s.forEach(sm => sm.analyse(opt));
      this.ensembleCours.sum(s.map(ss => ss.ensembleCours));
    } else {
      this.semaines.forEach(sm => sm.analyse(opt));
      this.ensembleCours.sum(this.semaines.map(ss => ss.ensembleCours));
    }

    this.ensembleCours.analyse(opt);
  }
}
