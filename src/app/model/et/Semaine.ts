import {Jour} from './Jour';
import {Exclusion} from './Exclusion';
import {Cours} from './Cours';
import * as moment from 'moment';

export class Semaine {
  week: number;
  year: number;

  /** Les jours de l'emploi du temps. */
  jours: Jour[];
  cours: Cours[];

  premierJour: Jour;
  dernierJour: Jour;

  stats: any;

  constructor(week: number, year: number) {
    const wd = Semaine.getWeekDays(week, year); // Week days

    // On créé les jours
    this.week = week;
    this.year = year;
    this.jours = [];
    for (const d of wd) {
      this.jours.push(new Jour(d));
    }

    this.analyse();
  }

  /**
   * Récupère tous les jours de la semaine de numéro week.
   * Renvoie un array contenant ces jours.
   * @param {number} week
   * @param {number} year
   * @returns {any[]}
   */
  private static getWeekDays(week: number, year: number): any[] {
    const a = []; // array qui contiendra les valeurs
    // On calcule le début de la semaine.
    const beginningOfWeek = moment().year(year).week(week).startOf('week');

    // On ajoute à l'array
    a.push(beginningOfWeek);

    // Boucle pour le reste de la semaine
    for (let i = 1; i < 5; i++) {
      a.push(beginningOfWeek.clone().add(i, 'days'));
    }

    return a;
  }

  private analysePremierJour(): Jour {
    return (this.premierJour = this.jours[0]);
  }

  private analyseDernierJour(): Jour {
    return (this.dernierJour = this.jours[this.jours.length - 1]);
  }

  private analyseCours(): Cours[] {
    let ac = [];
    this.jours.forEach(j => ac = ac.concat(j.cours));
    return (this.cours = ac);
  }

  private analyseStats(): any {
    const stats = {};

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
      if (j && j.coursActifs.length > 0) {
        nombreJours++;
        nombreCours += j.coursActifs.length;
        duree.add(j.duree);
        for (const t in j.types) {
          if (j.types.hasOwnProperty(t) && types.hasOwnProperty(t)) {
            types[t] += j.types[t];
          } else {
            types[t] = j.types[t];
          }
        }
      }
    }

    // Post-traitement
    moyenneCours = moment.duration(nombreCours > 0 ? duree.asMinutes() / nombreCours : 0, 'minutes');
    moyenneJours = moment.duration(nombreJours > 0 ? duree.asMinutes() / nombreJours : 0, 'minutes');

    // Write
    stats['duree'] = {title: 'Durée totale', value: duree};
    stats['moyenneCours'] = {title: 'Moyenne par cours', value: moyenneCours};
    stats['moyenneJours'] = {title: 'Moyenne par jour', value: moyenneJours};
    stats['nombreCours'] = {title: 'Nombre de cours', value: nombreCours};
    stats['nombreJours'] = {title: 'Nombre de jours', value: nombreJours};
    for (const t in types) {
      if (types.hasOwnProperty(t)) {
        stats['nb' + t.replace('/', '_')] = {title: 'Nombre de ' + t, value: types[t]};
      }
    }

    this.premierJour = this.jours[0];
    this.dernierJour = this.jours[this.jours.length - 1];

    return (this.stats = stats);
  }

  analyse(): void {
    for (const j of this.jours) {
      j.analyse();
    }

    this.analysePremierJour();
    this.analyseDernierJour();

    this.analyseCours();
    this.analyseStats();
  }

  addCours(cours: Cours): boolean {
    // Vérifier que le cours est dans la bonne semaine (la semaine actuelle)
    if (cours.debut.isBefore(this.premierJour.debutJour) || cours.debut.isAfter(this.dernierJour.finJour)) {
      return false;
    }

    let success = false;
    const d = cours.debut.clone().startOf('day');
    for (const j of this.jours) {
      if (d.isSame(j.debutJour)) {
        // Le bon jour
        if (success = j.addCours(cours)) {
          break;
        }
      }
    }

    return success;
  }

  addAllCours(cours: Cours[]): boolean {
    let success = true;
    for (const c of cours) {
      if (!(success = this.addCours(c))) {
        break;
      }
    }

    return success;
  }

  applyExclusions(exclusions: Exclusion[]): number {
    let total = 0;

    // Obligé: si il n'y a pas d'exclusion, alors les cours ne sont jamais reset
    for (const c of this.cours) {
      c.cache = false;
      c.supprime = false;
    }

    // Filtrage
    for (const e of exclusions) {
      e.count = 0;
      total += e.testePlusieursCours(this.cours);
    }

    return total;
  }
}
