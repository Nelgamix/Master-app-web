import {Cours} from './Cours';
import {PositionTemps} from './PositionTemps';
import {SetCours} from './SetCours';
import * as moment from 'moment';

/**
 * Représente un jour dans l'emploi du temps.
 */
export class Jour {
  date: any;

  debutJour: any;
  finJour: any;

  setCours: SetCours;
  setCoursActifs: SetCours;
  setCoursCaches: SetCours;
  setCoursSupprimes: SetCours;
  setCoursPrives: SetCours;

  positionTemps: PositionTemps;

  constructor(date: any) {
    this.date = date;
    this.positionTemps = PositionTemps.INDEFINI;
    this.setCours = new SetCours();
  }

  addCours(cours: Cours): number {
    return this.setCours.addCours(cours);
  }

  analyse(): void {
    // Analyse du jour
    this.analyseDebutJour();
    this.analyseFinJour();

    // Analyse/filtrage des sets
    this.setCours.analyse();
    this.analyseCoursActifs();
    this.analyseCoursCaches();
    this.analyseCoursSupprimes();
    this.analyseCoursPrives();

    // Analyse des sets
    this.setCoursActifs.analyse();
    this.setCoursCaches.analyse();
    this.setCoursSupprimes.analyse();
    this.setCoursPrives.analyse();
  }

  analysePositionTemps(now: any): void {
    this.positionTemps = (this.finJour.isBefore(now) ?
      PositionTemps.PASSE :
      (this.debutJour.isAfter(now) ?
        PositionTemps.FUTUR :
        PositionTemps.PRESENT
      )
    );

    this.setCours.getCours().forEach(c => c.analysePositionTemps(now));
  }

  private analyseDebutJour(): any {
    return (this.debutJour = this.date.clone());
  }

  private analyseFinJour(): any {
    return (this.finJour = this.date.clone().add(23, 'hours').add(59, 'minutes').add(59, 'seconds'));
  }

  private analyseCoursActifs(): SetCours {
    return (this.setCoursActifs = new SetCours(this.setCours.coursActifs));
  }

  private analyseCoursCaches(): SetCours {
    return (this.setCoursCaches = new SetCours(this.setCours.coursCaches));
  }

  private analyseCoursSupprimes(): SetCours {
    return (this.setCoursSupprimes = new SetCours(this.setCours.coursSupprimes));
  }

  private analyseCoursPrives(): SetCours {
    return (this.setCoursPrives = new SetCours(this.setCours.coursPrives));
  }
}
