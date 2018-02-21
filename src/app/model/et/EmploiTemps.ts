import * as moment from 'moment';
import {Semaine} from './Semaine';
import {Cours} from './Cours';
import {Exclusion} from './Exclusion';

export class EmploiTemps {
  /** L'array contenant les semaines. */
  semaines: Semaine[];

  /** Les semaines sur lesquelles travailler. */
  semainesSelectionnees: Semaine[];

  constructor() {
    moment.locale('fr');

    this.semaines = [];
    this.semainesSelectionnees = [];
  }

  /**
   * Récupère la première semaine sélectionnée. Si aucune semaine n'est sélectionnée, renvoie null.
   * @returns {Semaine | null} la première semaine sélectionnée, ou null.
   */
  getSemaineUnique(): Semaine | null {
    if (this.semainesSelectionnees.length < 1) {
      console.error('Aucune semaine sélectionnée.');
      return null;
    }

    return this.semainesSelectionnees[0];
  }

  getSemainesSelectionnees(): Semaine[] {
    return this.semainesSelectionnees;
  }

  trouverSemaine(week: number, year: number): Semaine | null {
    for (const s of this.semaines) {
      if (s.week === week && s.year === year) {
        return s;
      }
    }

    return null;
  }

  /**
   * Ajoute une nouvelle semaine à l'emploi du temps.
   * @param {number} week le numéro de la nouvelle semaine.
   * @param {number} year l'année de la nouvelle semaine.
   * @returns {boolean} vrai si la semaine a été ajoutée, faux sinon (elle existait déjà)
   */
  addSemaine(week: number, year: number): boolean {
    if (this.trouverSemaine(week, year) !== null) {
      return false;
    }

    this.semaines.push(new Semaine(week, year));

    return true;
  }

  /**
   * Sélectionne la semaine week year, et la renvoie.
   * @param {number} week le numéro de la semaine à sélectionner.
   * @param {number} year l'année de la semaine à sélectionner.
   * @returns {Semaine} renvoie la semaine sélectionnée.
   */
  selectSemaine(week: number, year: number): Semaine | null {
    const s = this.trouverSemaine(week, year);
    if (s !== null) {
      this.semainesSelectionnees = [s];
    }

    return s;
  }

  selectMultipleSemaines(semaines: Semaine[]): boolean {
    this.semainesSelectionnees = [];
    let success = true;
    semaines.forEach(s => {
      if (this.semaines.indexOf(s) >= 0) {
        this.semainesSelectionnees.push(s);
      } else {
        success = false;
      }
    });

    return success;
  }

  /**
   * Ajoute les cours passés en paramètre à la semaine sélectionnée.
   * Si aucune, ou plus d'une semaine est sélectionnée, alors les cours ne sont pas ajoutés.
   * @param {Cours[]} cours les cours à ajouter.
   * @returns {boolean} vrai si les cours ont tous été ajoutés, faux sinon.
   */
  addCours(cours: Cours[]): boolean {
    if (this.semainesSelectionnees.length !== 1) {
      console.error('Nombre de semaine sélectionnées incorrect.');
      return false;
    }

    this.semainesSelectionnees[0].addAllCours(cours);
    return true;
  }

  /**
   * Applique les exclusions passés en paramètre à toutes les semaines sélectionnées.
   * @param {Exclusion[]} exclusions les exclusions à appliquer.
   * @returns {boolean} vrai si les exclusions ont été appliquées, faux sinon.
   */
  applyExclusions(exclusions: Exclusion[]): number {
    let total = 0;
    this.semainesSelectionnees.forEach(s => total += s.applyExclusions(exclusions));
    return total;
  }

  /**
   * Analyse toutes les semaines sélectionnées.
   */
  analyse(): void {
    this.semainesSelectionnees.forEach(s => s.analyse());
  }
}
