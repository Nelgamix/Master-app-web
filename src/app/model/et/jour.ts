import { Cours } from './cours';

import * as moment from 'moment';

/**
 * Représente un jour dans l'emploi du temps.
 */
export class Jour {
  /**
   * Le nom du jour.
   * Ex: 'Lundi'
   */
  nom: string;

  /**
   * La date correspond au jour.
   */
  date: any;

  /**
   * Les cours qui ont lieu ce jour.
   * Regroupe donc tous les cours de coursActifs, coursCaches, et coursSupprimes
   * coursActifs U coursCaches U coursSupprimes = cours
   */
  cours: Cours[];

  /**
   * Les cours actifs qui ont lieu dans ce jour.
   */
  coursActifs: Cours[];

  /**
   * Les cours cachés qui ont lieu dans ce jour.
   */
  coursCaches: Cours[];

  /**
   * Les cours supprimes qui ont lieu dans ce jour.
   */
  coursSupprimes: Cours[];

  /**
   * Le premier cours de la journée.
   */
  premierCours: Cours;

  /**
   * Le dernier cours de la journée.
   */
  dernierCours: Cours;

  /**
   * La durée (sous forme de moment.duration) de la journée
   */
  duree: any;

  /**
   * Un objet contenant le compte des différents types de cours.
   * Ex: {'TD': 4, 'CM': 2}
   */
  typesCount: any;

  /**
   * Liste de conflits entre les différents cours.
   * Ex: [[c1, c2], [c3, c4], [c8, c9, c10]] indique que le cours c1 est en conflit avec c2, ...
   */
  conflits: any;

  /**
   * Construit le jour, à partir d'un cours.
   * Ce cours sert à déterminer la date, ainsi que le nom du jour.
   * @param cours le cours pour la création du jour.
   */
  constructor(cours) {
    this.nom = Jour.capitalizeFirstLetter(cours.debut.format('dddd'));
    this.date = cours.debut.clone().hours(0).minutes(0).seconds(0);

    this.cours = [];
    this.coursActifs = [];
    this.coursCaches = [];
    this.coursSupprimes = [];
  }

  /**
   * Capitalise la chaîne de caractères. (= passe le premier caractère en majuscule)
   * @param string la chaîne de caractère à capitaliser
   * @returns {string}
   */
  private static capitalizeFirstLetter(string): string {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  get coursPrive(): Cours[] {
    const a = [];
    for (const c of this.cours) {
      if (c.prive) {
        a.push(c);
      }
    }
    return a;
  }

  ajouterCours(cours: Cours): void {
    this.cours.push(cours);
  }

  analyse(): void {
    this.sortCours('debut');
    this.trierCours();

    this.compteDuree();
    this.compteTypes();
    this.debutFin();
    this.chercherConflits();
  }

  /**
   * Trie les cours selon le fait qu'ils soient actifs, cachés, ou supprimés.
   * Ne fait que les ranger dans le bon array.
   */
  private trierCours(): void {
    // Remettre à zéro
    this.coursActifs.splice(0, this.coursActifs.length);
    this.coursCaches.splice(0, this.coursCaches.length);
    this.coursSupprimes.splice(0, this.coursSupprimes.length);

    // Faire le tri
    for (const c of this.cours) {
      if (c.cache) {
        this.coursCaches.push(c);
      } else if (c.supprime) {
        this.coursSupprimes.push(c);
      } else {
        this.coursActifs.push(c);
      }
    }
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
        const io = this.indexOfArray(this.conflits, cp);
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

  /**
   * Teste la présence d'un array dans un array d'array: [[]].indexOf([])
   * Retourne l'index auquel on a trouvé la présence de l'array cible
   * @param {any[]} array
   * @param {any[]} element
   * @returns {number}
   */
  private indexOfArray(array: any[], element: any[]): number {
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

  private compteDuree(): void {
    this.duree = moment.duration(0);
    this.coursActifs.forEach(e => this.duree.add(e.duree));
  }

  private compteTypes(): void {
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

    this.typesCount = o;
  }

  private debutFin(): void {
    const cs = this.coursActifs;

    if (cs.length < 1) {
      return;
    }

    let minDeb = cs[0];
    let maxFin = cs[0];
    for (const c of cs) {
      if (c.debut.diff(minDeb.debut) < 0) {
        minDeb = c;
      }

      if (c.fin.diff(maxFin.fin) > 0) {
        maxFin = c;
      }
    }

    this.premierCours = minDeb;
    this.dernierCours = maxFin;
  }

  private sortCours(field): any {
    this.cours.sort((l, r) => {
      return l[field].isBefore(r[field]) ? -1 : 1;
    });
  }
}
