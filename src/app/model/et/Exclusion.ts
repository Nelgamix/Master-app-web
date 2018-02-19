import {Cours} from './Cours';

export class Exclusion {
  /**
   * Le type à matcher.
   */
  type: string;

  /**
   * Le nom à matcher.
   */
  nom: string;

  /**
   * Le professeur à matcher.
   */
  professeur: string;

  /**
   * La salle à matcher.
   */
  salle: string;

  /**
   * Doit-on cacher les cours qui correspondent à l'exclusion ou les supprimer?
   * Si vrai, alors il faut les supprimer.
   */
  supprimer: boolean;

  /**
   * Type de test: si vrai, on cherche uniquement une sous-chaîne, sinon on doit matcher complètement.
   */
  includes: boolean;

  /**
   * Le nombre de cours affectés par cette exclusion.
   */
  count: number;

  constructor(type: string, nom: string, professeur: string, salle: string, supprimer: boolean, includes: boolean, count: number = 0) {
    this.type = type;
    this.nom = nom;
    this.professeur = professeur;
    this.salle = salle;
    this.supprimer = supprimer;
    this.includes = includes;
    this.count = count;
  }

  /**
   * Permet de savoir si l'exclusion est vide ou pas.
   * @returns {boolean} vrai si l'exclusion est considérée comme 'vide', faux sinon.
   */
  estVide(): boolean {
    return this.type.length === 0 && this.nom.length === 0 && this.professeur.length === 0 && this.salle.length === 0;
  }

  /**
   * Duplique l'exclusion.
   * @returns {Exclusion} l'exclusion dupliquée.
   */
  clone(): Exclusion {
    return new Exclusion(this.type, this.nom, this.professeur, this.salle, this.supprimer, this.includes, this.count);
  }

  /**
   * Affiche le contenu de l'exclusion dans la console.
   */
  print(): void {
    console.log((this.type.length > 0 ? 'type: ' + this.type + ' ' : 'pas de type ')
        + (this.nom.length > 0 ? 'nom: ' + this.nom + ' ' : 'pas de nom ')
        + (this.professeur.length > 0 ? 'professeur: ' + this.professeur + ' ' : 'pas de professeur ')
        + (this.salle.length > 0 ? 'salle: ' + this.salle + ' ' : 'pas de salle ')
        + (this.supprimer ? 'supprimer ' : 'cacher ')
        + (this.includes ? 'include ' : 'full ')
        + ('count: ' + this.count));
  }

  /**
   * Teste l'exclusion sur plusieurs cours.
   * @param {Cours[]} cs
   * @returns {number}
   */
  testePlusieursCours(cs: Cours[]): number {
    let nb = 0;

    for (const c of cs) {
      if (this.testeCours(c)) {
        nb += 1;
      }
    }

    return nb;
  }

  /**
   * Teste l'exclusion sur un cours.
   * @param {Cours} c
   * @returns {boolean}
   */
  testeCours(c: Cours): boolean {
    // Teste les types.
    if (this.type.length > 0) {
      if (!this.testeCoursChamp(c, c.type.join('/'), this.type)) {
        return false;
      }
    }

    // Teste le nom.
    if (this.nom.length > 0) {
      if (!this.testeCoursChamp(c, c.nom, this.nom)) {
        return false;
      }
    }

    // Teste le professeur.
    if (this.professeur.length > 0) {
      if (!this.testeCoursChamp(c, c.professeur, this.professeur)) {
        return false;
      }
    }

    // Teste la salle.
    if (this.salle.length > 0) {
      if (!this.testeCoursChamp(c, c.salles.join(' '), this.salle)) {
        return false;
      }
    }

    // Le cours est affecté par l'exclusion, on incrémente son compteur et exclue le cours
    this.count++;

    if (this.supprimer) {
      c.supprime = true;
    } else {
      c.cache = true;
    }

    return true;
  }

  /**
   * Teste un champ unique de l'exclusion sur le cours.
   * @param {Cours} c
   * @param {string} champCours
   * @param {string} champExclusion
   * @returns {boolean}
   */
  private testeCoursChamp(c: Cours, champCours: string, champExclusion: string): boolean {
    return this.includes && champCours.includes(champExclusion) || !this.includes && champCours === champExclusion;
  }
}
