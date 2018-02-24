import * as moment from 'moment';
import {Semaine} from './Semaine';
import {Exclusion} from './Exclusion';

export class EmploiTemps {
  /** L'array contenant les semaines. */
  semaines: Semaine[];

  constructor() {
    moment.locale('fr');
    this.semaines = [];
  }

  trouverSemaine(semaine: number, annee: number): Semaine | null {
    return this.semaines.find((s: Semaine) => s.date.annee === annee && s.date.semaine === semaine);
  }

  /**
   * Ajoute une nouvelle semaine à l'emploi du temps.
   * @param {number} week le numéro de la nouvelle semaine.
   * @param {number} year l'année de la nouvelle semaine.
   * @returns {boolean} vrai si la semaine a été ajoutée, faux sinon (elle existait déjà)
   */
  addSemaine(week: number, year: number): boolean {
    if (this.trouverSemaine(week, year)) {
      return false;
    }

    this.semaines.push(new Semaine(week, year));

    return true;
  }

  /**
   * Applique les exclusions passés en paramètre à toutes les semaines.
   * @param {Exclusion[]} exclusions les exclusions à appliquer.
   * @returns {number} nombre d'exclusions total.
   */
  applyExclusions(exclusions: Exclusion[]): number {
    let total = 0;
    this.semaines.forEach(s => total += s.applyExclusions(exclusions));
    return total;
  }

  /**
   * Analyse toutes les semaines.
   * @param opt les options
   */
  analyse(opt?: any): void {
    this.semaines.forEach(s => s.analyse(moment(), opt));
  }
}
