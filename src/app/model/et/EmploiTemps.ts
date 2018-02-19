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

  getSemaineUnique(): Semaine | null {
    if (this.semainesSelectionnees.length < 1) {
      console.error('Aucune semaine sélectionnée.');
      return null;
    }

    return this.semainesSelectionnees[0];
  }

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

  selectSemaine(week: number, year: number): boolean {
    for (const s of this.semaines) {
      if (s.week === week && s.year === year) {
        this.semainesSelectionnees = [s];
        return true;
      }
    }

    return false;
  }

  addCours(cours: Cours[]): boolean {
    if (this.semainesSelectionnees.length !== 1) {
      console.error('Nombre de semaine sélectionnées incorrect.');
      return false;
    }

    this.semainesSelectionnees[0].addAllCours(cours);
    return true;
  }

  applyExclusions(exclusions: Exclusion[]): boolean {
    this.semainesSelectionnees.forEach(s => s.applyExclusions(exclusions));
    return true;
  }

  analyse(): void {
    this.semainesSelectionnees.forEach(s => s.analyse());
  }
}
