import {SetCours} from './SetCours';
import {Cours} from './Cours';

export class EnsembleCours {
  setCours: SetCours;
  setCoursActifs: SetCours;
  setCoursCaches: SetCours;
  setCoursSupprimes: SetCours;
  setCoursPrives: SetCours;

  constructor() {
    this.setCours = new SetCours();
  }

  fill(cours: Cours[]): number {
    return this.setCours.addAllCours(cours);
  }

  sum(es: EnsembleCours[]): void {
    this.setCours = new SetCours();
    es.forEach(e => {
      this.setCours.addAllCours(e.setCours.cours);
    });
  }

  analyse(opt?: any): void {
    this.setCours.analyse(opt);

    this.setCoursActifs = new SetCours(this.setCours.coursActifs);
    this.setCoursCaches = new SetCours(this.setCours.coursCaches);
    this.setCoursSupprimes = new SetCours(this.setCours.coursSupprimes);
    this.setCoursPrives = new SetCours(this.setCours.coursPrives);

    this.setCoursActifs.analyse(opt);
    this.setCoursCaches.analyse(opt);
    this.setCoursSupprimes.analyse(opt);
    this.setCoursPrives.analyse(opt);
  }
}
