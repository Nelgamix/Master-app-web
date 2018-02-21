import {Jour} from './Jour';
import {Exclusion} from './Exclusion';
import {Cours} from './Cours';
import {SetCours} from './SetCours';
import * as moment from 'moment';
import {PositionTemps} from './PositionTemps';

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

  /**
   * Date de dernière modification sur le serveur.
   */
  updated: any;

  /**
   * Les jours de l'emploi du temps.
   */
  jours: Jour[];

  /**
   * L'ensemble des cours dans la semaine.
   * Il contient donc tous les cours de chaque jour de la semaine.
   */
  setCours: SetCours;

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

  positionTemps: PositionTemps;

  constructor(week: number, year: number) {
    const wd = Semaine.getWeekDays(week, year); // Week days

    // On créé les jours
    this.week = week;
    this.year = year;
    this.positionTemps = PositionTemps.INDEFINI;
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
    this.jours.forEach(j => j.analyse());

    this.analysePremierJour();
    this.analyseDernierJour();

    this.analysePositionTemps();

    this.analyseCours();
    this.setCours.analyse();
    this.stats = this.setCours.getStats();
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
        if (success = (j.setCours.getTaille() === j.addCours(cours) - 1)) {
          this.setCours.addCours(cours);
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
    for (const c of this.setCours.cours) {
      c.cache = false;
      c.supprime = false;
    }

    // Filtrage
    for (const e of exclusions) {
      e.count = 0;
      total += e.testePlusieursCours(this.setCours.cours);
    }

    return total;
  }

  private analysePositionTemps(): void {
    const now = moment();

    this.positionTemps = (this.dernierJour.finJour.isBefore(now) ?
        PositionTemps.PASSE :
        (this.premierJour.debutJour.isAfter(now) ?
            PositionTemps.FUTUR :
            PositionTemps.PRESENT
        )
    );

    this.jours.forEach(j => j.analysePositionTemps(now));
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
  private analyseCours(): SetCours {
    let ac = [];
    this.jours.forEach(j => ac = ac.concat(j.setCours.cours));
    return (this.setCours = new SetCours(ac));
  }
}
