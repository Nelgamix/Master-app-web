import {Cours} from './Cours';
import {PositionTemps} from './PositionTemps';
import * as moment from 'moment';

// TODO: DOC

/**
 * Représente un ensemble de cours. Calcule des stats sur cet ensemble.
 */
export class SetCours {
  cours: Cours[];
  jours: any[];

  premierCours: Cours;
  dernierCours: Cours;

  noms: any;
  types: any;
  professeurs: any;
  salles: any;

  conflits: any;
  duree: any;
  dureeTotale: any;

  nombreDeCours: number;
  nombreDeJours: number;
  moyenneParCours: any;
  moyenneParJour: any;

  coursPrecedent: Cours;
  coursActuel: Cours;
  coursSuivant: Cours;

  coursActifs: Cours[];
  coursCaches: Cours[];
  coursSupprimes: Cours[];
  coursPrives: Cours[];
  coursPasses: Cours[];
  coursFuturs: Cours[];

  stats: any;

  constructor(cours: Cours[] = []) {
    this.cours = cours;
  }

  private static analyseX(x: any[]): any {
    const o = {};
    for (const e of x) {
      if (e.length === 0) {
        continue;
      }

      o[e] = o.hasOwnProperty(e) ? o[e] + 1 : 1;
    }

    return o;
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

  analyse(opt?: any): void {
    this.sort();

    if (opt && opt.cacherCoursPasses) {
      this.cours.forEach(c => {
        if (!c.cache && !c.supprime && c.positionTemps === PositionTemps.PASSE) {
          c.cache = true;
        }
      });
    }

    this.analysePremierCours();
    this.analyseDernierCours();

    this.analyseNoms();
    this.analyseProfesseurs();
    this.analyseTypes();
    this.analyseSalles();

    this.analyseFiltrerCours();
    this.analyseConflits();
    this.analysePrecedence();
    this.analyseStats();

    this.getStats();
  }

  addCours(cours: Cours): number {
    return this.cours.push(cours);
  }

  addAllCours(cours: Cours[]): number {
    let s = -1;
    cours.forEach(c => s = this.addCours(c));
    return s;
  }

  getCours(): Cours[] {
    return this.cours;
  }

  getTaille(): number {
    return this.cours.length;
  }

  estVide(): boolean {
    return this.getTaille() === 0;
  }

  /**
   * Collecte et renvoie quelques stats pour le set.
   * @returns {any} les stats calculées.
   */
  getStats(): any {
    return this.stats ? this.stats : this.stats = {
      cours: {
        description: 'Liste des cours.',
        data: this.cours
      },
      jours: {
        description: 'Liste des jours.',
        data: this.jours
      },
      premierCours: {
        description: 'Premier cours.',
        data: this.premierCours
      },
      dernierCours: {
        description: 'Dernier cours.',
        data: this.dernierCours
      },
      noms: {
        description: 'Comptage des noms différents.',
        data: this.noms
      },
      types: {
        description: 'Comptage des types différents.',
        data: this.types
      },
      professeurs: {
        description: 'Comptage des professeurs différents.',
        data: this.professeurs
      },
      salles: {
        description: 'Comptage des salles différentes.',
        data: this.salles
      },
      conflits: {
        description: 'Conflits entre les cours (en terme d\'horaires).',
        data: this.conflits
      },
      duree: {
        description: 'Durée, avec prise en compte des conflits d\'horaire.',
        data: this.duree
      },
      dureeTotale: {
        description: 'Durée totale, sans prise en compte des conflits d\'horaire.',
        data: this.dureeTotale
      },
      nombreDeCours: {
        description: 'Nombre de cours.',
        data: this.nombreDeCours
      },
      nombreDeJours: {
        description: 'Nombre de jours.',
        data: this.nombreDeJours
      },
      moyenneParCours: {
        description: 'Moyenne par cours.',
        data: this.moyenneParCours
      },
      moyenneParJour: {
        description: 'Moyenne par jour.',
        data: this.moyenneParJour
      },
      coursPrecedent: {
        description: 'Cours précédent.',
        data: this.coursPrecedent
      },
      coursActuel: {
        description: 'Cours actuel.',
        data: this.coursActuel
      },
      coursSuivant: {
        description: 'Cours suivant.',
        data: this.coursSuivant
      },
      coursActifs: {
        description: 'Liste de cours actifs.',
        data: this.coursActifs
      },
      coursCaches: {
        description: 'Liste de cours cachés.',
        data: this.coursCaches
      },
      coursSupprimes: {
        description: 'Liste de cours supprimés.',
        data: this.coursSupprimes
      },
      coursPrives: {
        description: 'Liste de cours privés.',
        data: this.coursPrives
      },
      coursPasses: {
        description: 'Liste de cours passés.',
        data: this.coursPasses
      },
      coursFuturs: {
        description: 'Liste de cours futurs.',
        data: this.coursFuturs
      }
    };
  }

  /**
   * Trie les cours en fonction du champ fieldDate en premier, puis si même date, en fonction de fieldSec.
   * @param fieldDate le champ date (debut|fin) sur lequel trier les cours.
   * @param fieldSec le champ sur lequel trier les cours si fieldDate ne permet pas de déterminer l'ordre.
   */
  private sort(fieldDate: string = 'debut', fieldSec: string = 'nom'): void {
    this.cours.sort((l, r) => {
      if (l[fieldDate].isSame(r[fieldDate])) {
        // Trier sur fieldSec
        return l[fieldSec].localeCompare(r[fieldSec]);
      }

      return l[fieldDate].isBefore(r[fieldDate]) ? -1 : 1;
    });
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

  private analyseNoms(): any {
    const a = [];
    this.cours.forEach(c => a.push(c.nom));

    return (this.noms = SetCours.analyseX(a));
  }

  private analyseTypes(): any {
    const a = [];
    this.cours.forEach(c => a.push(c.type.join('/')));

    return (this.types = SetCours.analyseX(a));
  }

  private analyseProfesseurs(): any {
    const a = [];
    this.cours.forEach(c => a.push(c.professeur));

    return (this.professeurs = SetCours.analyseX(a));
  }

  private analyseSalles(): any {
    const a = [];
    this.cours.forEach(c => c.salles.forEach(s => a.push(s['salle'])));

    return (this.salles = SetCours.analyseX(a));
  }

  private analyseFiltrerCours(): void {
    this.coursActifs = this.getCours().filter(c => !c.cache && !c.supprime);
    this.coursCaches = this.getCours().filter(c => c.cache);
    this.coursSupprimes = this.getCours().filter(c => c.supprime);
    this.coursPrives = this.getCours().filter(c => c.prive);
    this.coursPasses = this.getCours().filter(c => c.positionTemps === PositionTemps.PASSE);
    this.coursFuturs = this.getCours().filter(c => c.positionTemps === PositionTemps.FUTUR);
  }

  /**
   * Cherche les conflits dans les cours.
   * Réalise aussi le calcul de la durée réelle de la journée.
   */
  private analyseConflits(): void {
    const a: Cours[] = []; // liste des cours déjà analysés
    const d = moment.duration(0); // duration totale
    let lcf; // last cours fin (fin du cours qui fini en dernier)

    this.conflits = [];
    // Les cours sont triés.
    for (const c of this.cours) { // pour chaque cours
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
        const io = SetCours.indexOfArray(this.conflits, cp);
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

  private analysePrecedence(): void {
    for (const c of this.cours) {
      if (c.positionTemps === PositionTemps.PASSE) {
        this.coursPrecedent = c; // erase previous.
      } else if (c.positionTemps === PositionTemps.PRESENT) {
        if (!this.coursActuel) {
          this.coursActuel = c; // don't erase current.
        }
      } else if (c.positionTemps === PositionTemps.FUTUR) {
        if (!this.coursSuivant) {
          this.coursSuivant = c; // don't erase current.
        }
      }
    }
  }

  private analyseStats(): void {
    this.nombreDeCours = 0;
    this.nombreDeJours = 0;

    this.jours = [];
    const total = moment.duration(0);
    for (const c of this.cours) {
      const cf = c.debut.clone().startOf('day');
      const found = this.jours.find(n => n.date.isSame(cf));
      if (!found) {
        this.nombreDeJours++;
        this.jours.push({
          date: cf,
          cours: [c]
        });
      } else {
        found.cours.push(c);
      }

      this.nombreDeCours++;
      total.add(c.duree);
    }

    this.dureeTotale = total;
    this.moyenneParCours = moment.duration(this.nombreDeCours > 0 ? total.asMinutes() / this.nombreDeCours : 0, 'minutes');
    this.moyenneParJour = moment.duration(this.nombreDeJours > 0 ? total.asMinutes() / this.nombreDeJours : 0, 'minutes');
  }
}
