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

  /**
   * Ajoute une nouvelle semaine à l'emploi du temps.
   * @param {number} week le numéro de la nouvelle semaine.
   * @param {number} year l'année de la nouvelle semaine.
   * @returns {boolean} vrai si réussite (la semaine n'existait pas déjà), faux sinon.
   */
  addSemaine(week: number, year: number): boolean {
    for (const st of this.semaines) {
      if (st.week === week && st.year === year) {
        return false;
      }
    }

    const s = new Semaine(week, year);
    this.semaines.push(s);

    return true;
  }

  /**
   * Sélectionne la semaine week year.
   * @param {number} week le numéro de la semaine à sélectionner.
   * @param {number} year l'année de la semaine à sélectionner.
   * @returns {boolean} vrai si la semaine a été sélectionnée, faux sinon.
   */
  selectSemaine(week: number, year: number): boolean {
    for (const s of this.semaines) {
      if (s.week === week && s.year === year) {
        this.semainesSelectionnees = [s];
        return true;
      }
    }

    return false;
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
  applyExclusions(exclusions: Exclusion[]): boolean {
    this.semainesSelectionnees.forEach(s => s.applyExclusions(exclusions));
    return true;
  }

  /**
   * Analyse toutes les semaines sélectionnées.
   */
  analyse(): void {
    this.semainesSelectionnees.forEach(s => s.analyse());
  }
}
