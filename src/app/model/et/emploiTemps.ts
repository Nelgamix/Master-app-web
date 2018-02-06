import { Cours } from './cours';
import { Jour } from './jour';

import * as moment from 'moment';
import {Exclusion} from './exclusion';

/**
 * Représente une semaine entière de l'emploi du temps.
 */
export class EmploiTemps {
  /**
   * Tous les cours qui composent la semaine d'emploi du temps.
   */
  cours: Cours[];

  /**
   * Tous les jours qui composent la semaine d'emploi du temps.
   */
  jours: Jour[];

  /**
   * Le premier jour de la semaine.
   */
  premierJour: Jour;

  /**
   * Le dernier jour de la semaine.
   */
  dernierJour: Jour;

  /**
   * Contient les stats de la semaine.
   * Ex: {"nombreCours" => "5", "ex 2" => "truc"}
   */
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

  filterExclusions(exclusions: Exclusion[]) {
    // Obligé: si il n'y a pas d'exclusion, alors les cours ne sont jamais reset
    for (const c of this.cours) {
      c.cache = false;
      c.supprime = false;
    }

    // Filtrage
    for (const e of exclusions) {
      e.count = 0;
      e.testePlusieursCours(this.cours);
      // e.print();
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
