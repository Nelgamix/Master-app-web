import { Cours } from './cours';
import { Jour } from './jour';

import * as moment from 'moment';

export class EmploiTemps {
  cours: Cours[];
  jours: Jour[];

  constructor() {
    moment.locale('fr');
    this.reInit();
  }

  init(cours): void {
    this.reInit();

    // Ajouter les cours depuis les données json récupérées
    for (const c of cours) {
      this.cours.push(new Cours(c));
    }

    // Pour chaque cours, on le met au bon endroit dans les jours (pour l'affichage)
    for (const c of this.cours) {
      const j = c.debut.weekday();

      if (this.verifierJour(j)) {
        this.jours[j] = new Jour(c);
      }

      this.jours[j].ajouterCours(c);
    }

    this.analyse();
  }

  analyse(): void {
    for (const j of this.jours) {
      if (j) {
        j.analyse();
      }
    }
  }

  filterExclusions(exclusions) {
    for (const e of exclusions) {
      if (e.contient.length > 0) { // TODO: Delete if there is nothing
        for (const c of this.cours) {
          if (c[e.type].includes(e.contient)) {
            c.exclu = true;
          }
        }
      }
    }
  }

  private verifierJour(n: number): boolean {
    while (this.jours.length <= n) {
      this.jours.push(null);
    }

    return this.jours[n] == null;
  }

  reInit(): void {
    this.jours = [];
    this.cours = [];
  }
}
