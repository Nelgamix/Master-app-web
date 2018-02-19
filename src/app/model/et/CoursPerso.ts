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

  testePlusieursSemaine(semaines: Semaine[]): number {
    let total = 0;
    semaines.forEach(s => total += this.testeSemaine(s));
    return total;
  }

  testeSemaine(semaine: Semaine): number {
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

          this.addCoursToSemaine(semaine, debut, fin);

          total++;
        });
        break;
      case CoursPersoRecurrence.SEMAINE:
        const dp = this.date.weekday(); // day of the week

        d = semaine.premierJour.date.clone().add(dp, 'days');
        debut = d.add(this.debut, 'minutes');
        fin = debut.clone().add(this.fin - this.debut, 'minutes');

        this.addCoursToSemaine(semaine, debut, fin);

        total++;
        break;
    }

    return total;
  }

  private addCoursToSemaine(semaine: Semaine, debut: any, fin: any): void {
    semaine.addCours(new Cours({
      nom: this.nom,
      description: this.description,
      type: [this.type],
      professeur: this.professeur,
      salles: [{batiment: '', salle: this.lieu}],
      debut: debut,
      fin: fin,
      prive: true
    }));
  }
}
