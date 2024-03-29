import {Semaine} from './Semaine';
import {Cours} from './Cours';

export enum CoursPersoRecurrence {
  UNIQUE, // on doit donner toutes les infos (année, mois, jour, heure, minutes)
  JOUR, // on ne donne que l'heure
  SEMAINE // on donne jour de la semaine (lundi, ...), et heure
}

export class CoursPerso {
  /**
   * La récurrence du cours.
   */
  recurrence: CoursPersoRecurrence;

  /**
   * La date de référence du cours.
   * Objet moment.
   */
  date: any;

  /**
   * Heure de début.
   * En minutes.
   */
  debut: number;

  /**
   * Heure de fin.
   * En minutes.
   */
  fin: number;

  /**
   * Description du cours.
   */
  description: string;

  /**
   * Nom du cours
   */
  nom: string;

  /**
   * Type du cours.
   */
  type: string;

  /**
   * Professeur pour le cours.
   */
  professeur: string;

  /**
   * Lieu pour le cours.
   */
  lieu: string;

  constructor(recurrence: CoursPersoRecurrence,
              date: any,
              debut: number,
              fin: number,
              description: string,
              nom: string,
              type?: string,
              professeur?: string,
              lieu?: string) {
    this.recurrence = recurrence;
    this.date = date;
    this.debut = debut;
    this.fin = fin;
    this.description = description;
    this.nom = nom;
    this.type = type;
    this.professeur = professeur;
    this.lieu = lieu;
  }

  testePlusieursSemaine(semaines: Semaine[], now: any, opt?: any): number {
    let total = 0;
    semaines.forEach(s => total += this.testeSemaine(s, now, opt));
    return total;
  }

  estVide(): boolean {
    return this.nom.length < 1 &&
      this.date &&
      this.debut > -1 &&
      this.fin > -1 &&
      this.debut < 24 * 60 &&
      this.fin < 24 * 60 &&
      this.debut < this.fin;
  }

  testeSemaine(semaine: Semaine, now: any, opt?: any): number {
    if (opt && !opt.coursPersoSemaineVide && semaine.ensembleCours.setCours.getTaille() === 0) {
      return 0;
    }

    let total = 0;
    let d, debut, fin;
    switch (this.recurrence) {
      case CoursPersoRecurrence.UNIQUE:
        console.log('Non implémenté.');
        break;
      case CoursPersoRecurrence.JOUR:
        semaine.jours.forEach(j => {
          d = j.date.clone();
          debut = d.add(this.debut, 'minutes');
          fin = debut.clone().add(this.fin - this.debut, 'minutes');

          if (!this.addCoursToSemaine(semaine, debut, fin, now)) {
            console.error('could not add cours perso to semaine');
          }

          total++;
        });
        break;
      case CoursPersoRecurrence.SEMAINE:
        const dp = this.date.weekday(); // day of the week

        d = semaine.premierJour.date.clone().add(dp, 'days');
        debut = d.add(this.debut, 'minutes');
        fin = debut.clone().add(this.fin - this.debut, 'minutes');

        if (!this.addCoursToSemaine(semaine, debut, fin, now)) {
          console.error('could not add cours perso to semaine');
        }

        total++;
        break;
    }

    return total;
  }

  clone(): CoursPerso {
    return new CoursPerso(
      this.recurrence,
      this.date.clone(),
      this.debut,
      this.fin,
      this.description,
      this.nom,
      this.type,
      this.professeur,
      this.lieu
    );
  }

  private addCoursToSemaine(semaine: Semaine, debut: any, fin: any, now: any): boolean {
    const nc = new Cours({
      nom: this.nom,
      description: this.description,
      type: [this.type],
      professeur: this.professeur,
      salles: [{batiment: '', salle: this.lieu}],
      debut: debut,
      fin: fin,
      prive: true
    });
    nc.preAnalyse(now);

    return semaine.addCours(nc);
  }
}
