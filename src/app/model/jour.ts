import { Cours } from './cours';

import * as moment from 'moment';

export class Jour {
  nom: string;
  date: any;
  cours: Cours[];

  premierCours: Cours;
  dernierCours: Cours;
  duree: string;
  typesCount: any;

  constructor(cours) {
    this.nom = this.capitalizeFirstLetter(cours.debut.format('dddd'));
    this.date = cours.debut;
    this.cours = [];
  }

  ajouterCours(cours: Cours): void {
    this.cours.push(cours);
  }

  capitalizeFirstLetter(string): string {
      return string.charAt(0).toUpperCase() + string.slice(1);
  }

  analyse(): void {
    this.compteDuree();
    this.compteTypes();
    this.debutFin();
  }

  compteDuree(): void {
    const total = moment.duration(0);

    for (const c of this.cours) {
      total.add(moment.duration(c.fin.diff(c.debut)));
    }

    this.duree = total.hours() + ':' + (total.minutes() >= 10 ? total.minutes() : '0' + total.minutes());
  }

  compteTypes(): void {
    const o = {};
    for (const c of this.cours) {
      if (c.type == '') {
        continue;
      }

      if (o[c.type]) {
        o[c.type] += 1;
      } else {
        o[c.type] = 1;
      }
    }

    this.typesCount = o;
  }

  debutFin(): void {
    if (this.cours.length > 0) {
      this.cours.sort(this.sortCours('fin'));
      this.dernierCours = this.cours[this.cours.length - 1];

      this.cours.sort(this.sortCours('debut'));
      this.premierCours = this.cours[0];
    }
  }

  sortCours(field): any {
    return function(left, right) {
        return left[field].diff(right[field]) > 0;
    };
  }
}
