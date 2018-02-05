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
  duree: any; // moment duration

  /**
   * Un objet contenant le compte des différents types de cours.
   * Ex: {'TD': 4, 'CM': 2}
   */
  typesCount: any;

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

  ajouterCours(cours: Cours): void {
    this.cours.push(cours);
  }

  analyse(): void {
    this.trierCours();

    this.compteDuree();
    this.compteTypes();
    this.debutFin();
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

  private compteDuree(): void {
    const total = moment.duration(0);

    for (const c of this.coursActifs) {
      total.add(moment.duration(c.fin.diff(c.debut)));
    }

    this.duree = total;
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
    return function(left, right) {
        return left[field].diff(right[field]) > 0;
    };
  }
}
