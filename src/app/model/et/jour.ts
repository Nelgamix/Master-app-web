import { Cours } from './cours';

import * as moment from 'moment';

export class Jour {
  nom: string;
  date: any;
  cours: Cours[];

  premierCours: Cours;
  dernierCours: Cours;
  duree: any; // moment duration
  typesCount: any;

  constructor(cours) {
    this.nom = Jour.capitalizeFirstLetter(cours.debut.format('dddd'));
    this.date = cours.debut.clone().hours(0).minutes(0).seconds(0);
    this.cours = [];
  }

  static capitalizeFirstLetter(string): string {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  get coursActifs() {
    const cs = [];
    for (const c of this.cours) {
      if (!c.cache && !c.supprime) {
        cs.push(c);
      }
    }
    return cs;
  }

  ajouterCours(cours: Cours): void {
    this.cours.push(cours);
  }

  analyse(): void {
    this.compteDuree();
    this.compteTypes();
    this.debutFin();
  }

  compteDuree(): void {
    const total = moment.duration(0);

    for (const c of this.coursActifs) {
      total.add(moment.duration(c.fin.diff(c.debut)));
    }

    this.duree = total;
  }

  compteTypes(): void {
    const o = {};
    for (const c of this.coursActifs) {
      if (c.type === '') {
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
    const cs = this.coursActifs;

    if (cs.length < 1) {
      return;
    }

    let minDeb = cs[0];
    let maxFin = cs[0];
    for (const c of cs) {
      if (c.debut.diff(minDeb.debut) < 0) {
        minDeb = c;
      }

      if (c.fin.diff(maxFin.fin) > 0) {
        maxFin = c;
      }
    }

    this.premierCours = minDeb;
    this.dernierCours = maxFin;
  }

  sortCours(field): any {
    return function(left, right) {
        return left[field].diff(right[field]) > 0;
    };
  }
}
