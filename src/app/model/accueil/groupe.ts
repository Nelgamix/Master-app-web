import {Lien} from './lien';

export class Groupe {
  private nom: string;
  private liens: Array<Lien>;

  constructor(nom: string) {
    this.nom = nom;
    this.liens = [];
  }

  public getNom(): string {
    return this.nom;
  }

  public getLiens(): Array<Lien> {
    return this.liens;
  }

  ajoutLien(lien: Lien): boolean {
    const l = this.liens.length;
    return l + 1 === this.liens.push(lien);
  }
}