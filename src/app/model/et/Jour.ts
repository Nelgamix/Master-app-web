import {Cours} from './Cours';
import {PositionTemps} from './PositionTemps';
import {EnsembleCours} from './EnsembleCours';
import {Exclusion} from './Exclusion';

/**
 * Représente un jour dans l'emploi du temps.
 */
export class Jour {
  date: any;

  debutJour: any;
  finJour: any;

  ensembleCours: EnsembleCours;

  positionTemps: PositionTemps;

  constructor(date: any) {
    this.date = date;
    this.positionTemps = PositionTemps.INDEFINI;
    this.ensembleCours = new EnsembleCours();
  }

  addCours(cours: Cours): number {
    return this.ensembleCours.fill([cours]);
  }

  preAnalyse(now: any): void {
    this.ensembleCours.setCours.cours.forEach(c => c.preAnalyse(now));

    // Analyse du jour
    this.analyseDebutJour();
    this.analyseFinJour();

    this.analysePositionTemps(now);
  }

  analyse(opt?: any): void {
    this.ensembleCours.setCours.cours.forEach(c => c.analyse(opt));

    // Analyse/filtrage des sets
    this.ensembleCours.analyse(opt);
  }

  /**
   * Applique les exclusions passées en paramètre.
   * @param {Exclusion[]} exclusions les exclusions à appliquer.
   * @returns {number} le nombre de cours exclus par les exclusions.
   */
  applyExclusions(exclusions: Exclusion[]): number {
    let total = 0;

    // Obligé: si il n'y a pas d'exclusion, alors les cours ne sont jamais reset
    for (const c of this.ensembleCours.setCours.cours) {
      c.cache = false;
      c.supprime = false;
    }

    // Filtrage
    for (const e of exclusions) {
      total += e.testePlusieursCours(this.ensembleCours.setCours.cours);
    }

    return total;
  }

  private analysePositionTemps(now: any): void {
    this.positionTemps = (this.finJour.isBefore(now) ?
      PositionTemps.PASSE :
      (this.debutJour.isAfter(now) ?
        PositionTemps.FUTUR :
        PositionTemps.PRESENT
      )
    );
  }

  private analyseDebutJour(): any {
    return (this.debutJour = this.date.clone());
  }

  private analyseFinJour(): any {
    return (this.finJour = this.date.clone().add(23, 'hours').add(59, 'minutes').add(59, 'seconds'));
  }
}
