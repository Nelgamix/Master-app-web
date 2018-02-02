import { Cours } from './cours';
import { Jour } from './jour';

import * as moment from 'moment';

export class EmploiTemps {
  cours: Cours[];
  jours: Jour[];

  premierJour: Jour;
  dernierJour: Jour;

  stats: {};

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

    this.analyseEt();
  }

  analyseEt(): void {
    this.stats = {};

    // Declarations
    const duree = moment.duration(0); // Nombre d'heures total
    const types = [];
    let moyenneCours; // Moyenne de la durée d'un cours
    let moyenneJours; // Moyenne d'heure de cours par jour
    let nombreCours = 0;
    let nombreJours = 0;

    // Pré-traitement
    // rien

    // Traitement
    for (const j of this.jours) {
      if (j) {
        nombreJours++;
        nombreCours += j.coursActifs.length;
        duree.add(j.duree);
        for (const t in j.typesCount) {
          if (types.hasOwnProperty(t)) {
            types[t] += j.typesCount[t];
          } else {
            types[t] = j.typesCount[t];
          }
        }
      }
    }

    // Post-traitement
    moyenneCours = moment.duration(nombreCours > 0 ? duree.asMinutes() / nombreCours : 0, 'minutes');
    moyenneJours = moment.duration(nombreJours > 0 ? duree.asMinutes() / nombreJours : 0, 'minutes');

    // Write
    this.stats['duree'] = {title: 'Durée totale', value: duree};
    this.stats['moyenneCours'] = {title: 'Moyenne par cours', value: moyenneCours};
    this.stats['moyenneJours'] = {title: 'Moyenne par jour', value: moyenneJours};
    this.stats['nombreCours'] = {title: 'Nombre de cours', value: nombreCours};
    this.stats['nombreJours'] = {title: 'Nombre de jours', value: nombreJours};
    for (const t in types) {
      this.stats['nb' + t.replace('/', '_')] = {title: 'Nombre de ' + t, value: types[t]};
    }

    this.premierJour = this.jours[0];
    this.dernierJour = this.jours[this.jours.length - 1];
  }

  filterExclusions(exclusions) {
    for (const c of this.cours) {
      c.cache = false;
      c.supprime = false;
    }

    for (const e of exclusions) {
      for (const c of this.cours) {
        if (c[e.type].includes(e.contient)) {
          if (e.supprime) {
            c.supprime = true;
          } else {
            c.cache = true;
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
