import { Cours } from './Cours';
import * as moment from 'moment';

/**
 * Représente un jour dans l'emploi du temps.
 */
export class Jour {
  date: any;

  debutJour: any;
  finJour: any;

  premierCours: Cours;
  dernierCours: Cours;

  cours: Cours[];
  coursActifs: Cours[];
  coursCaches: Cours[];
  coursSupprimes: Cours[];
  coursPrives: Cours[];

  types: any;
  conflits: any;
  duree: any;

  constructor(date: any) {
    this.date = date;
    this.cours = [];
  }

  /**
   * Teste la présence d'un array dans un array d'array: [[]].indexOf([])
   * Retourne l'index auquel on a trouvé la présence de l'array cible
   * @param {any[]} array
   * @param {any[]} element
   * @returns {number}
   */
  private static indexOfArray(array: any[], element: any[]): number {
    let index = -1;
    let k = 0;
    for (const e of array) {
      if (e.length !== element.length) {
        // Si les arrays n'ont pas la même longueur, pas la peine de tester, ils ne seront pas égaux
        continue;
      }

      // Boucle principale de test
      let i;
      for (i = 0; i < e.length; i++) {
        if (e[i] !== element[i]) {
          // Si les deux éléments sont différents, alors on stoppe
          break;
        }
      }

      // On doit tester si on est arrivé à la fin.
      if (i === e.length) {
        // Si oui, les deux éléments sont égaux.
        index = k;
        break;
      }

      k++;
    }

    return index;
  }

  private analyseDebutJour(): any {
    return (this.debutJour = this.date.clone());
  }

  private analyseFinJour(): any {
    return (this.finJour = this.date.clone().add(23, 'hours').add(59, 'minutes').add(59, 'seconds'));
  }

  private analysePremierCours(): Cours {
    let pc = this.cours.length > 0 ? this.cours[0] : null;

    this.cours.forEach(c => {
      if (pc.debut.isAfter(c.debut)) {
        pc = c;
      }
    });

    return (this.premierCours = pc);
  }

  private analyseDernierCours(): Cours {
    let dc = this.cours.length > 0 ? this.cours[0] : null;

    this.cours.forEach(c => {
      if (dc.debut.isBefore(c.debut)) {
        dc = c;
      }
    });

    return (this.dernierCours = dc);
  }

  private analyseCoursActifs(): Cours[] {
    return (this.coursActifs = this.cours.filter(c => !c.supprime && !c.cache));
  }

  private analyseCoursCaches(): Cours[] {
    return (this.coursCaches = this.cours.filter(c => c.cache));
  }

  private analyseCoursSupprimes(): Cours[] {
    return (this.coursSupprimes = this.cours.filter(c => c.supprime));
  }

  private analyseCoursPrives(): Cours[] {
    return (this.coursSupprimes = this.cours.filter(c => c.prive));
  }

  private analyseTypes(): any {
    const o = {};
    for (const c of this.coursActifs) {
      if (c.type.length === 0) {
        continue;
      }

      const typestring = c.type.join('/');
      if (o.hasOwnProperty(typestring)) {
        o[typestring] += 1;
      } else {
        o[typestring] = 1;
      }
    }

    return (this.types = o);
  }

  analyse(): void {
    this.sortCours('debut');

    // Analyse du jour
    this.analyseDebutJour();
    this.analyseFinJour();

    // Analyse des cours
    this.analysePremierCours();
    this.analyseDernierCours();

    // Analyse des types des cours
    this.analyseCoursActifs();
    this.analyseCoursCaches();
    this.analyseCoursSupprimes();
    this.analyseCoursPrives();

    // Analyse des types
    this.analyseTypes();

    // Analyse conflits + calcul duree
    this.chercherConflits();
  }

  addCours(cours: Cours): boolean {
    this.cours.push(cours);
    return true;
  }

  private sortCours(field): any {
    this.cours.sort((l, r) => {
      return l[field].isBefore(r[field]) ? -1 : 1;
    });
  }

  /**
   * Cherche les conflits dans les cours.
   * Réalise aussi le calcul de la durée réelle de la journée.
   */
  private chercherConflits(): void {
    const a: Cours[] = []; // liste des cours déjà analysés
    const d = moment.duration(0); // duration totale
    let lcf; // last cours fin (fin du cours qui fini en dernier)

    this.conflits = [];
    // Les cours sont triés.
    for (const c of this.coursActifs) { // pour chaque cours
      const cp = []; // conflits partiels
      lcf = null;
      for (const e of a) { // pour chaque cours déjà analysé, on check si il y a conflit
        if (c.debut.isBefore(e.fin)) { // donc si le debut du cours est avant la fin d'un cours déjà analysé,
          cp.push(e);
        }

        if (lcf === null || lcf.isBefore(e.fin)) {
          lcf = e.fin;
        }
      }

      if (cp.length > 0) {
        const io = Jour.indexOfArray(this.conflits, cp);
        if (io < 0) {
          cp.push(c);
          this.conflits.push(cp);
        } else {
          this.conflits[io].push(c);
        }

        if (c.fin.isAfter(lcf)) {
          d.add(moment.duration(c.fin.diff(lcf)));
        }
      } else {
        d.add(moment.duration(c.fin.diff(c.debut)));
      }

      a.push(c);
    }

    this.duree = d;
  }
}
