import {Lien} from './Lien';
import {IGroupe} from './interfaces';
import {Utils} from '../../Utils';

export class Groupe {
  private _nom: string;
  private readonly _liens: Lien[];

  static construct(e: IGroupe) {
    return new Groupe(
      e.nom,
      e.liens ? e.liens.map(Lien.construct) : []
    );
  }

  constructor(nom: string = '',
              liens: Lien[] = []) {
    this._nom = nom;
    this._liens = liens;
  }

  get nom(): string {
    return this._nom;
  }

  get liens(): Lien[] {
    return this._liens;
  }

  set nom(value: string) {
    this._nom = value;
  }

  format() {
    return Utils.bundleMinimalObject({
      nom: this.nom,
      liens: this.liens.map(e => e.format())
    });
  }
}
