import {Jour} from './Jour';
import {Exclusion} from './Exclusion';
import {Cours} from './Cours';
import {PositionTemps} from './PositionTemps';
import {EnsembleCours} from './EnsembleCours';
import * as moment from 'moment';

export class SemaineDate {
  semaine: number;
  annee: number;
  dateDebut: any;
  dateFin: any;

  constructor(semaine: number, annee: number, dateDebut: string, dateFin: string) {
    this.semaine = +semaine;
    this.annee = +annee;
    this.dateDebut = moment(dateDebut);
    this.dateFin = moment(dateFin);

    if (!this.dateDebut.isValid() || !this.dateFin.isValid()) {
      throw new Error('date invalid');
    }
  }

  static fromSemaineAnnee(semaine: number, annee: number): SemaineDate {
    const dd = moment().weekday(0).year(annee).week(semaine);
    const df = dd.clone().weekday(4);
    return new SemaineDate(semaine, annee, dd.format(), df.format());
  }

  equals(o: SemaineDate): boolean {
    return o.dateDebut === this.dateDebut && o.dateFin === this.dateFin;
  }
}

/**
 * Représente une semaine dans l'emploi du temps.
 */
export class Semaine {
  date: SemaineDate;

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
  ensembleCours: EnsembleCours;

  /**
   * Le premier jour de la semaine (Lundi) sous forme de moment()
   */
  premierJour: Jour;

  /**
   * Le dernier jour de la semaine (Vendredi) sous forme de moment()
   */
  dernierJour: Jour;

  positionTemps: PositionTemps;

  constructor(week: number, year: number) {
    // On créé les jours
    this.date = SemaineDate.fromSemaineAnnee(week, year);
    this.positionTemps = PositionTemps.INDEFINI;
    this.jours = [];
    this.ensembleCours = new EnsembleCours();

    const wd = this.getWeekDays(); // Week days
    wd.forEach(d => this.jours.push(new Jour(d)));

    this.preAnalyse(moment());
  }

  preAnalyse(now: any): void {
    this.jours.forEach(j => j.preAnalyse(now));

    this.analysePremierJour();
    this.analyseDernierJour();

    this.analysePositionTemps(now);
  }

  /**
   * Analyse la semaine.
   * @param opt les options
   */
  analyse(opt?: any): void {
    this.jours.forEach(j => j.analyse(opt));

    this.ensembleCours.sum(this.jours.map(j => j.ensembleCours));
    this.ensembleCours.analyse(opt);
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
        if (success = (j.ensembleCours.setCours.getTaille() === j.addCours(cours) - 1)) {
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
    exclusions.forEach(e => e.count = 0);
    this.jours.forEach(j => total += j.applyExclusions(exclusions));
    return total;
  }

  private analysePositionTemps(now: any): void {
    this.positionTemps = (this.dernierJour.finJour.isBefore(now) ?
        PositionTemps.PASSE :
        (this.premierJour.debutJour.isAfter(now) ?
            PositionTemps.FUTUR :
            PositionTemps.PRESENT
        )
    );
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
   * Récupère tous les jours de la semaine de numéro week.
   * Renvoie un array contenant ces jours.
   * @param {number} week
   * @param {number} year
   * @returns {any[]}
   */
  private getWeekDays(): any[] {
    const a = []; // array qui contiendra les valeurs
    // On calcule le début de la semaine.
    const beginningOfWeek = moment().year(this.date.annee).week(this.date.semaine).startOf('week');

    // On ajoute à l'array
    a.push(beginningOfWeek);

    // Boucle pour le reste de la semaine
    for (let i = 1; i < 5; i++) {
      a.push(beginningOfWeek.clone().add(i, 'days'));
    }

    return a;
  }
}
