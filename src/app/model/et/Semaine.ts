import {Jour} from './Jour';
import {Exclusion} from './Exclusion';
import {Cours} from './Cours';
import * as moment from 'moment';

/**
 * Représente une semaine dans l'emploi du temps.
 */
export class Semaine {
  /**
   * Le numéro de la semaine de cet objet.
   */
  week: number;

  /**
   * L'année de cet objet semaine.
   */
  year: number;

  /** Les jours de l'emploi du temps. */
  jours: Jour[];

  /**
   * L'ensemble des cours dans la semaine.
   * Il contient donc tous les cours de chaque jour de la semaine.
   */
  cours: Cours[];

  /**
   * Le premier jour de la semaine (Lundi) sous forme de moment()
   */
  premierJour: Jour;

  /**
   * Le dernier jour de la semaine (Vendredi) sous forme de moment()
   */
  dernierJour: Jour;

  /**
   * Objet contenant les stats calculées sur cette semaine.
   */
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

  /**
   * Analyse la semaine.
   */
  analyse(): void {
    for (const j of this.jours) {
      j.analyse();
    }

    this.analysePremierJour();
    this.analyseDernierJour();

    this.analyseCours();
    this.analyseStats();
  }

  /**
   * Ajoute un nouveau cours à la semaine.
   * Il est d'abord analysé si il appartient bien à la semaine,
   * puis on cherche à savoir à quel jour il appartient pour l'ajouter à ce jour.
   * @param {Cours} cours le cours à ajouter.
   * @returns {boolean} vrai si réussite (le cours est ajouté), faux sinon.
   */
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

  /**
   * Ajoute tous les cours passés en paramètre.
   * @param {Cours[]} cours les cours à ajouter.
   * @returns {boolean} vrai si tous les cours ont été ajoutés, faux sinon.
   */
  addAllCours(cours: Cours[]): boolean {
    let success = true;
    for (const c of cours) {
      if (!(success = this.addCours(c))) {
        break;
      }
    }

    return success;
  }

  /**
   * Applique les exclusions passées en paramètre.
   * @param {Exclusion[]} exclusions les exclusions à appliquer.
   * @returns {number} le nombre de cours exclus par les exclusions.
   */
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

  /**
   * Cherche le premier jour de la semaine, puis met à jour la variable premierJour.
   * @returns {Jour} le premier jour de la semaine.
   */
  private analysePremierJour(): Jour {
    return (this.premierJour = this.jours[0]);
  }

  /**
   * Cherche le dernier jour de la semaine, puis met à jour la variable dernierJour.
   * @returns {Jour}
   */
  private analyseDernierJour(): Jour {
    return (this.dernierJour = this.jours[this.jours.length - 1]);
  }

  /**
   * Met à jour la variable cours de la semaine en y ajoutant tous les cours de chaque jour.
   * @returns {Cours[]} la liste des cours de la semaine.
   */
  private analyseCours(): Cours[] {
    let ac = [];
    this.jours.forEach(j => ac = ac.concat(j.cours));
    return (this.cours = ac);
  }

  /**
   * Analyse quelques stats pour la semaine.
   * @returns {any} des stats.
   */
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
}
